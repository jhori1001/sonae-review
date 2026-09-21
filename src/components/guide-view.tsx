'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {products,categories,type Product} from '@/lib/catalog';
import {ProductCard} from './site';

const disasterList=['地震','台風','大雨','停電','避難'] as const;
const disasterEssentials:Record<string,string[]>={
 '地震':['防災セット','防災バッグ','ヘルメット','家具転倒防止','簡易トイレ','飲料水','非常食','救急用品'],
 '台風':['防災セット','ライト・ランタン','ラジオ','モバイルバッテリー','飲料水','非常食','簡易トイレ'],
 '大雨':['防災バッグ','救急用品','ライト・ランタン','防災セット','飲料水','ラジオ'],
 '停電':['ポータブル電源','モバイルバッテリー','ライト・ランタン','ラジオ','非常食','防寒用品'],
 '避難':['防災バッグ','防災セット','簡易トイレ','衛生用品','防寒用品','飲料水','非常食'],
};
const households=[
 {id:'solo',label:'一人暮らし',extra:['防災セット'],note:'コンパクトで1人分が揃うものから。'},
 {id:'family',label:'家族・二人以上',extra:['防災セット','飲料水'],note:'人数分の水・食料を先に確保します。'},
 {id:'kids',label:'子どもがいる',extra:['子ども向け','衛生用品'],note:'防災頭巾など、子ども用を先に。'},
 {id:'senior',label:'高齢者と同居',extra:['高齢者向け','衛生用品','防寒用品'],note:'介護・トイレ・防寒まわりを重視します。'},
 {id:'pet',label:'ペットと暮らす',extra:['ペット防災'],note:'同行避難に必要なものを追加します。'},
 {id:'woman',label:'女性',extra:['女性向け','衛生用品'],note:'衛生用品や女性向けセットを重視します。'},
] as const;
const reasons:Record<string,string>={
 '防災セット':'まず一式で揃える定番。','防災バッグ':'すぐ持ち出せる状態にしておく。','ヘルメット':'落下物から頭を守る。','家具転倒防止':'家の中のケガを防ぐ。',
 '簡易トイレ':'断水・避難所のトイレ対策。','飲料水':'1人1日3L、最低3日分。','非常食':'火を使わず食べられる備蓄。','救急用品':'小さなケガに自分で対応。',
 'ライト・ランタン':'停電時の明かりを確保。','ラジオ':'通信が途切れても情報を得る。','モバイルバッテリー':'スマホの電源を確保。','ポータブル電源':'長引く停電に。',
 '防寒用品':'冬の停電・避難所の寒さ対策。','衛生用品':'水が使えない時の清潔を保つ。','子ども向け':'子ども専用の防災用品。','高齢者向け':'介護や持病に配慮したもの。',
 '女性向け':'女性の避難生活に配慮したもの。','ペット防災':'ペットと一緒の避難に。',
};
const top=(category:string)=>products.filter(p=>p.category===category).sort((a:Product,b:Product)=>(b.rakutenReviewCount||0)*(b.rakutenReviewAverage||0)-(a.rakutenReviewCount||0)*(a.rakutenReviewAverage||0)).slice(0,3);

export function GuideView({initialDisaster='',initialHouseholds=[]}:{initialDisaster?:string;initialHouseholds?:string[]}){
 const [disaster,setDisaster]=useState(initialDisaster);
 const [picked,setPicked]=useState<string[]>(initialHouseholds);
 const toggle=(id:string)=>setPicked(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
 const extras:string[]=households.filter(h=>picked.includes(h.id)).flatMap(h=>h.extra);
 const base=disaster?disasterEssentials[disaster]:[];
 const ordered=[...new Set([...extras,...base])].filter(c=>(categories as readonly string[]).includes(c));
 const forYou=new Set<string>(extras);
 return <>
  <section className="guide-step"><h2><span>1</span>備えたい災害を選ぶ</h2>
   <div className="chip-row">{disasterList.map(d=><button type="button" key={d} className={`chip ${disaster===d?'on':''}`} aria-pressed={disaster===d} onClick={()=>setDisaster(disaster===d?'':d)}>{d}</button>)}</div>
  </section>
  <section className="guide-step"><h2><span>2</span>あてはまる家族構成を選ぶ<small>（複数OK）</small></h2>
   <div className="chip-row">{households.map(h=><button type="button" key={h.id} className={`chip ${picked.includes(h.id)?'on':''}`} aria-pressed={picked.includes(h.id)} onClick={()=>toggle(h.id)}>{h.label}</button>)}</div>
   {households.filter(h=>picked.includes(h.id)).map(h=><p key={h.id} className="muted guide-note">{h.label}：{h.note}</p>)}
  </section>
  {!disaster&&!picked.length?<div className="empty-state"><h2>上の2つを選ぶと、揃える順番が表示されます</h2><p>まずは備えたい災害から選んでみてください。</p></div>:
   <section className="guide-result"><h2>あなたにおすすめの備え{disaster&&<>（{disaster}）</>}</h2>
    {ordered.map((c,i)=>{const items=top(c);return <div className="guide-block" key={c}>
     <div className="guide-block-head"><span className="guide-num">{i+1}</span><div><h3>{c}{forYou.has(c)&&<em>あなたの家庭向け</em>}</h3><p className="muted">{reasons[c]}</p></div><Link href={`/categories/${(categories as readonly string[]).indexOf(c)}`}>もっと見る<ArrowRight size={15}/></Link></div>
     <div className="product-grid three">{items.map(p=><ProductCard key={p.id} product={p}/>)}</div>
    </div>})}
   </section>}
 </>;
}
