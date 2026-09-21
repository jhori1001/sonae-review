import fs from 'node:fs';

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

const categoryDisasters = {
  '簡易トイレ':['地震','台風','大雨','避難'],'ライト・ランタン':['停電','地震','避難'],'防災バッグ':['地震','避難','台風','大雨'],
  'ポータブル電源':['停電','地震','台風'],'非常食':['地震','避難','台風'],'モバイルバッテリー':['停電','避難','地震'],
  '飲料水':['地震','台風','大雨','停電','避難'],'衛生用品':['地震','避難','台風'],'防寒用品':['地震','停電','避難'],
  '救急用品':['地震','台風','大雨','避難'],'ラジオ':['地震','台風','停電'],'家具転倒防止':['地震'],
  'ヘルメット':['地震','避難'],'防災セット':['地震','台風','大雨','停電','避難'],'子ども向け':['地震','避難'],
  '女性向け':['地震','避難'],'高齢者向け':['地震','避難'],'ペット防災':['地震','避難','台風'],
};

const disasterTerms = ['防災','非常','避難用','災害','震災','緊急'];
const negativeTerms = ['クールリング','ネッククーラー','冷感リング','ヘアドライタオル','ヘアターバン','着圧ソックス','両面テープ','ナノテープ','UVカット','紫外線','日焼け','通学','スクールバッグ','修学旅行'];

// PROXIMITY_MAX: category term and disaster term must appear within this
// many characters of each other in the raw name. This is what actually
// defeats SEO keyword-stuffing: a genuine "防災頭巾" or "介護 防災グッズ"
// product says both words close together; a stuffed unrelated product (a
// hair towel, a cooling ring) dumps "防災" far away in an unrelated keyword
// tail, so a same-position/whole-string substring check alone lets it
// through but a proximity check catches it.
const PROXIMITY_MAX = 18;

const categoryConfig = {
  '簡易トイレ': {query:'簡易トイレ 防災', nameMustInclude:['トイレ'], strict:false},
  'ライト・ランタン': {query:'防災 LEDランタン', nameMustInclude:['ランタン','ライト','懐中電灯'], strict:false},
  '防災バッグ': {query:'防災リュック', nameMustInclude:['リュック','バッグ','持ち出し袋','避難袋'], strict:true},
  'ポータブル電源': {query:'ポータブル電源 防災', nameMustInclude:['ポータブル電源','蓄電池'], strict:false},
  '非常食': {query:'非常食 5年保存', nameMustInclude:['非常食','保存食','アルファ米','防災食'], strict:false},
  'モバイルバッテリー': {query:'モバイルバッテリー 防災', nameMustInclude:['モバイルバッテリー'], strict:false},
  '飲料水': {query:'保存水 防災', nameMustInclude:['水'], strict:false},
  '衛生用品': {query:'防災 衛生用品', nameMustInclude:['ウェット','マスク','手袋','ティッシュ','トイレットペーパー','衛生','シャンプー'], strict:true},
  '防寒用品': {query:'防寒 防災グッズ', nameMustInclude:['カイロ','毛布','ブランケット','エマージェンシーシート','アルミシート','湯たんぽ','防寒'], strict:true},
  '救急用品': {query:'救急セット 防災', nameMustInclude:['救急'], strict:false},
  'ラジオ': {query:'防災ラジオ', nameMustInclude:['ラジオ'], strict:true},
  '家具転倒防止': {query:'家具転倒防止', nameMustInclude:['転倒防止','耐震','突っ張り'], strict:false},
  'ヘルメット': {query:'防災ヘルメット', nameMustInclude:['ヘルメット','頭巾','ずきん'], strict:true},
  '防災セット': {query:'防災セット', nameMustInclude:['防災セット','避難セット','非常持ち出し袋','防災グッズ'], strict:false},
  '子ども向け': {query:'子供用 防災頭巾', nameMustInclude:['子供','こども','キッズ','子ども'], strict:true},
  '女性向け': {query:'女性用 防災セット', nameMustInclude:['女性','レディース'], strict:true},
  '高齢者向け': {query:'高齢者 介護 防災', nameMustInclude:['高齢者','シニア','介護'], strict:true},
  'ペット防災': {query:'ペット 防災グッズ 避難', nameMustInclude:['ペット','犬','猫'], strict:true},
};
const categories = Object.keys(categoryConfig);

