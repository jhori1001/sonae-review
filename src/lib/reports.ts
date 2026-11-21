import {getSql} from './db';

export type Report = {id: string; reviewId: string; userId: string; reason: string; createdAt: string; status: string};

export async function loadReports(): Promise<{reports: Report[]; unavailable: boolean}> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, review_id as reviewId, user_id as userId, reason, created_at as createdAt, status
      FROM reports ORDER BY created_at DESC LIMIT 500
    ` as {id: string; reviewid: string; userid: string; reason: string; createdat: string; status: string}[];
    return {
      reports: rows.map(r => ({id: r.id, reviewId: r.reviewid, userId: r.userid, reason: r.reason, createdAt: r.createdat, status: r.status})),
      unavailable: false,
    };
  } catch (error) {
    console.error('Report load failed', error);
    return {reports: [], unavailable: true};
  }
}
