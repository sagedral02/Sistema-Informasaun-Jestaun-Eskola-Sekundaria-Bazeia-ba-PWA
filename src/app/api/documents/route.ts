import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const res = await query(`
      SELECT gd.*,
             s.student_no, s.full_name as student_name
      FROM generated_documents gd
      LEFT JOIN students s ON gd.student_id = s.id
      ORDER BY gd.generated_at DESC
    `);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || (!user.roles.includes('SUPER_ADMIN') && !user.roles.includes('SCHOOL_ADMIN'))) {
    return NextResponse.json({ error: 'La iha autorizasaun.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { document_type, student_id, template_name } = body;

    const countRes = await query('SELECT count(*) FROM generated_documents');
    const num = parseInt(countRes.rows[0].count, 10) + 1;
    const document_number = `DOC-NOSSEF-2026-${String(num).padStart(4, '0')}`;

    const res = await query(
      `INSERT INTO generated_documents (document_type, document_number, student_id, template_name, generated_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [document_type, document_number, student_id, template_name]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
