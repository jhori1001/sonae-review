import {realProducts} from './real-products.generated';
export const categories=['簡易トイレ','ライト・ランタン','防災バッグ','ポータブル電源','非常食','モバイルバッテリー','飲料水','衛生用品','防寒用品','救急用品','ラジオ','家具転倒防止','ヘルメット','防災セット','子ども向け','女性向け','高齢者向け','ペット防災'];
export const disasters=['地震','台風','大雨','停電','避難'];
export type Product={id:string;name:string;brand:string;category:string;disasters:string[];price:number;tile?:number;short:string;size?:string;weight?:string;features?:string[];pros?:string;cons?:string;goodFor?:string;notFor?:string;added:string;image?:string;caption?:string;rakutenUrl?:string;rakutenReviewCount?:number;rakutenReviewAverage?:number;source?:'rakuten'};
export const products:Product[]=realProducts;
export type Review={id:string;productId:string;nickname:string;rating:number;title:string;body:string;images:string[];createdAt:string;usage?:string;household?:string;helpful?:number;demo?:boolean;tile?:number};
// How the poster has used the product — shown on each review and filterable,
// since "used it during an actual disaster" and "bought it, still in the box"
// are very different kinds of evidence.
export const usageLabels:Record<string,string>={disaster:'災害時に実際に使った',tried:'試しに使ってみた',stocked:'備蓄しているだけ（未使用）'};
export const households=['一人暮らし','夫婦・パートナーと','子どもがいる家庭','高齢の家族がいる','ペットがいる','その他'];
export type Stats={count:number;average:number};
export type StatsMap=Record<string,Stats>;
export function stats(id:string,reviews:Review[]=[]):Stats{const rows=reviews.filter(r=>r.productId===id);return {count:rows.length,average:rows.length?rows.reduce((s,r)=>s+r.rating,0)/rows.length:0}}
// Falls back to the real Rakuten review count/average when a product has no
// reviews of its own on this site yet (true for every freshly-imported real
// product — nobody here has reviewed them). `source` says which one it is so
// every place that shows the number can say whose number it is.
export function displayStats(product:Product,own:StatsMap={}):Stats&{source:'site'|'rakuten'|'none'}{const s=own[product.id];if(s?.count)return {...s,source:'site'};if(product.rakutenReviewCount)return {count:product.rakutenReviewCount,average:product.rakutenReviewAverage||0,source:'rakuten'};return {count:0,average:0,source:'none'}}
export const yen=(p:number)=>new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(p);
// Rakuten product names are SEO-stuffed: a run of promotional badges
// (【P10倍UP★...】「楽天総合1位」...) followed by the actual product name,
// then a long tail of repeated keywords. Strip the leading badges and cap
// the length so titles stay readable in cards, page headings, and <title>.
const LEADING_BADGE=/^[【「＜(（\[][^】」＞)）\]]*[】」＞)）\]]\s*/;
export function shortName(name:string,max=28){
 let s=name.trim();
 while(LEADING_BADGE.test(s))s=s.replace(LEADING_BADGE,'').trim();
 if(!s)s=name.trim();
 if(s.length<=max)return s;
 const cut=s.slice(0,max);
 const lastSpace=cut.lastIndexOf(' ');
 return (lastSpace>max*0.6?cut.slice(0,lastSpace):cut).trim()+'…';
}