function slugify(itemCode) {
  return 'rk-' + itemCode.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function positionsOf(name, terms) {
  const positions = [];
  for (const t of terms) {
    let idx = name.indexOf(t);
    while (idx !== -1) { positions.push(idx); idx = name.indexOf(t, idx + 1); }
  }
  return positions;
}

function matchesCategory(name, config) {
  if (negativeTerms.some(t => name.includes(t))) return false;
  const categoryPositions = positionsOf(name, config.nameMustInclude);
  if (categoryPositions.length === 0) return false;
  if (!config.strict) return true;
  const disasterPositions = positionsOf(name, disasterTerms);
  if (disasterPositions.length === 0) return false;
  // Require at least one (category term, disaster term) pair within PROXIMITY_MAX chars.
  return categoryPositions.some(cp => disasterPositions.some(dp => Math.abs(cp - dp) <= PROXIMITY_MAX));
}

async function searchCategory(keyword, hits) {
  const url = new URL('https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701');
  url.searchParams.set('applicationId', env.RAKUTEN_APP_ID);
  url.searchParams.set('accessKey', env.RAKUTEN_ACCESS_KEY);
  url.searchParams.set('affiliateId', env.RAKUTEN_AFFILIATE_ID);
  url.searchParams.set('keyword', keyword);
  url.searchParams.set('hits', String(hits));
  url.searchParams.set('sort', '-reviewCount');
  url.searchParams.set('format', 'json');
  url.searchParams.set('formatVersion', '2');
  const res = await fetch(url.toString(), {
    headers: { referer: 'https://sonae-review.vercel.app/', origin: 'https://sonae-review.vercel.app' },
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`FAILED for ${keyword}:`, res.status, text.slice(0, 300));
    return [];
  }
  return (JSON.parse(text).Items) ?? [];
}

const seen = new Set();
const products = [];
let addedIndex = 0;
const shortfalls = [];

for (const category of categories) {
  const config = categoryConfig[category];
  console.log(`Fetching: ${category} (query: "${config.query}") ...`);
  const items = await searchCategory(config.query, 30);
  let countForCategory = 0;
  let rejected = 0;
  for (const item of items) {
    if (countForCategory >= 10) break;
    const id = slugify(item.itemCode);
    if (seen.has(id)) continue;
    if (!matchesCategory(item.itemName, config)) { rejected++; continue; }
    seen.add(id);
    const image = item.mediumImageUrls?.[0]?.replace('?_ex=128x128', '?_ex=400x400') || item.mediumImageUrls?.[0] || '';
    const short = (item.catchcopy || item.itemName || '').slice(0, 50);
    products.push({
      id,
      name: item.itemName.slice(0, 120),
      brand: item.shopName,
      category,
      disasters: categoryDisasters[category] || ['地震','避難'],
      price: item.itemPrice,
      short,
      image,
      caption: (item.itemCaption || '').slice(0, 400),
      rakutenUrl: item.affiliateUrl || item.itemUrl,
      rakutenReviewCount: item.reviewCount || 0,
      rakutenReviewAverage: item.reviewAverage || 0,
      added: `2026-09-${String(19 + (addedIndex % 10)).padStart(2, '0')}`,
      source: 'rakuten',
    });
    countForCategory++;
    addedIndex++;
  }
  console.log(`  -> kept ${countForCategory}, rejected ${rejected} (of ${items.length} fetched) for ${category}`);
  if (countForCategory < 10) shortfalls.push(category);
  await new Promise(r => setTimeout(r, 2500));
}

console.log(`\nTotal real products collected: ${products.length}`);
console.log('Categories under 10:', shortfalls);

const fileContent = `// AUTO-GENERATED by import-rakuten.mjs on ${new Date().toISOString()}.
// Real Rakuten Ichiba products (name/price/image/review count+average are
// genuine, fetched via the Rakuten Ichiba Item Search API, then filtered so
// the item's own name actually matches its assigned category — including a
// proximity check between the category term and a disaster term to defeat
// SEO keyword-stuffed unrelated listings). Editorial fields
// (features/pros/cons/goodFor/notFor) that lib/catalog.ts's hand-written
// products have are intentionally absent here — we have no basis to
// fabricate them for products nobody on this site has actually tried.
import type {Product} from './catalog';
export const realProducts: Product[] = ${JSON.stringify(products, null, 1)};
`;

fs.writeFileSync('lib/real-products.generated.ts', fileContent, 'utf8');
console.log('Wrote lib/real-products.generated.ts');
