import type {Product} from './catalog';

// Hand-picked replacements for products whose Rakuten images are mostly
// advertising banners: {productId: [imageUrl, ...]}. Use image URLs the shop
// itself publishes on Rakuten (or your own photos), not images copied from
// other sites.
export const imageOverrides: Record<string, string[]> = {};

// Rakuten's thumbnail server resizes on the fly via `_ex=WxH`; listing data
// stores 400x400, which looks soft on the large product photo.
export function resizeRakuten(url: string, size: number) {
  try {
    const u = new URL(url);
    if (u.hostname !== 'thumbnail.image.rakuten.co.jp') return url;
    u.searchParams.set('_ex', `${size}x${size}`);
    return u.toString();
  } catch {
    return url;
  }
}

export function productImages(product: Product): string[] {
  const list = imageOverrides[product.id] ?? (product.images?.length ? product.images : product.image ? [product.image] : []);
  return [...new Set(list)];
}
