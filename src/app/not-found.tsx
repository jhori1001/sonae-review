import Link from 'next/link';
export default function NotFound(){return <main className="page-wrap"><div className="empty-state"><h2>ページが見つかりませんでした</h2><p>URLが変わったか、掲載を終了した可能性があります。</p><p><Link className="text-link" href="/products">商品を探す</Link>　/　<Link className="text-link" href="/guide">状況から選ぶ</Link>　/　<Link className="text-link" href="/">トップへ</Link></p></div></main>}
