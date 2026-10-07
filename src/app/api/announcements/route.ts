import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const res = await query(`
      SELECT a.*, u.full_name as published_by_name
      FROM announcements a
      LEFT JOIN users u ON a.published_by = u.id
      WHERE a.is_published = TRUE
      ORDER BY a.is_pinned DESC, a.published_at DESC
    `);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || (!user.roles.includes('SUPER_ADMIN') && !user.roles.includes('PRINCIPAL') && !user.roles.includes('SCHOOL_ADMIN'))) {
    return NextResponse.json({ error: 'La iha autorizasaun.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, content, target_audience, is_pinned } = body;

    const res = await query(
      `INSERT INTO announcements (title, content, target_audience, is_pinned, is_published, published_at, published_by)
       VALUES ($1, $2, $3, $4, TRUE, NOW(), $5)
       RETURNING *`,
      [title, content, target_audience || 'HOTU', is_pinned || false, user.id]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
