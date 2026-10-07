import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academic_year_id');
    const gradeLevelId = searchParams.get('grade_level_id');

    let sql = `
      SELECT so.*,
             s.code as subject_code, s.name as subject_name,
             gl.code as grade_level_code, gl.name as grade_level_name,
             m.code as major_code, m.name as major_name
      FROM subject_offerings so
      JOIN subjects s ON so.subject_id = s.id
      JOIN grade_levels gl ON so.grade_level_id = gl.id
      JOIN majors m ON so.major_id = m.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (academicYearId) {
      params.push(academicYearId);
      conditions.push(`so.academic_year_id = $${params.length}`);
    }
    if (gradeLevelId) {
      params.push(gradeLevelId);
      conditions.push(`so.grade_level_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY gl.order_index ASC, s.code ASC';

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
    const { academic_year_id, grade_level_id, major_id, subject_id, weekly_periods, passing_score, credit_hours } = body;

    const res = await query(
      `INSERT INTO subject_offerings (academic_year_id, grade_level_id, major_id, subject_id, weekly_periods, passing_score, credit_hours)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [academic_year_id, grade_level_id, major_id, subject_id, weekly_periods || 4, passing_score || 10.0, credit_hours || 2]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
