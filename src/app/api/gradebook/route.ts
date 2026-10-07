import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get('classroom_id');
    const trimesterId = searchParams.get('trimester_id');
    const teachingAssignmentId = searchParams.get('teaching_assignment_id');

    if (!classroomId || !trimesterId) {
      return NextResponse.json({ error: 'classroom_id no trimester_id obrigatoriu.' }, { status: 400 });
    }

    // 1. Get students enrolled in classroom
    const studentsRes = await query(
      `SELECT s.id, s.student_no, s.full_name, s.gender
       FROM students s
       JOIN student_enrollments se ON s.id = se.student_id
       WHERE se.classroom_id = $1 AND se.status = 'ACTIVE'
       ORDER BY s.full_name ASC`,
      [classroomId]
    );

    // 2. Get assessments for this teaching assignment & trimester
    let assessmentsSql = `
      SELECT a.*, at.code as type_code, at.name as type_name
      FROM assessments a
      JOIN assessment_types at ON a.assessment_type_id = at.id
      WHERE a.trimester_id = $1
    `;
    const assParams: any[] = [trimesterId];
    if (teachingAssignmentId) {
      assessmentsSql += ' AND a.teaching_assignment_id = $2';
      assParams.push(teachingAssignmentId);
    }
    assessmentsSql += ' ORDER BY a.date_administered ASC';

    const assessmentsRes = await query(assessmentsSql, assParams);

    // 3. Get all scores
    const scoresRes = await query(
      `SELECT ss.*
       FROM student_scores ss
       JOIN assessments a ON ss.assessment_id = a.id
       WHERE a.trimester_id = $1`,
      [trimesterId]
    );

    // 4. Get finalized term grades
    const termGradesRes = await query(
      `SELECT tg.*
       FROM term_grades tg
       WHERE tg.trimester_id = $1`,
      [trimesterId]
    );

    return NextResponse.json({
      students: studentsRes.rows,
      assessments: assessmentsRes.rows,
      scores: scoresRes.rows,
      termGrades: termGradesRes.rows,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
