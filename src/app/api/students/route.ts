import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const classroomId = searchParams.get('classroom_id');
    const gradeLevelId = searchParams.get('grade_level_id');
    const status = searchParams.get('status');

    let sql = `
      SELECT s.*,
             se.classroom_id, se.grade_level_id, se.major_id,
             c.code as classroom_code, c.name as classroom_name,
             gl.code as grade_level_code, gl.name as grade_level_name,
             m.code as major_code, m.name as major_name,
             g.full_name as guardian_name, g.phone as guardian_phone
      FROM students s
      LEFT JOIN student_enrollments se ON s.id = se.student_id AND se.status = 'ACTIVE'
      LEFT JOIN classrooms c ON se.classroom_id = c.id
      LEFT JOIN grade_levels gl ON se.grade_level_id = gl.id
      LEFT JOIN majors m ON se.major_id = m.id
      LEFT JOIN student_guardians sg ON s.id = sg.student_id AND sg.is_primary = TRUE
      LEFT JOIN guardians g ON sg.guardian_id = g.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(s.full_name ILIKE $${params.length} OR s.student_no ILIKE $${params.length})`);
    }
    if (classroomId) {
      params.push(classroomId);
      conditions.push(`se.classroom_id = $${params.length}`);
    }
    if (gradeLevelId) {
      params.push(gradeLevelId);
      conditions.push(`se.grade_level_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`s.status = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY s.full_name ASC';

    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || (!user.roles.includes('SUPER_ADMIN') && !user.roles.includes('SCHOOL_ADMIN'))) {
    return NextResponse.json({ error: 'La iha autorizasaun.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      full_name,
      gender,
      birth_date,
      birth_place,
      address,
      phone,
      entry_year,
      classroom_id,
      grade_level_id,
      major_id,
      academic_year_id,
      guardian_name,
      guardian_relationship,
      guardian_phone,
    } = body;

    const countRes = await query('SELECT count(*) FROM students');
    const stdNum = parseInt(countRes.rows[0].count, 10) + 1;
    const student_no = `NOSSEF-${entry_year || 2026}-${String(stdNum).padStart(4, '0')}`;

    const student = await transaction(async (client) => {
      const sRes = await client.query(
        `INSERT INTO students (student_no, full_name, gender, birth_date, birth_place, address, phone, entry_year, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ATIVU')
         RETURNING *`,
        [student_no, full_name, gender, birth_date, birth_place, address, phone, entry_year || 2026]
      );
      const newStudent = sRes.rows[0];

      // Enrollment
      if (classroom_id && academic_year_id) {
        await client.query(
          `INSERT INTO student_enrollments (academic_year_id, student_id, grade_level_id, major_id, classroom_id, enrollment_date, status)
           VALUES ($1, $2, $3, $4, $5, NOW(), 'ACTIVE')`,
          [academic_year_id, newStudent.id, grade_level_id, major_id, classroom_id]
        );
      }

      // Guardian
      if (guardian_name) {
        const gRes = await client.query(
          `INSERT INTO guardians (full_name, relationship, phone, address)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [guardian_name, guardian_relationship || 'Inan-Aman', guardian_phone, address]
        );
        await client.query(
          `INSERT INTO student_guardians (student_id, guardian_id, is_primary, can_pickup)
           VALUES ($1, $2, TRUE, TRUE)`,
          [newStudent.id, gRes.rows[0].id]
        );
      }

      return newStudent;
    });

    return NextResponse.json(student, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
