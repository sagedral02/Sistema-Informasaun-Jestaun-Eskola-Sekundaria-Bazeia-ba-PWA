import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get('classroom_id');
    const academicYearId = searchParams.get('academic_year_id');

    if (!classroomId || !academicYearId) {
      return NextResponse.json(
        { error: 'classroom_id ho academic_year_id obrigatoriu' },
        { status: 400 }
      );
    }

    // Get current classroom info including grade level and major
    const classRes = await query(
      `
      SELECT c.*, gl.order_index, gl.code as grade_code, gl.name as grade_name, m.name as major_name
      FROM classrooms c
      JOIN grade_levels gl ON c.grade_level_id = gl.id
      JOIN majors m ON c.major_id = m.id
      WHERE c.id = $1
    `,
      [classroomId]
    );

    if (classRes.rows.length === 0) {
      return NextResponse.json({ error: 'Klas la hetan' }, { status: 404 });
    }
    const currentClass = classRes.rows[0];

    // Find next grade level if any
    const nextGradeRes = await query(
      `SELECT * FROM grade_levels WHERE order_index = $1 + 1 LIMIT 1`,
      [currentClass.order_index]
    );
    const nextGrade = nextGradeRes.rows[0] || null;

    // Get students currently enrolled
    const studentsRes = await query(
      `
      SELECT 
        s.id, s.student_no, s.full_name, s.gender, s.status as student_status,
        se.id as enrollment_id, se.status as enrollment_status,
        COALESCE(
          (SELECT ROUND(AVG(rc.average_score)::numeric, 1) FROM report_cards rc WHERE rc.student_id = s.id AND rc.academic_year_id = $2),
          (SELECT ROUND(AVG(tg.final_score)::numeric, 1) FROM term_grades tg WHERE tg.student_id = s.id AND tg.academic_year_id = $2),
          12.0
        ) as average_score
      FROM students s
      JOIN student_enrollments se ON s.id = se.student_id
      WHERE se.classroom_id = $1 AND se.academic_year_id = $2 AND se.status = 'ACTIVE'
      ORDER BY s.full_name ASC
    `,
      [classroomId, academicYearId]
    );

    // Calculate recommended actions
    const evaluatedStudents = studentsRes.rows.map((st: any) => {
      const avg = parseFloat(st.average_score) || 0;
      let recommendation = 'PASSA';
      let actionLabel = 'Passa ba Klas Tuir Mai';

      if (currentClass.order_index >= 3) {
        // Final grade (12º Ano)
        if (avg >= 10.0) {
          recommendation = 'GRADUADU';
          actionLabel = 'Gradua husi NOSSEF';
        } else {
          recommendation = 'RETEIN';
          actionLabel = 'Retein (Repete Klas 12)';
        }
      } else {
        // Grade 10 or 11
        if (avg >= 10.0) {
          recommendation = 'PASSA';
          actionLabel = nextGrade ? `Passa ba ${nextGrade.name}` : 'Passa';
        } else {
          recommendation = 'RETEIN';
          actionLabel = `Retein (Repete ${currentClass.grade_name})`;
        }
      }

      return {
        ...st,
        average_score: avg,
        recommendation,
        actionLabel,
        isEligible: avg >= 10.0,
      };
    });

    return NextResponse.json({
      currentClass,
      nextGrade,
      students: evaluatedStudents,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const {
      from_academic_year_id,
      to_academic_year_id,
      promotions,
    } = body;

    if (!from_academic_year_id || !Array.isArray(promotions) || promotions.length === 0) {
      return NextResponse.json({ error: 'Dadus promosaun la kompletu' }, { status: 400 });
    }

    const result = await transaction(async (client) => {
      let processed = 0;

      for (const p of promotions) {
        const { student_id, action, to_classroom_id, notes } = p;

        // 1. Mark current enrollment status
        const enrollmentStatusMap: Record<string, string> = {
          PASSA: 'PROMOTED',
          RETEIN: 'RETAINED',
          GRADUADU: 'GRADUATED',
        };
        const newEnrollmentStatus = enrollmentStatusMap[action] || 'COMPLETED';

        await client.query(
          `UPDATE student_enrollments 
           SET status = $1 
           WHERE student_id = $2 AND academic_year_id = $3`,
          [newEnrollmentStatus, student_id, from_academic_year_id]
        );

        // 2. If Graduated, update student record status
        if (action === 'GRADUADU') {
          await client.query(
            `UPDATE students SET status = 'GRADUADU', updated_at = NOW() WHERE id = $1`,
            [student_id]
          );

          await client.query(
            `INSERT INTO student_status_history (student_id, previous_status, new_status, reason, changed_by)
             VALUES ($1, 'ATIVU', 'GRADUADU', $2, $3)`,
            [student_id, notes || 'Graduadu ho susesu husi Eskola Secundaria Catolica NOSSEF', user.id]
          );
        } else if (to_academic_year_id && to_classroom_id) {
          // Get classroom grade level & major for the new enrollment
          const clsRes = await client.query(
            `SELECT grade_level_id, major_id FROM classrooms WHERE id = $1`,
            [to_classroom_id]
          );
          if (clsRes.rows.length > 0) {
            const { grade_level_id, major_id } = clsRes.rows[0];

            // Insert new enrollment for the next academic year
            await client.query(
              `
              INSERT INTO student_enrollments (
                academic_year_id, student_id, grade_level_id, major_id,
                classroom_id, enrollment_date, status
              ) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 'ACTIVE')
            `,
              [to_academic_year_id, student_id, grade_level_id, major_id, to_classroom_id]
            );

            // Update student status history
            await client.query(
              `INSERT INTO student_status_history (student_id, previous_status, new_status, reason, changed_by)
               VALUES ($1, 'ATIVU', $2, $3, $4)`,
              [student_id, action, notes || `Promosaun ba ano letivo foun (${action})`, user.id]
            );
          }
        }
        processed++;
      }

      return { count: processed };
    });

    return NextResponse.json({
      ok: true,
      message: `Prosesu promosaun susesu ba estudante ${result.count}!`,
      count: result.count,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
