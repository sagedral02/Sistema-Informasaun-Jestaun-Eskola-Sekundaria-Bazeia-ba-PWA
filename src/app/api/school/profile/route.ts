import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const res = await query(`
      SELECT sp.*, ay.code as active_academic_year_code, ay.name as active_academic_year_name
      FROM school_profile sp
      LEFT JOIN academic_years ay ON sp.active_academic_year_id = ay.id
      LIMIT 1
    `);
    return NextResponse.json(res.rows[0] || null);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || (!user.roles.includes('SUPER_ADMIN') && !user.roles.includes('SCHOOL_ADMIN') && !user.roles.includes('PRINCIPAL'))) {
    return NextResponse.json({ error: 'La iha autorizasaun atu muda perfil eskola.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { official_name, short_name, address, phone, email, principal_name, active_academic_year_id } = body;

    const res = await query(
      `UPDATE school_profile
       SET official_name = COALESCE($1, official_name),
           short_name = COALESCE($2, short_name),
           address = COALESCE($3, address),
           phone = COALESCE($4, phone),
           email = COALESCE($5, email),
           principal_name = COALESCE($6, principal_name),
           active_academic_year_id = COALESCE($7, active_academic_year_id),
           updated_at = NOW()
       RETURNING *`,
      [official_name, short_name, address, phone, email, principal_name, active_academic_year_id]
    );

    return NextResponse.json(res.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
