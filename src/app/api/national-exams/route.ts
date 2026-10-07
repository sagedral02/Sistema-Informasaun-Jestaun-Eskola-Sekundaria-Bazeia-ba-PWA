import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academic_year_id');

    let sql = `
      SELECT ne.*,
             s.student_no, s.full_name as student_name, s.gender,
             ay.code as academic_year_code
      FROM national_exam_records ne
      JOIN students s ON ne.student_id = s.id
      JOIN academic_years ay ON ne.academic_year_id = ay.id
    `;
    const params: any[] = [];
    if (academicYearId) {
      sql += ' WHERE ne.academic_year_id = $1';
      params.push(academicYearId);
    }
    sql += ' ORDER BY ne.final_average DESC';

    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || (!user.roles.includes('SUPER_ADMIN') && !user.roles.includes('CURRICULUM_ADMIN') && !user.roles.includes('SCHOOL_ADMIN'))) {
    return NextResponse.json({ error: 'La iha autorizasaun.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      student_id,
      academic_year_id,
      exam_year,
      exam_number,
      portugues_score,
      ingles_score,
      matematika_score,
      spesifika_score,
    } = body;

    const p = parseFloat(portugues_score);
    const i = parseFloat(ingles_score);
    const m = parseFloat(matematika_score);
    const s = parseFloat(spesifika_score);

    const final_average = Math.round(((p + i + m + s) / 4) * 100) / 100;
    const status = final_average >= 10.0 ? 'LIU' : 'LA_LIU';

    const res = await query(
      `INSERT INTO national_exam_records (student_id, academic_year_id, exam_year, exam_number, portugues_score, ingles_score, matematika_score, spesifika_score, final_average, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [student_id, academic_year_id, exam_year, exam_number, p, i, m, s, final_average, status]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
