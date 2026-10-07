import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const res = await query(`
      SELECT ap.*,
             ay.code as academic_year_code,
             (SELECT count(*) FROM applicants a WHERE a.admission_period_id = ap.id) as applicant_count
      FROM admission_periods ap
      JOIN academic_years ay ON ap.academic_year_id = ay.id
      ORDER BY ap.start_date DESC
    `);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || (!user.roles.includes('SUPER_ADMIN') && !user.roles.includes('ADMISSION_OFFICER') && !user.roles.includes('SCHOOL_ADMIN'))) {
    return NextResponse.json({ error: 'La iha autorizasaun.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { code, name, academic_year_id, start_date, end_date } = body;

    const res = await query(
      `INSERT INTO admission_periods (code, name, academic_year_id, start_date, end_date, is_open)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING *`,
      [code, name, academic_year_id, start_date, end_date]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
