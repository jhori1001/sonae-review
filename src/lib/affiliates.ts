// Verified individual product URLs can replace these category-search destinations.
// Keep attribution explicit. No affiliate account or price API is configured yet.
export const affiliateLinks:Record<string,{amazon?:string;rakuten?:string}>={};
// Public Amazon affiliate tag. Not a secret — it's meant to be visible in
// every outgoing link — so unlike the Creators API credentials it lives
// directly in source rather than .dev.vars.
export const AMAZON_ASSOCIATE_TAG='wanc0968-22';
function withAmazonTag(url:string){try{const u=new URL(url);if(AMAZON_ASSOCIATE_TAG)u.searchParams.set('tag',AMAZON_ASSOCIATE_TAG);return u.toString()}catch{return url}}
// amazonKeyword lets callers pass a real fetched product name (e.g. from
// Rakuten's API, see lib/rakuten.ts) for a more targeted tagged search than
// the generic category name.
export function shopLinks(id:string,category:string,amazonKeyword?:string){const configured=affiliateLinks[id];const safe=(url:string|undefined)=>{try{return url&&new URL(url).protocol==='https:'?url:undefined}catch{return undefined}};const amazon=safe(configured?.amazon)||withAmazonTag(`https://www.amazon.co.jp/s?k=${encodeURIComponent(amazonKeyword||category)}`);const rakuten=safe(configured?.rakuten)||`https://search.rakuten.co.jp/search/mall/${encodeURIComponent(category)}/`;return {amazon,rakuten,configured:!!(safe(configured?.amazon)||safe(configured?.rakuten))}}
