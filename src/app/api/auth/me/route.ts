import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const sessionUser = getSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  // Fetch full details
  const res = await query(
    `SELECT u.id, u.email, u.phone, u.national_id, u.full_name,
            ARRAY_AGG(r.code) as roles
     FROM users u
     LEFT JOIN user_roles ur ON u.id = ur.user_id
     LEFT JOIN roles r ON ur.role_id = r.id
     WHERE u.id = $1
     GROUP BY u.id, u.email, u.phone, u.national_id, u.full_name`,
    [sessionUser.id]
  );

  if (res.rows.length === 0) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const u = res.rows[0];
  const roles: string[] = u.roles.filter(Boolean);

  return NextResponse.json({
    authenticated: true,
    user: {
      id: u.id,
      email: u.email,
      phone: u.phone,
      nationalId: u.national_id,
      fullName: u.full_name,
      role: roles[0] || 'STUDENT',
      roles,
    },
  });
}
