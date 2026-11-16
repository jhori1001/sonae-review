import {cleanCaption} from '@/lib/product-text';
// The shop's description, cleaned up (lib/product-text.ts) and laid out as
// feature points, set contents and a spec table instead of one run-on paragraph.
export function ProductDescription({caption}:{caption?:string}){
 const c=cleanCaption(caption);const empty=!c.points.length&&!c.contents.length&&!c.specs.length&&!c.text;
 return <section className="product-description">
  <div className="description-head"><h2>商品の特徴</h2><p className="muted">楽天市場の商品説明から、配送・セールの案内などを除いて抜粋しています。</p></div>
  {empty&&<p className="muted">商品説明を取得できませんでした。詳細はショップページをご確認ください。</p>}
  {c.points.length>0&&<ul className="feature-points">{c.points.map(x=><li key={x.title}><strong>{x.title}</strong><span>{x.text}</span></li>)}</ul>}
  {c.text&&<p className="description-text">{c.text}</p>}
  {c.contents.length>0&&<div><h3>セット内容（{c.contents.length}点）</h3><ul className="set-contents">{c.contents.map(x=><li key={x}>{x}</li>)}</ul></div>}
  {c.specs.length>0&&<div><h3>仕様</h3><table className="spec-table"><tbody>{c.specs.map(x=><tr key={x.label}><th>{x.label}</th><td>{x.value}</td></tr>)}</tbody></table></div>}
 </section>
}
