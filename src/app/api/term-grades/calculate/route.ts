import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Presiza tama uluk iha sistema.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { academic_year_id, trimester_id, classroom_id, subject_offering_id } = body;

    // Get all students enrolled in this classroom
    const studentsRes = await query(
      `SELECT s.id FROM students s
       JOIN student_enrollments se ON s.id = se.student_id
       WHERE se.classroom_id = $1 AND se.status = 'ACTIVE'`,
      [classroom_id]
    );

    const calculatedGrades: any[] = [];

    await transaction(async (client) => {
      for (const st of studentsRes.rows) {
        // Fetch scores for this student, subject offering, and trimester
        const scoresRes = await client.query(
          `SELECT ss.score, at.code as type_code, at.default_weight
           FROM student_scores ss
           JOIN assessments a ON ss.assessment_id = a.id
           JOIN assessment_types at ON a.assessment_type_id = at.id
           JOIN teaching_assignments ta ON a.teaching_assignment_id = ta.id
           WHERE ss.student_id = $1
             AND a.trimester_id = $2
             AND ta.subject_offering_id = $3`,
          [st.id, trimester_id, subject_offering_id]
        );

        let finalScore = 0;
        if (scoresRes.rows.length > 0) {
          let cauScore: number | null = null;
          let formativeScores: number[] = [];

          for (const row of scoresRes.rows) {
            const sc = parseFloat(row.score);
            if (row.type_code === 'CAU') {
              cauScore = sc;
            } else {
              formativeScores.push(sc);
            }
          }

          const avgFormative =
            formativeScores.length > 0
              ? formativeScores.reduce((a, b) => a + b, 0) / formativeScores.length
              : 0;

          if (cauScore !== null && formativeScores.length > 0) {
            finalScore = avgFormative * 0.5 + cauScore * 0.5;
          } else if (cauScore !== null) {
            finalScore = cauScore;
          } else {
            finalScore = avgFormative;
          }
        }

        finalScore = Math.round(finalScore * 10) / 10;
        let letterGrade = 'D';
        if (finalScore >= 16) letterGrade = 'A';
        else if (finalScore >= 14) letterGrade = 'B';
        else if (finalScore >= 10) letterGrade = 'C';

        // Upsert term grade
        const tgRes = await client.query(
          `INSERT INTO term_grades (academic_year_id, trimester_id, student_id, subject_offering_id, final_score, letter_grade, is_locked)
           VALUES ($1, $2, $3, $4, $5, $6, FALSE)
           ON CONFLICT DO NOTHING
           RETURNING *`,
          [academic_year_id, trimester_id, st.id, subject_offering_id, finalScore, letterGrade]
        );

        if (tgRes.rows.length > 0) {
          calculatedGrades.push(tgRes.rows[0]);
        } else {
          const updateRes = await client.query(
            `UPDATE term_grades
             SET final_score = $5, letter_grade = $6, calculated_at = NOW()
             WHERE academic_year_id = $1 AND trimester_id = $2 AND student_id = $3 AND subject_offering_id = $4
             RETURNING *`,
            [academic_year_id, trimester_id, st.id, subject_offering_id, finalScore, letterGrade]
          );
          calculatedGrades.push(updateRes.rows[0]);
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Kalkulasaun nota trimestre finaliza ona ho susesu!',
      count: calculatedGrades.length,
      grades: calculatedGrades,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
