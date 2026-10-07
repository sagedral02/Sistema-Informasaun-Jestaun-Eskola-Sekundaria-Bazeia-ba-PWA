import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const res = await query(`
      SELECT fp.*,
             ft.name as fee_type_name, ft.code as fee_type_code,
             gl.name as grade_level_name, gl.code as grade_level_code,
             ay.code as academic_year_code
      FROM fee_plans fp
      JOIN fee_types ft ON fp.fee_type_id = ft.id
      LEFT JOIN grade_levels gl ON fp.grade_level_id = gl.id
      JOIN academic_years ay ON fp.academic_year_id = ay.id
      ORDER BY fp.amount DESC
    `);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || (!user.roles.includes('SUPER_ADMIN') && !user.roles.includes('FINANCE_ADMIN'))) {
    return NextResponse.json({ error: 'La iha autorizasaun.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { academic_year_id, fee_type_id, grade_level_id, name, amount, due_day } = body;

    const res = await query(
      `INSERT INTO fee_plans (academic_year_id, fee_type_id, grade_level_id, name, amount, due_day)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [academic_year_id, fee_type_id, grade_level_id, name, amount, due_day || 10]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
