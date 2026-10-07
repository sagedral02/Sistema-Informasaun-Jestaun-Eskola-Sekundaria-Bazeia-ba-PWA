import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get('classroom_id');
    const teacherId = searchParams.get('teacher_id');
    const dayOfWeek = searchParams.get('day_of_week');

    let sql = `
      SELECT se.*,
             c.code as classroom_code, c.name as classroom_name,
             s.code as subject_code, s.name as subject_name,
             u.full_name as teacher_name
      FROM schedule_entries se
      JOIN classrooms c ON se.classroom_id = c.id
      JOIN subject_offerings so ON se.subject_offering_id = so.id
      JOIN subjects s ON so.subject_id = s.id
      JOIN users u ON se.teacher_id = u.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (classroomId) {
      params.push(classroomId);
      conditions.push(`se.classroom_id = $${params.length}`);
    }
    if (teacherId) {
      params.push(teacherId);
      conditions.push(`se.teacher_id = $${params.length}`);
    }
    if (dayOfWeek) {
      params.push(dayOfWeek);
      conditions.push(`se.day_of_week = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY se.day_of_week ASC, se.period_number ASC';

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
    const {
      academic_year_id,
      classroom_id,
      subject_offering_id,
      teacher_id,
      day_of_week,
      period_number,
      start_time,
      end_time,
      room_number,
    } = body;

    // Check collision
    const collisionCheck = await query(
      `SELECT se.id, u.full_name as teacher_name, c.name as classroom_name
       FROM schedule_entries se
       JOIN users u ON se.teacher_id = u.id
       JOIN classrooms c ON se.classroom_id = c.id
       WHERE se.academic_year_id = $1
         AND se.day_of_week = $2
         AND se.period_number = $3
         AND (se.teacher_id = $4 OR se.classroom_id = $5 OR se.room_number = $6)`,
      [academic_year_id, day_of_week, period_number, teacher_id, classroom_id, room_number]
    );

    if (collisionCheck.rows.length > 0) {
      const conflict = collisionCheck.rows[0];
      return NextResponse.json(
        {
          error: `Kolizaun oráriu detetadu! Mestre ${conflict.teacher_name} ka sala aula ${conflict.classroom_name} iha ona oráriu iha loron no periodu ne'e.`,
        },
        { status: 409 }
      );
    }

    const res = await query(
      `INSERT INTO schedule_entries (academic_year_id, classroom_id, subject_offering_id, teacher_id, day_of_week, period_number, start_time, end_time, room_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [academic_year_id, classroom_id, subject_offering_id, teacher_id, day_of_week, period_number, start_time, end_time, room_number]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
