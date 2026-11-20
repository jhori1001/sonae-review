'use client';
import Link from 'next/link';
import { Crown, Clock3, Menu, Search } from 'lucide-react';

export function V2Header() {
  return (
    <header className="v2-header">
      <Link href="/v2" className="v2-brand">
        <span className="v2-brand-icon">🌸</span>
        <span className="v2-brand-text">
          <small>口コミの信頼度が丸わかり</small>
          <strong>そなえレビュー</strong>
        </span>
      </Link>
      <nav className="v2-header-icons" aria-label="メニュー">
        <Link href="/v2/ranking" aria-label="ランキング"><Crown size={20} /></Link>
        <Link href="/v2/products" aria-label="商品を探す"><Search size={20} /></Link>
        <Link href="/" aria-label="履歴・旧デザイン"><Clock3 size={20} /></Link>
        <Link href="/v2/categories" aria-label="カテゴリ一覧"><Menu size={20} /></Link>
      </nav>
    </header>
  );
}

export function V2SearchBand() {
  return (
    <div className="v2-search-band">
      <div className="v2-search-inner">
        <p className="v2-search-label">防災グッズを検索・比較<span className="tag">口コミ件数つき</span></p>
        <form action="/v2/products" className="v2-search-form">
          <input aria-label="商品名・カテゴリを検索" name="q" placeholder="商品名・カテゴリを入力" />
          <button type="submit">検索</button>
        </form>
        <div className="v2-popular">
          <span>人気の検索</span>
          {['簡易トイレ', '防災セット', 'モバイルバッテリー', 'ポータブル電源', 'ライト・ランタン'].map(x => (
            <Link key={x} href={`/v2/products?q=${encodeURIComponent(x)}`}>{x}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function V2Footer() {
  return (
    <footer className="v2-footer">
      <div className="v2-footer-inner">
        <p className="v2-footer-brand">🌸 そなえレビュー</p>
        <p>口コミの件数・評価をもとに、実際に選ばれている防災グッズをまとめています。楽天市場の商品情報・レビューをもとに表示しています。</p>
        <p style={{ marginTop: 10 }}>
          <Link href="/v2">トップ</Link> ・ <Link href="/v2/ranking">ランキング</Link> ・ <Link href="/v2/categories">カテゴリ</Link> ・ <Link href="/">旧デザインのそなえレビューへ</Link>
        </p>
        <p style={{ marginTop: 10, color: '#8a8f96' }}>© 2026 そなえレビュー（試験的な新デザインです）</p>
      </div>
    </footer>
  );
}
