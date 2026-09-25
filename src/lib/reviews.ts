import {getSql} from './db';
import {type Review} from './catalog';

export async function loadReviews(): Promise<{reviews: Review[]; unavailable: boolean}> {
  try {
    const sql = getSql();
    const result = await sql`
      SELECT id, product_id as productId, nickname, rating, title, body, created_at as createdAt
      FROM reviews ORDER BY created_at DESC LIMIT 500
    ` as {id: string; productid: string; nickname: string; rating: number; title: string; body: string; createdat: string}[];
    const images = await sql`
      SELECT id, review_id as reviewId, url FROM review_images ORDER BY position
    ` as {id: string; reviewid: string; url: string}[];
    const reviews: Review[] = result.map(r => ({
      id: r.id,
      productId: r.productid,
      nickname: r.nickname,
      rating: r.rating,
      title: r.title,
      body: r.body,
      createdAt: r.createdat,
      images: images.filter(i => i.reviewid === r.id).map(i => i.url),
    }));
    return {reviews: reviews, unavailable: false};
  } catch (error) {
    console.error('Review load failed', error);
    return {reviews: [], unavailable: true};
  }
}
