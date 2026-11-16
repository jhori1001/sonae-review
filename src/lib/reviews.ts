import {getSql} from './db';
import {type Review, type StatsMap} from './catalog';

type Row = {id: string; productid: string; nickname: string; rating: number; title: string; body: string; createdat: string; usage: string | null; household: string | null; helpful: string | number};

async function withImages(rows: Row[]): Promise<Review[]> {
  if (!rows.length) return [];
  const sql = await getSql();
  const ids = rows.map(r => r.id);
  const images = await sql`
    SELECT review_id as reviewId, url FROM review_images WHERE review_id = ANY(${ids}) ORDER BY position
  ` as {reviewid: string; url: string}[];
  return rows.map(r => ({
    id: r.id,
    productId: r.productid,
    nickname: r.nickname,
    rating: r.rating,
    title: r.title,
    body: r.body,
    createdAt: r.createdat,
    usage: r.usage || undefined,
    household: r.household || undefined,
    helpful: Number(r.helpful) || 0,
    images: images.filter(i => i.reviewid === r.id).map(i => i.url),
  }));
}

// All published reviews of one product. Loaded per product (not as a global
// "latest N" list) so older reviews never drop off a product page as the
// site grows.
export async function loadProductReviews(productId: string): Promise<{reviews: Review[]; unavailable: boolean}> {
  try {
    const sql = await getSql();
    const rows = await sql`
      SELECT r.id, r.product_id as productId, r.nickname, r.rating, r.title, r.body, r.created_at as createdAt, r.usage, r.household,
        (SELECT count(*) FROM review_helpful h WHERE h.review_id = r.id) as helpful
      FROM reviews r WHERE r.product_id = ${productId} AND r.status = 'published' ORDER BY r.created_at DESC
    ` as Row[];
    return {reviews: await withImages(rows), unavailable: false};
  } catch (error) {
    console.error('Review load failed', error);
    return {reviews: [], unavailable: true};
  }
}

export async function loadReview(id: string): Promise<{review?: Review; unavailable: boolean}> {
  try {
    const sql = await getSql();
    const rows = await sql`
      SELECT r.id, r.product_id as productId, r.nickname, r.rating, r.title, r.body, r.created_at as createdAt, r.usage, r.household,
        (SELECT count(*) FROM review_helpful h WHERE h.review_id = r.id) as helpful
      FROM reviews r WHERE r.id = ${id} AND r.status = 'published'
    ` as Row[];
    return {review: (await withImages(rows))[0], unavailable: false};
  } catch (error) {
    console.error('Review load failed', error);
    return {unavailable: true};
  }
}

// Per-product count/average aggregated in the database, plus a short search
// text (latest review titles) for the catalog's keyword search — instead of
// shipping every review body to the browser on listing pages.
export async function loadReviewStats(): Promise<{stats: StatsMap; searchText: Record<string, string>; unavailable: boolean}> {
  try {
    const sql = await getSql();
    const rows = await sql`
      SELECT product_id as productId, count(*) as count, avg(rating) as average,
        left(string_agg(title, ' ' ORDER BY created_at DESC), 600) as titles
      FROM reviews WHERE status = 'published' GROUP BY product_id
    ` as {productid: string; count: string | number; average: string | number; titles: string}[];
    const stats: StatsMap = {};
    const searchText: Record<string, string> = {};
    for (const r of rows) {
      stats[r.productid] = {count: Number(r.count), average: Number(r.average)};
      searchText[r.productid] = r.titles;
    }
    return {stats, searchText, unavailable: false};
  } catch (error) {
    console.error('Review stats load failed', error);
    return {stats: {}, searchText: {}, unavailable: true};
  }
}

export async function loadHelpfulVotes(userId: string | undefined, reviewIds: string[]): Promise<string[]> {
  if (!userId || !reviewIds.length) return [];
  try {
    const sql = await getSql();
    const rows = await sql`SELECT review_id as reviewId FROM review_helpful WHERE user_id = ${userId} AND review_id = ANY(${reviewIds})` as {reviewid: string}[];
    return rows.map(r => r.reviewid);
  } catch {
    return [];
  }
}
