import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const res = await query(`
      SELECT ea.*,
             u.full_name as supervisor_name,
             (SELECT count(*) FROM extracurricular_memberships em WHERE em.activity_id = ea.id) as member_count
      FROM extracurricular_activities ea
      LEFT JOIN users u ON ea.supervisor_id = u.id
      ORDER BY ea.name ASC
    `);
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
    const { name, description, supervisor_id, schedule_info } = body;

    const res = await query(
      `INSERT INTO extracurricular_activities (name, description, supervisor_id, schedule_info)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description, supervisor_id, schedule_info]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
