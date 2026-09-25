import {CatalogView} from '@/components/catalog-view';
import {loadReviews} from '@/lib/reviews';
export const metadata={title:'口コミから選ぶ防災グッズランキング'};
export const dynamic='force-dynamic';
export default async function Page(){const data=await loadReviews();return <main className="page-wrap"><div className="breadcrumb"><a href="/">ホーム</a> / ランキング</div><div className="page-heading"><p className="overline">COMMUNITY FAVORITES</p><h1>使った人の評価から、選ぼう。</h1><p>評価の単純平均で集計。同点の場合は商品掲載順です。楽天市場のレビュー評価と当サイトの口コミをもとにしたランキングです。</p></div>{data.unavailable&&<p className="notice">投稿された口コミを読み込めないため、楽天の評価のみ表示しています。</p>}<CatalogView reviews={data.reviews} ranking/></main>}
