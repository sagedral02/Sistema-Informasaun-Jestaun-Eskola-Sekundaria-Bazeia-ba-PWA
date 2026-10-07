import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academic_year_id');

    let sql = `
      SELECT t.*, ay.code as academic_year_code
      FROM trimestres t
      JOIN academic_years ay ON t.academic_year_id = ay.id
    `;
    const params: any[] = [];
    if (academicYearId) {
      sql += ' WHERE t.academic_year_id = $1';
      params.push(academicYearId);
    }
    sql += ' ORDER BY t.number ASC';

    const res = await query(sql, params);
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
    const { academic_year_id, number, name, start_date, end_date } = body;
    // PRD: CAU number matches trimester number
    const cau_number = number;

    const res = await query(
      `INSERT INTO trimestres (academic_year_id, number, name, cau_number, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [academic_year_id, number, name, cau_number, start_date, end_date]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
