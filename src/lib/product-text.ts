// Cleans up Rakuten listing text for display. Shop-written names and
// captions are full of things that aren't about the product: HTML entities
// that were never decoded (&#x2b50;), shipping/coupon notices, ranking
// boasts, decorative stars and emoji. This keeps the product facts and
// turns 【見出し】本文 runs into bullet points.

const ENTITIES: Record<string, string> = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', yen: '¥', times: '×', hellip: '…'};
export function decodeEntities(s: string) {
  return s
    .replace(/&#x([0-9a-f]+);?/gi, (_, h) => safeCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);?/g, (_, d) => safeCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}
function safeCodePoint(n: number) {
  try { return String.fromCodePoint(n); } catch { return ''; }
}

// Pictographs and decorative symbols shops use as bullets or eye-catchers.
const DECOR = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}★☆◎○●◇◆□■▼▽▲△♪♫＼／\\]+/gu;
// A segment mentioning any of these is about the shop, not the product.
const NOISE = /配送|お届け|発送|注文|日付指定|決済|クーポン|ポイント|ラッピング|のし|在庫|送料|営業日|メーカー希望小売価格|ランキング|楽天|レビュー|販売総数|突破|ご了承|お知らせ|ショップ|店舗|あす楽|当店|お問い合わせ|ご確認ください|現在のページ|一覧|SALE|OFF|割引|最安|セール|倍|致しかねます|いたしかねます|お手数|お買い求め|場合がございます|モニター|ご覧ください/i;

function tidy(s: string) {
  return s.replace(DECOR, ' ').replace(/[ 　\t]+/g, ' ').replace(/^[\s・、。:：!！]+|[\s・、:：]+$/g, '').trim();
}

export type CleanCaption = {points: {title: string; text: string}[]; contents: string[]; specs: {label: string; value: string}[]; text: string};

export function cleanCaption(raw: string | undefined): CleanCaption {
  if (!raw) return {points: [], contents: [], specs: [], text: ''};
  const decoded = decodeEntities(raw).replace(/<[^>]+>/g, ' ');
  // Split on 【heading】 markers and on the symbols shops use to start a new line of notice.
  const pieces = decoded.split(/(【[^】]{1,40}】)|[※▼■◆●◎]|★★|\s{2,}|　{1,}/).filter((x): x is string => !!x && !!x.trim());
  const points: {title: string; text: string}[] = [];
  const loose: string[] = [];
  // Captions were cut at 400 characters on import, so the last sentence of
  // a full-length caption is usually unfinished: drop it.
  const truncated = (raw.length >= 390 && raw.length <= 400) || raw.length >= 1190;
  let heading = '', afterNoise = false;
  pieces.forEach((piece, index) => {
    const h = piece.match(/^【([^】]+)】$/);
    if (h) {
      const title = tidy(h[1]);
      afterNoise = !title || NOISE.test(title);
      heading = afterNoise ? '' : title;
      return;
    }
    // Text right after a notice heading (【最短お届け】と、お急ぎ…) is part of that notice.
    if (afterNoise) { afterNoise = false; return; }
    let sentences = piece.split(/(?<=[。！!])/);
    if (truncated && index === pieces.length - 1 && !/[。！!）)」]\s*$/.test(piece)) {
      // Drop the unfinished tail: the whole last sentence if there are others, else just its last word.
      const last = sentences.pop() || '';
      const cut = Math.max(last.lastIndexOf(' '), last.lastIndexOf('　'), last.lastIndexOf('/'));
      if (!sentences.length && cut > 0) sentences.push(last.slice(0, cut));
    }
    // Drop whole sentences that are shop notices, keep the rest of the piece.
    const kept = sentences.filter(s => !NOISE.test(s)).map(tidy).filter(s => s.length > 1).join('');
    if (!kept) { heading = ''; return; }
    if (heading) { points.push({title: heading, text: kept}); heading = ''; }
    else loose.push(kept);
  });
  let text = loose.join(' ').replace(/\s+/g, ' ').trim();
  // Sets list their contents as "セット内容 ・A・B・C"; show that as a list.
  let contents: string[] = [];
  const set = text.match(/セット内容\s*[:：]?\s*・?(.+?)(?=注意|。|$)/);
  if (set) {
    contents = splitTopLevel(set[1]);
    if (contents.length >= 3) text = text.replace(set[0], ' ').replace(/商品(名|情報)(\s*[^\s・]+(\s[^\s・]+)?)?/g, ' ').replace(/\s+/g, ' ').trim();
    else contents = [];
  }
  // Spec sheets are written as "ラベル：値 ラベル：値 …"; show them as a table,
  // whether they sit under a 【製品仕様】 heading or in the loose text.
  const specs: {label: string; value: string}[] = [];
  for (const point of [...points]) {
    const found = extractSpecs(point.text);
    if (found.specs.length) { specs.push(...found.specs); points.splice(points.indexOf(point), 1); }
  }
  const loose_ = extractSpecs(text);
  specs.push(...loose_.specs);
  text = loose_.rest;
  text = text.replace(/(^|\s)(商品情報|商品名|数量|商品説明)(?=\s|$)/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length < 15 && (points.length || contents.length || specs.length)) text = '';
  // Captions are cut at a fixed length on import; end on a sentence boundary when possible.
  const lastStop = Math.max(text.lastIndexOf('。'), text.lastIndexOf('！'));
  if (lastStop > text.length * 0.5) text = text.slice(0, lastStop + 1);
  return {points: points.slice(0, 6), contents, specs: specs.slice(0, 14), text};
}

export function cleanShort(raw: string) {
  const truncated = raw.length >= 48;
  const s = tidy(decodeEntities(raw).replace(/【[^】]*】|\[[^\]]*\]|＜[^＞]*＞/g, ' '));
  if (NOISE.test(s) && s.length < 20) return '';
  // Catch copies were cut at 50 characters on import; end on a sentence when there is one.
  const stop = Math.max(s.lastIndexOf('。'), s.lastIndexOf('！'), s.lastIndexOf('!'));
  return truncated && stop > 10 ? s.slice(0, stop + 1) : s;
}

// Splits "A・B（C・D）・E" on the ・ that aren't inside brackets.
function splitTopLevel(s: string) {
  const out: string[] = [];
  let depth = 0, current = '';
  for (const ch of s) {
    if ('(（「['.includes(ch)) depth++;
    if (')）」]'.includes(ch)) depth = Math.max(0, depth - 1);
    if (ch === '・' && depth === 0) { out.push(current); current = ''; } else current += ch;
  }
  out.push(current);
  return out.map(x => x.trim()).filter(Boolean);
}

function extractSpecs(text: string) {
  const pairs = [...text.matchAll(/([^\s：:／/・]{1,14})[：:]\s*(.+?)(?=\s+[^\s：:／/・]{1,14}[：:]|$)/g)];
  if (pairs.length < 3) return {specs: [], rest: text};
  const specs = pairs.map(m => ({label: m[1], value: m[2].trim()})).filter(x => x.value && x.label !== '商品名');
  // Long values mean the shop ran several fields together without spaces;
  // splitting those would produce wrong label/value pairs, so leave it as text.
  if (specs.some(x => x.value.length > 80 || x.label.length > 12)) return {specs: [], rest: text};
  return {specs, rest: text.slice(0, pairs[0].index).replace(/製品仕様|商品仕様|仕様/g, '').trim()};
}
