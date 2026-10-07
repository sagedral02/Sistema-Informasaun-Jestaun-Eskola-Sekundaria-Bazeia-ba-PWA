import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM library_books';
    const params: any[] = [];
    if (search) {
      sql += ' WHERE title ILIKE $1 OR author ILIKE $1 OR isbn ILIKE $1';
      params.push(`%${search}%`);
    }
    sql += ' ORDER BY title ASC';

    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || (!user.roles.includes('SUPER_ADMIN') && !user.roles.includes('LIBRARIAN'))) {
    return NextResponse.json({ error: 'La iha autorizasaun.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { isbn, title, author, publisher, publication_year, category, total_copies } = body;

    const res = await query(
      `INSERT INTO library_books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
       RETURNING *`,
      [isbn, title, author, publisher, publication_year, category, total_copies || 1]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
