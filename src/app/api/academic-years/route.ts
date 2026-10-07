import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const res = await query(`
      SELECT ay.*,
        (SELECT count(*) FROM student_enrollments se WHERE se.academic_year_id = ay.id) as student_count,
        (SELECT count(*) FROM classrooms cr WHERE cr.academic_year_id = ay.id) as classroom_count
      FROM academic_years ay
      ORDER BY ay.start_date DESC
    `);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || (!user.roles.includes('SUPER_ADMIN') && !user.roles.includes('CURRICULUM_ADMIN'))) {
    return NextResponse.json({ error: 'La iha autorizasaun.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { code, name, start_date, end_date } = body;

    const res = await query(
      `INSERT INTO academic_years (code, name, start_date, end_date, is_active, is_closed)
       VALUES ($1, $2, $3, $4, FALSE, FALSE)
       RETURNING *`,
      [code, name, start_date, end_date]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
