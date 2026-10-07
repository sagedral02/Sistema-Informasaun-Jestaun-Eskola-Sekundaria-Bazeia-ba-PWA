import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get('classroom_id');
    const date = searchParams.get('date');

    let sql = `
      SELECT ats.*,
             c.code as classroom_code, c.name as classroom_name,
             u.full_name as recorded_by_name,
             (SELECT count(*) FROM attendance_records ar WHERE ar.session_id = ats.id AND ar.status = 'PREZENTE') as present_count,
             (SELECT count(*) FROM attendance_records ar WHERE ar.session_id = ats.id AND ar.status = 'FALTA') as absent_count,
             (SELECT count(*) FROM attendance_records ar WHERE ar.session_id = ats.id AND ar.status = 'LISENSA') as leave_count,
             (SELECT count(*) FROM attendance_records ar WHERE ar.session_id = ats.id AND ar.status = 'MORAS') as sick_count
      FROM attendance_sessions ats
      JOIN classrooms c ON ats.classroom_id = c.id
      JOIN users u ON ats.recorded_by = u.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (classroomId) {
      params.push(classroomId);
      conditions.push(`ats.classroom_id = $${params.length}`);
    }
    if (date) {
      params.push(date);
      conditions.push(`ats.session_date = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY ats.session_date DESC, ats.created_at DESC';

    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Presiza tama uluk iha sistema.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      academic_year_id,
      trimester_id,
      classroom_id,
      schedule_entry_id,
      session_date,
      session_mode,
      records, // Array of { student_id, status, notes }
    } = body;

    const result = await transaction(async (client) => {
      const sessRes = await client.query(
        `INSERT INTO attendance_sessions (academic_year_id, trimester_id, classroom_id, schedule_entry_id, session_date, session_mode, recorded_by, is_submitted, submitted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, NOW())
         RETURNING *`,
        [academic_year_id, trimester_id, classroom_id, schedule_entry_id, session_date, session_mode || 'DAILY', user.id]
      );
      const session = sessRes.rows[0];

      if (records && Array.isArray(records)) {
        for (const rec of records) {
          await client.query(
            `INSERT INTO attendance_records (session_id, student_id, status, notes)
             VALUES ($1, $2, $3, $4)`,
            [session.id, rec.student_id, rec.status || 'PREZENTE', rec.notes || '']
          );
        }
      }

      return session;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
