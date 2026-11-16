'use client';
import {useState} from 'react';
import {resizeRakuten} from '@/lib/product-images';
// Large product photo with thumbnails to switch between the shop's images.
// Requests a 700px version from Rakuten and falls back to the stored URL if
// that size isn't served.
export function ProductGallery({images,name}:{images:string[];name:string}){
 const [index,setIndex]=useState(0);const [failed,setFailed]=useState<Record<string,boolean>>({});
 const src=(url:string,size:number)=>failed[url]?url:resizeRakuten(url,size);
 if(!images.length)return <div className="gallery-main gallery-empty" role="img" aria-label={`${name}の画像はありません`}/>;
 const current=images[Math.min(index,images.length-1)];
 return <div className="gallery">
  <div className="gallery-main"><img src={src(current,700)} alt={name} onError={()=>setFailed(f=>({...f,[current]:true}))}/></div>
  {images.length>1&&<div className="gallery-thumbs" role="tablist" aria-label="商品画像">{images.map((url,i)=><button key={url} type="button" role="tab" aria-selected={i===index} className={i===index?'active':''} onClick={()=>setIndex(i)}><img src={src(url,160)} alt={`${name}の画像 ${i+1}`} loading="lazy" onError={()=>setFailed(f=>({...f,[url]:true}))}/></button>)}</div>}
 </div>
}
