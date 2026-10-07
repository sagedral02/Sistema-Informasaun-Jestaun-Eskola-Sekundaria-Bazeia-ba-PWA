import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get('classroom_id');
    const trimesterId = searchParams.get('trimester_id');
    const studentId = searchParams.get('student_id');

    let sql = `
      SELECT rc.*,
             s.student_no, s.full_name as student_name, s.gender,
             c.code as classroom_code, c.name as classroom_name,
             t.name as trimester_name, t.number as trimester_number,
             ay.code as academic_year_code
      FROM report_cards rc
      JOIN students s ON rc.student_id = s.id
      JOIN classrooms c ON rc.classroom_id = c.id
      JOIN trimestres t ON rc.trimester_id = t.id
      JOIN academic_years ay ON rc.academic_year_id = ay.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (classroomId) {
      params.push(classroomId);
      conditions.push(`rc.classroom_id = $${params.length}`);
    }
    if (trimesterId) {
      params.push(trimesterId);
      conditions.push(`rc.trimester_id = $${params.length}`);
    }
    if (studentId) {
      params.push(studentId);
      conditions.push(`rc.student_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY rc.rank_in_class ASC NULLS LAST, s.full_name ASC';

    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || (!user.roles.includes('SUPER_ADMIN') && !user.roles.includes('HOMEROOM_TEACHER') && !user.roles.includes('SCHOOL_ADMIN'))) {
    return NextResponse.json({ error: 'La iha autorizasaun.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { academic_year_id, trimester_id, classroom_id } = body;

    const generated = await transaction(async (client) => {
      // Find students in class
      const stdRes = await client.query(
        `SELECT s.id, s.full_name
         FROM students s
         JOIN student_enrollments se ON s.id = se.student_id
         WHERE se.classroom_id = $1 AND se.status = 'ACTIVE'`,
        [classroom_id]
      );

      const reportCards: any[] = [];

      for (const st of stdRes.rows) {
        // Calculate average from term grades
        const tgRes = await client.query(
          `SELECT tg.final_score, tg.letter_grade, tg.subject_offering_id
           FROM term_grades tg
           WHERE tg.academic_year_id = $1 AND tg.trimester_id = $2 AND tg.student_id = $3`,
          [academic_year_id, trimester_id, st.id]
        );

        let totalScore = 0;
        let avgScore = 0;
        if (tgRes.rows.length > 0) {
          totalScore = tgRes.rows.reduce((sum: number, r: any) => sum + parseFloat(r.final_score), 0);
          avgScore = Math.round((totalScore / tgRes.rows.length) * 10) / 10;
        }

        // Upsert report card
        const rcRes = await client.query(
          `INSERT INTO report_cards (academic_year_id, trimester_id, student_id, classroom_id, total_score, average_score, status, published_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'PUBLISHED', NOW())
           RETURNING *`,
          [academic_year_id, trimester_id, st.id, classroom_id, totalScore, avgScore]
        );
        const rc = rcRes.rows[0];

        // Add subjects
        for (const sub of tgRes.rows) {
          await client.query(
            `INSERT INTO report_card_subjects (report_card_id, subject_offering_id, score, letter_grade)
             VALUES ($1, $2, $3, $4)`,
            [rc.id, sub.subject_offering_id, sub.final_score, sub.letter_grade]
          );
        }

        reportCards.push(rc);
      }

      return reportCards;
    });

    return NextResponse.json({
      success: true,
      message: 'Boletin de notas jera ona ho susesu!',
      count: generated.length,
      reportCards: generated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
