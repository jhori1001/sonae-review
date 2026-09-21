import {realProducts} from './real-products.generated';
export const categories=['簡易トイレ','ライト・ランタン','防災バッグ','ポータブル電源','非常食','モバイルバッテリー','飲料水','衛生用品','防寒用品','救急用品','ラジオ','家具転倒防止','ヘルメット','防災セット','子ども向け','女性向け','高齢者向け','ペット防災'];
export const disasters=['地震','台風','大雨','停電','避難'];
export type Product={id:string;name:string;brand:string;category:string;disasters:string[];price:number;tile?:number;short:string;size?:string;weight?:string;features?:string[];pros?:string;cons?:string;goodFor?:string;notFor?:string;added:string;image?:string;caption?:string;rakutenUrl?:string;rakutenReviewCount?:number;rakutenReviewAverage?:number;source?:'rakuten'};
export const products:Product[]=realProducts;
export type Review={id:string;productId:string;nickname:string;rating:number;title:string;body:string;images:string[];createdAt:string;demo?:boolean;tile?:number};
export function stats(id:string,reviews:Review[]=[]){const rows=reviews.filter(r=>r.productId===id);return {count:rows.length,average:rows.length?rows.reduce((s,r)=>s+r.rating,0)/rows.length:0}}
// Falls back to the real Rakuten review count/average when a product has no
// reviews of its own on this site yet (true for every freshly-imported real
// product — nobody here has reviewed them).
export function displayStats(product:Product,reviews:Review[]=[]){const own=stats(product.id,reviews);if(own.count)return own;if(product.rakutenReviewCount)return {count:product.rakutenReviewCount,average:product.rakutenReviewAverage||0};return own}
export const yen=(p:number)=>new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(p);
