import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get('classroom_id');
    const teacherId = searchParams.get('teacher_id');

    let sql = `
      SELECT ta.*,
             c.code as classroom_code, c.name as classroom_name,
             s.name as subject_name, s.code as subject_code,
             u.full_name as teacher_name
      FROM teaching_assignments ta
      JOIN classrooms c ON ta.classroom_id = c.id
      JOIN subject_offerings so ON ta.subject_offering_id = so.id
      JOIN subjects s ON so.subject_id = s.id
      JOIN users u ON ta.teacher_id = u.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (classroomId) {
      params.push(classroomId);
      conditions.push(`ta.classroom_id = $${params.length}`);
    }
    if (teacherId) {
      params.push(teacherId);
      conditions.push(`ta.teacher_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY c.code ASC, s.name ASC';

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
    const { academic_year_id, classroom_id, subject_offering_id, teacher_id } = body;

    const res = await query(
      `INSERT INTO teaching_assignments (academic_year_id, classroom_id, subject_offering_id, teacher_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [academic_year_id, classroom_id, subject_offering_id, teacher_id]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
