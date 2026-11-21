import {getSql} from './db';

export type Override = {productId: string; amazonUrl: string | null; updatedAt: string};

export async function loadOverrides(): Promise<{overrides: Override[]; unavailable: boolean}> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT product_id as productId, amazon_url as amazonUrl, updated_at as updatedAt FROM product_overrides
    ` as {productid: string; amazonurl: string | null; updatedat: string}[];
    return {
      overrides: rows.map(r => ({productId: r.productid, amazonUrl: r.amazonurl, updatedAt: r.updatedat})),
      unavailable: false,
    };
  } catch (error) {
    console.error('Override load failed', error);
    return {overrides: [], unavailable: true};
  }
}

export async function getOverride(productId: string): Promise<string | null> {
  try {
    const sql = getSql();
    const rows = await sql`SELECT amazon_url as amazonUrl FROM product_overrides WHERE product_id = ${productId}` as {amazonurl: string | null}[];
    return rows[0]?.amazonurl || null;
  } catch (error) {
    console.error('Override load failed', error);
    return null;
  }
}
