import Link from 'next/link';
import {OPERATOR_NAME, PRIVACY_UPDATED, SITE_NAME} from '@/lib/site-info';
export const metadata={title:'プライバシーポリシー'};
export default function Page(){return <main className="page-wrap prose"><div className="breadcrumb"><Link href="/">ホーム</Link> / プライバシーポリシー</div><div className="page-heading"><h1>プライバシーポリシー</h1><p>{SITE_NAME}（運営：{OPERATOR_NAME}）が、利用者の情報をどう扱うかを定めます。</p></div>
<h2>取得する情報</h2><ul><li>口コミの投稿内容：ニックネーム、評価、タイトル、本文、使用状況、家族構成（任意）、写真</li><li>端末を区別するためのCookie（<code>sv_id</code>）：ランダムな識別子で、氏名などとは結びつきません</li><li>IPアドレスから作った不可逆なハッシュ値：IPアドレスそのものは保存しません</li><li>お問い合わせの内容：お名前、メールアドレス、お問い合わせ本文</li></ul>
<h2>利用目的</h2><ul><li>口コミの掲載と、「役に立った」の集計</li><li>同じ商品への重複投稿・連続投稿・荒らしの防止</li><li>通報やお問い合わせへの対応</li><li>サイトの不具合の調査と改善</li></ul>
<h2>写真の位置情報</h2><p>スマートフォンの写真には、撮影場所の位置情報（GPS）などが記録されていることがあります。投稿された写真は、公開前にこうした情報（EXIF・XMPなど）を取り除いてから保存します。写真に写り込んだ住所・表札・顔などは取り除けないため、投稿前にご確認ください。</p>
<h2>第三者への提供</h2><p>法令にもとづく場合を除き、本人の同意なく個人情報を第三者に提供しません。</p>
<h2>利用している外部サービス</h2><ul><li>Vercel（サイトの配信、写真の保存）</li><li>Neon（口コミなどのデータベース）</li><li>Amazonアソシエイト、楽天アフィリエイト（購入先へのリンク）：リンク先のサイトでは、それぞれの事業者がCookieなどで情報を取得することがあります。各社のプライバシーポリシーをご確認ください。</li></ul>
<h2>開示・訂正・削除の請求</h2><p>ご自身の投稿や個人情報の開示・訂正・削除をご希望の場合は、<Link href="/contact">お問い合わせフォーム</Link>からご連絡ください。投稿を特定できるよう、口コミのURLを添えてください。</p>
<h2>改定</h2><p>このポリシーは必要に応じて改定し、このページでお知らせします。</p><p className="muted">制定・最終改定：{PRIVACY_UPDATED}</p></main>}
