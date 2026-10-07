import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const res = await query(`
      SELECT di.*,
             s.student_no, s.full_name as student_name,
             u.full_name as reported_by_name
      FROM discipline_incidents di
      JOIN students s ON di.student_id = s.id
      JOIN users u ON di.reported_by = u.id
      ORDER BY di.incident_date DESC
    `);
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
    const { student_id, incident_date, infraction_type, description, severity, action_taken, points } = body;

    const res = await query(
      `INSERT INTO discipline_incidents (student_id, incident_date, infraction_type, description, severity, action_taken, points, reported_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [student_id, incident_date || new Date().toISOString().slice(0, 10), infraction_type, description, severity || 'KAMAN', action_taken, points || 5, user.id]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
