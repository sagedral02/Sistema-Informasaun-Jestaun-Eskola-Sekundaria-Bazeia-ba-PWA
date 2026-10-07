import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academic_year_id');

    let sql = `
      SELECT c.*,
             gl.code as grade_level_code, gl.name as grade_level_name,
             m.code as major_code, m.name as major_name,
             u.full_name as homeroom_teacher_name,
             (SELECT count(*) FROM student_enrollments se WHERE se.classroom_id = c.id AND se.status = 'ACTIVE') as student_count
      FROM classrooms c
      JOIN grade_levels gl ON c.grade_level_id = gl.id
      JOIN majors m ON c.major_id = m.id
      LEFT JOIN users u ON c.homeroom_teacher_id = u.id
    `;
    const params: any[] = [];
    if (academicYearId) {
      sql += ' WHERE c.academic_year_id = $1';
      params.push(academicYearId);
    }
    sql += ' ORDER BY gl.order_index ASC, c.code ASC';

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
    const { academic_year_id, grade_level_id, major_id, code, name, room_number, capacity, homeroom_teacher_id } = body;

    const res = await query(
      `INSERT INTO classrooms (academic_year_id, grade_level_id, major_id, code, name, room_number, capacity, homeroom_teacher_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [academic_year_id, grade_level_id, major_id, code, name, room_number, capacity || 35, homeroom_teacher_id]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
