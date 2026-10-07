import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teachingAssignmentId = searchParams.get('teaching_assignment_id');
    const trimesterId = searchParams.get('trimester_id');

    let sql = `
      SELECT a.*,
             at.code as assessment_type_code, at.name as assessment_type_name,
             t.name as trimester_name, t.number as trimester_number,
             (SELECT count(*) FROM student_scores ss WHERE ss.assessment_id = a.id) as score_count
      FROM assessments a
      JOIN assessment_types at ON a.assessment_type_id = at.id
      JOIN trimestres t ON a.trimester_id = t.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (teachingAssignmentId) {
      params.push(teachingAssignmentId);
      conditions.push(`a.teaching_assignment_id = $${params.length}`);
    }
    if (trimesterId) {
      params.push(trimesterId);
      conditions.push(`a.trimester_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY a.date_administered DESC';

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
    const { teaching_assignment_id, trimester_id, assessment_type_id, title, max_score, date_administered } = body;

    const res = await query(
      `INSERT INTO assessments (teaching_assignment_id, trimester_id, assessment_type_id, title, max_score, date_administered, is_locked)
       VALUES ($1, $2, $3, $4, $5, $6, FALSE)
       RETURNING *`,
      [teaching_assignment_id, trimester_id, assessment_type_id, title, max_score || 20.0, date_administered]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
