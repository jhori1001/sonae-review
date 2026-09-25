import {amazonLinks} from './amazon-links.generated';
// Verified individual product URLs can replace these category-search destinations.
// Keep attribution explicit. No Rakuten override is configured here — Rakuten
// already links to each product's real URL directly (see lib/catalog.ts).
export const affiliateLinks:Record<string,{amazon?:string;rakuten?:string}>={};
// Public Amazon affiliate tag. Not a secret — it's meant to be visible in
// every outgoing link — so unlike the PA-API credentials (see
// import-amazon.mjs) it lives directly in source rather than .env.local.
export const AMAZON_ASSOCIATE_TAG='wanc0968-22';
function withAmazonTag(url:string){try{const u=new URL(url);if(AMAZON_ASSOCIATE_TAG)u.searchParams.set('tag',AMAZON_ASSOCIATE_TAG);return u.toString()}catch{return url}}
// amazonKeyword lets callers pass a real fetched product name (e.g. from
// Rakuten's API, see lib/rakuten.ts) for a more targeted tagged search than
// the generic category name.
export function shopLinks(id:string,category:string,amazonKeyword?:string){const configured=affiliateLinks[id];const safe=(url:string|undefined)=>{try{return url&&new URL(url).protocol==='https:'?url:undefined}catch{return undefined}};const amazon=safe(configured?.amazon)||safe(amazonLinks[id])||withAmazonTag(`https://www.amazon.co.jp/s?k=${encodeURIComponent(amazonKeyword||category)}`);const rakuten=safe(configured?.rakuten)||`https://search.rakuten.co.jp/search/mall/${encodeURIComponent(category)}/`;return {amazon,rakuten,configured:!!(safe(configured?.amazon)||safe(amazonLinks[id])||safe(configured?.rakuten))}}
