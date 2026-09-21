import Link from 'next/link';
import {GuideView} from '@/components/guide-view';
export const metadata={title:'状況から選ぶ｜災害の種類と家族構成で防災グッズを探す',description:'備えたい災害と家族構成を選ぶだけで、揃える順番とおすすめの防災グッズがわかります。'};
export default async function Page({searchParams}:{searchParams:Promise<{d?:string;h?:string}>}){
 const {d,h}=await searchParams;
 return <main className="page-wrap"><div className="breadcrumb"><Link href="/">ホーム</Link> / 状況から選ぶ</div>
  <div className="page-heading"><p className="overline">FIND BY YOUR SITUATION</p><h1>あなたの状況から、備えを選ぶ</h1><p>備えたい災害と家族構成を選ぶと、揃える順番とおすすめ商品が表示されます。</p></div>
  <GuideView initialDisaster={d||''} initialHouseholds={h?h.split(','):[]}/></main>
}
