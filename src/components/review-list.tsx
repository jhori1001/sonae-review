'use client';
import {useState} from 'react';
import {NativeSelect} from './ui/native-select';
import {ReviewCard} from './review-card';
import {type Review,usageLabels} from '@/lib/catalog';
// Sort and filter controls for one product's reviews. Everything is already
// loaded for the product, so this runs entirely in the browser.
export function ReviewList({reviews,voted}:{reviews:Review[];voted:string[]}){
 const [sort,setSort]=useState('new'),[rating,setRating]=useState(''),[usage,setUsage]=useState(''),[photos,setPhotos]=useState(false);
 const shown=reviews.filter(r=>(!rating||r.rating===Number(rating))&&(!usage||r.usage===usage)&&(!photos||r.images.length>0)).sort((a,b)=>sort==='helpful'?(b.helpful||0)-(a.helpful||0)||b.createdAt.localeCompare(a.createdAt):sort==='high'?b.rating-a.rating||b.createdAt.localeCompare(a.createdAt):sort==='low'?a.rating-b.rating||b.createdAt.localeCompare(a.createdAt):b.createdAt.localeCompare(a.createdAt));
 return <div><div className="review-controls">
  <label>並び替え<NativeSelect value={sort} onChange={e=>setSort(e.target.value)}><option value="new">新しい順</option><option value="helpful">役に立った順</option><option value="high">評価が高い順</option><option value="low">評価が低い順</option></NativeSelect></label>
  <label>評価<NativeSelect value={rating} onChange={e=>setRating(e.target.value)}><option value="">すべて</option>{[5,4,3,2,1].map(n=><option key={n} value={n}>★{n}</option>)}</NativeSelect></label>
  <label>使用状況<NativeSelect value={usage} onChange={e=>setUsage(e.target.value)}><option value="">すべて</option>{Object.entries(usageLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</NativeSelect></label>
  <label className="check"><input type="checkbox" checked={photos} onChange={e=>setPhotos(e.target.checked)}/>写真つきのみ</label>
 </div>
 <p className="muted">{shown.length}件を表示中</p>
 {shown.length?shown.map(r=><ReviewCard key={r.id} review={r} voted={voted.includes(r.id)}/>):<p className="muted">条件に合う口コミはありません。</p>}</div>
}
