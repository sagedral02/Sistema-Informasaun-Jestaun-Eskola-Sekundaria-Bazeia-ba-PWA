import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  // PRD INV-18: Counseling data is restricted beyond generic teacher access
  if (!user || (!user.roles.includes('SUPER_ADMIN') && !user.roles.includes('COUNSELOR') && !user.roles.includes('PRINCIPAL'))) {
    return NextResponse.json({ error: 'La iha autorizasaun atu asesu dadus konsellu.' }, { status: 403 });
  }

  try {
    const res = await query(`
      SELECT cc.*,
             s.student_no, s.full_name as student_name,
             u.full_name as counselor_name
      FROM counseling_cases cc
      JOIN students s ON cc.student_id = s.id
      JOIN users u ON cc.counselor_id = u.id
      ORDER BY cc.created_at DESC
    `);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || (!user.roles.includes('SUPER_ADMIN') && !user.roles.includes('COUNSELOR'))) {
    return NextResponse.json({ error: 'La iha autorizasaun.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { student_id, category, title, description, is_confidential } = body;

    const countRes = await query('SELECT count(*) FROM counseling_cases');
    const num = parseInt(countRes.rows[0].count, 10) + 1;
    const case_number = `BK-2026-${String(num).padStart(3, '0')}`;

    const res = await query(
      `INSERT INTO counseling_cases (student_id, counselor_id, case_number, category, title, description, status, is_confidential)
       VALUES ($1, $2, $3, $4, $5, $6, 'ABERTO', $7)
       RETURNING *`,
      [student_id, user.id, case_number, category, title, description, is_confidential !== false]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
