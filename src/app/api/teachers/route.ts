import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const role = searchParams.get('role');

    let sql = `
      SELECT 
        t.id, t.employee_no, t.full_name, t.gender, t.phone, t.email,
        t.employment_status, t.employment_type, t.join_date, t.leave_date,
        t.specialization, t.qualification, t.nip,
        t.is_homeroom_teacher, t.created_at, t.updated_at,
        u.email as user_email, u.is_active as user_active,
        c.id as homeroom_class_id, c.name as homeroom_class_name, c.code as homeroom_class_code,
        COUNT(DISTINCT ta.id) as teaching_assignment_count
      FROM teachers t
      LEFT JOIN classrooms c ON (c.homeroom_teacher_id = t.id OR (t.user_id IS NOT NULL AND c.homeroom_teacher_id = t.user_id)) AND c.academic_year_id = (SELECT id FROM academic_years WHERE is_active = TRUE LIMIT 1)
      LEFT JOIN teaching_assignments ta ON (ta.teacher_id = t.id OR (t.user_id IS NOT NULL AND ta.teacher_id = t.user_id))
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(t.full_name ILIKE $${params.length} OR t.employee_no ILIKE $${params.length} OR t.nip ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status);
      conditions.push(`t.employment_status = $${params.length}`);
    }
    if (role === 'homeroom') {
      conditions.push(`t.is_homeroom_teacher = TRUE`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' GROUP BY t.id, u.email, u.is_active, c.id, c.name, c.code ORDER BY t.full_name ASC';

    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    // If teachers table doesn't exist yet, return empty array gracefully
    if (err.code === '42P01') {
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const {
      full_name, employee_no, gender, phone, email, employment_status = 'ACTIVE',
      employment_type = 'FULL_TIME', join_date, specialization, qualification, nip,
      is_homeroom_teacher = false,
    } = body;

    if (!full_name) {
      return NextResponse.json({ error: 'full_name obrigatoriu' }, { status: 400 });
    }

    const res = await query(`
      INSERT INTO teachers (
        full_name, employee_no, gender, phone, email, employment_status, employment_type,
        join_date, specialization, qualification, nip, is_homeroom_teacher
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `, [full_name, employee_no || null, gender || null, phone || null, email || null,
        employment_status, employment_type, join_date || null, specialization || null,
        qualification || null, nip || null, is_homeroom_teacher]);

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
