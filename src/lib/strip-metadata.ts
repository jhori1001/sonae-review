// Removes EXIF / XMP / IPTC / text metadata from uploaded photos before they
// are stored publicly. Phone photos carry GPS coordinates in EXIF, and
// preparedness photos are usually taken at home, so leaving it in would
// publish the poster's address. The browser already re-encodes photos
// (components/review-form.tsx), which drops metadata too; this is the
// server-side guarantee for uploads that skip that step.
//
// Only container-level metadata blocks are removed — pixel data is copied
// byte for byte, so nothing is re-compressed.

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

function concat(parts: Uint8Array[]) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) { out.set(p, offset); offset += p.length; }
  return out;
}

function stripJpeg(bytes: Uint8Array) {
  const parts: Uint8Array[] = [bytes.subarray(0, 2)];
  let i = 2;
  while (i + 4 <= bytes.length) {
    if (bytes[i] !== 0xff) throw new Error('Malformed JPEG');
    const marker = bytes[i + 1];
    if (marker === 0xff) { i++; continue; } // fill byte
    if (marker === 0xda) { parts.push(bytes.subarray(i)); return concat(parts); } // start of scan: rest is image data
    const length = (bytes[i + 2] << 8) | bytes[i + 3];
    const end = i + 2 + length;
    if (length < 2 || end > bytes.length) throw new Error('Malformed JPEG');
    // APP1 = EXIF/XMP, APP13 = IPTC, other APPn = vendor data, COM = comment.
    // Keep APP0 (JFIF), APP14 (Adobe colour transform) and the ICC profile in APP2.
    const isApp = marker >= 0xe0 && marker <= 0xef;
    const keep = !isApp && marker !== 0xfe || marker === 0xe0 || marker === 0xee || marker === 0xe2 && ascii(bytes, i + 4, 11) === 'ICC_PROFILE';
    if (keep) parts.push(bytes.subarray(i, end));
    i = end;
  }
  throw new Error('Malformed JPEG');
}

const PNG_DROP = new Set(['eXIf', 'tEXt', 'zTXt', 'iTXt', 'tIME']);
function stripPng(bytes: Uint8Array) {
  const parts: Uint8Array[] = [bytes.subarray(0, 8)];
  let i = 8;
  while (i + 12 <= bytes.length) {
    const length = new DataView(bytes.buffer, bytes.byteOffset + i).getUint32(0);
    const type = ascii(bytes, i + 4, 4);
    const end = i + 12 + length;
    if (end > bytes.length) throw new Error('Malformed PNG');
    if (!PNG_DROP.has(type)) parts.push(bytes.subarray(i, end));
    i = end;
    if (type === 'IEND') return concat(parts);
  }
  throw new Error('Malformed PNG');
}

function stripWebp(bytes: Uint8Array) {
  const parts: Uint8Array[] = [];
  let i = 12;
  while (i + 8 <= bytes.length) {
    const type = ascii(bytes, i, 4);
    const size = new DataView(bytes.buffer, bytes.byteOffset + i + 4).getUint32(0, true);
    const end = i + 8 + size + (size % 2);
    if (i + 8 + size > bytes.length) throw new Error('Malformed WebP');
    if (type !== 'EXIF' && type !== 'XMP ') {
      const chunk = bytes.slice(i, Math.min(end, bytes.length));
      if (type === 'VP8X') chunk[8] &= ~(0x08 | 0x04); // clear the "has EXIF" / "has XMP" flags
      parts.push(chunk);
    }
    i = end;
  }
  const body = concat(parts);
  const header = new Uint8Array(12);
  header.set(bytes.subarray(0, 12));
  new DataView(header.buffer).setUint32(4, body.length + 4, true);
  return concat([header, body]);
}

export function stripMetadata(bytes: Uint8Array, type: 'image/jpeg' | 'image/png' | 'image/webp'): Uint8Array {
  if (type === 'image/jpeg') return stripJpeg(bytes);
  if (type === 'image/png') return stripPng(bytes);
  return stripWebp(bytes);
}
