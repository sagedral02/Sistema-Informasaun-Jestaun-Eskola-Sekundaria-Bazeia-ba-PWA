import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const res = await query(
      `
      SELECT 
        t.*,
        u.email as user_email, u.is_active as user_active,
        c.id as homeroom_class_id, c.name as homeroom_class_name, c.code as homeroom_class_code
      FROM teachers t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN classrooms c ON (c.homeroom_teacher_id = t.id OR (t.user_id IS NOT NULL AND c.homeroom_teacher_id = t.user_id))
      WHERE t.id = $1
      LIMIT 1
    `,
      [id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Mestre la hetan' }, { status: 404 });
    }

    // Also get teaching assignments
    const assignmentsRes = await query(
      `
      SELECT 
        ta.id, s.name as subject_name, s.code as subject_code,
        c.name as class_name, c.code as class_code,
        ay.name as academic_year_name
      FROM teaching_assignments ta
      JOIN subject_offerings so ON ta.subject_offering_id = so.id
      JOIN subjects s ON so.subject_id = s.id
      JOIN classrooms c ON ta.classroom_id = c.id
      JOIN academic_years ay ON ta.academic_year_id = ay.id
      WHERE ta.teacher_id = $1 OR (t.user_id IS NOT NULL AND ta.teacher_id = (SELECT user_id FROM teachers WHERE id = $1))
    `,
      [id]
    );

    return NextResponse.json({
      ...res.rows[0],
      assignments: assignmentsRes.rows,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const body = await request.json();
    const {
      full_name,
      employee_no,
      nip,
      gender,
      phone,
      email,
      employment_status,
      employment_type,
      join_date,
      specialization,
      qualification,
      is_homeroom_teacher,
    } = body;

    const res = await query(
      `
      UPDATE teachers
      SET 
        full_name = COALESCE($1, full_name),
        employee_no = $2,
        nip = $3,
        gender = $4,
        phone = $5,
        email = $6,
        employment_status = COALESCE($7, employment_status),
        employment_type = COALESCE($8, employment_type),
        join_date = $9,
        specialization = $10,
        qualification = $11,
        is_homeroom_teacher = COALESCE($12, is_homeroom_teacher),
        updated_at = NOW()
      WHERE id = $13
      RETURNING *
    `,
      [
        full_name,
        employee_no || null,
        nip || null,
        gender || null,
        phone || null,
        email || null,
        employment_status,
        employment_type,
        join_date || null,
        specialization || null,
        qualification || null,
        is_homeroom_teacher,
        id,
      ]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Mestre la hetan' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    await query(`UPDATE teachers SET employment_status = 'ENDED', updated_at = NOW() WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true, message: 'Status mestre nian atualiza ba ENDED' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
