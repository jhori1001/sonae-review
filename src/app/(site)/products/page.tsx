import {CatalogView} from '@/components/catalog-view';
import {loadReviews} from '@/lib/reviews';
export const metadata={title:'防災グッズを探す'};
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string>>}){const initial=await searchParams;const data=await loadReviews();return <main className="page-wrap"><div className="breadcrumb"><a href="/">ホーム</a> / 商品を探す</div><div className="page-heading"><p className="overline">FIND YOUR ESSENTIALS</p><h1>あなたの暮らしに合う、備えを。</h1><p>楽天市場の商品情報をもとに掲載しています。評価は楽天のレビューと当サイトへの口コミをもとにしています。</p></div>{data.unavailable&&<p className="notice">現在、投稿された口コミを読み込めません。</p>}<CatalogView reviews={data.reviews} initial={initial}/></main>}
