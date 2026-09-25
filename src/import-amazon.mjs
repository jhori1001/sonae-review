// Resolve real Amazon.co.jp product links for the catalog via the Product
// Advertising API (PA-API 5.0) SearchItems operation, matched by product
// name, mirroring import-rakuten.mjs's approach for Rakuten.
//
// PA-API credentials are NOT available just by signing up for Amazon
// Associates. Amazon only issues them once the associate tag has generated
// at least 3 qualifying referral sales within the trailing 180 days
// (https://webservices.amazon.com/paapi5/documentation/). Until then this
// script will authenticate but every request comes back 403
// InvalidClientTokenId / TooManyRequests-style errors, or simply won't have
// credentials to run with at all.
//
// Setup once you have access:
//   1. Amazon Associates Central -> Tools -> Product Advertising API ->
//      "Request credentials", after qualifying.
//   2. Add to .env.local (repo root, gitignored):
//        AMAZON_PAAPI_ACCESS_KEY=...
//        AMAZON_PAAPI_SECRET_KEY=...
//        AMAZON_PARTNER_TAG=wanc0968-22   (optional, defaults to this)
//   3. Run: node import-amazon.mjs
//
// Output: lib/amazon-links.generated.ts, a plain {productId: url} map that
// lib/affiliates.ts merges in ahead of the generic tagged-search fallback.
import fs from 'node:fs';
import crypto from 'node:crypto';

const envText = fs.readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(
  envText.split('\n').filter(l => l.includes('=')).map(l => {
    const i = l.indexOf('=');
    const key = l.slice(0, i);
    let val = l.slice(i + 1);
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    return [key, val];
  })
);

const ACCESS_KEY = env.AMAZON_PAAPI_ACCESS_KEY;
const SECRET_KEY = env.AMAZON_PAAPI_SECRET_KEY;
const PARTNER_TAG = env.AMAZON_PARTNER_TAG || 'wanc0968-22';
if (!ACCESS_KEY || !SECRET_KEY) {
  console.error('Missing AMAZON_PAAPI_ACCESS_KEY / AMAZON_PAAPI_SECRET_KEY in .env.local.');
  console.error('See the header of this file for how to get PA-API credentials.');
  process.exit(1);
}

// Japan marketplace signing constants (differ per marketplace; see PA-API docs).
const HOST = 'webservices.amazon.co.jp';
const REGION = 'us-west-2';
const SERVICE = 'ProductAdvertisingAPI';
const MARKETPLACE = 'www.amazon.co.jp';
const PATH = '/paapi5/searchitems';
const TARGET = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';

function hmac(key, str) { return crypto.createHmac('sha256', key).update(str, 'utf8').digest(); }
function sha256Hex(str) { return crypto.createHash('sha256').update(str, 'utf8').digest('hex'); }

function signingKey(secretKey, dateStamp) {
  const kDate = hmac('AWS4' + secretKey, dateStamp);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  return hmac(kService, 'aws4_request');
}

async function searchItem(keywords) {
  const payload = JSON.stringify({
    PartnerTag: PARTNER_TAG,
    PartnerType: 'Associates',
    Marketplace: MARKETPLACE,
    Keywords: keywords,
    SearchIndex: 'All',
    ItemCount: 1,
    Resources: ['ItemInfo.Title', 'Offers.Listings.Price'],
  });

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';
  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${HOST}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${TARGET}\n`;
  const canonicalRequest = ['POST', PATH, '', canonicalHeaders, signedHeaders, sha256Hex(payload)].join('\n');

  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, sha256Hex(canonicalRequest)].join('\n');
  const signature = crypto.createHmac('sha256', signingKey(SECRET_KEY, dateStamp)).update(stringToSign, 'utf8').digest('hex');
  const authorization = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`https://${HOST}${PATH}`, {
    method: 'POST',
    headers: {
      'content-encoding': 'amz-1.0',
      'content-type': 'application/json; charset=utf-8',
      host: HOST,
      'x-amz-date': amzDate,
      'x-amz-target': TARGET,
      Authorization: authorization,
    },
    body: payload,
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`FAILED for "${keywords}":`, res.status, text.slice(0, 400));
    return null;
  }
  const data = JSON.parse(text);
  const item = data.SearchResult?.Items?.[0];
  if (!item) return null;
  return `https://www.amazon.co.jp/dp/${item.ASIN}?tag=${encodeURIComponent(PARTNER_TAG)}`;
}

const generatedSource = fs.readFileSync('lib/real-products.generated.ts', 'utf8');
const match = generatedSource.match(/realProducts: Product\[\] = (\[[\s\S]*\]);/);
if (!match) {
  console.error('Could not find the product array in lib/real-products.generated.ts. Run import-rakuten.mjs first.');
  process.exit(1);
}
const products = JSON.parse(match[1]);

const links = {};
let matched = 0;
for (const [i, product] of products.entries()) {
  const keywords = product.name.slice(0, 80);
  console.log(`[${i + 1}/${products.length}] ${keywords}`);
  try {
    const url = await searchItem(keywords);
    if (url) { links[product.id] = url; matched++; }
    else console.log('  -> no match');
  } catch (e) {
    console.error(`  -> error:`, e.message);
  }
  // PA-API's default rate limit for low-volume associates is ~1 request/second.
  await new Promise(r => setTimeout(r, 1100));
}

console.log(`\nMatched ${matched}/${products.length} products.`);

const fileContent = `// AUTO-GENERATED by import-amazon.mjs on ${new Date().toISOString()}.
// Real Amazon.co.jp product links resolved via the Product Advertising API
// (PA-API 5.0) SearchItems operation, matched by product name. Empty until
// import-amazon.mjs has been run with valid PA-API credentials — see that
// file's header comment for setup. Until then lib/affiliates.ts falls back
// to a tagged Amazon search link per product.
export const amazonLinks: Record<string, string> = ${JSON.stringify(links, null, 1)};
`;

fs.writeFileSync('lib/amazon-links.generated.ts', fileContent, 'utf8');
console.log('Wrote lib/amazon-links.generated.ts');
