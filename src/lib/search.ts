// Normalizes text for matching regardless of full/half-width or
// hiragana/katakana differences, so searching in either kana script
// finds the same results (product names are a mix of both).
export function normalizeForSearch(s: string): string {
  return s.normalize('NFKC').toLowerCase().replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));
}
