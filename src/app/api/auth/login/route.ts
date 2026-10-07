import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Favór prenxe email no lia-fukun.' },
        { status: 400 }
      );
    }

    // Query user and their roles
    const userRes = await query(
      `SELECT u.id, u.email, u.full_name, u.password_hash, u.is_active,
              ARRAY_AGG(r.code) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE LOWER(u.email) = LOWER($1)
       GROUP BY u.id, u.email, u.full_name, u.password_hash, u.is_active`,
      [email.trim()]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Email ka lia-fukun la loos.' },
        { status: 401 }
      );
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Konta ne\'e deskoneta ka la ativu ona. Favór kontaktu administrasaun.' },
        { status: 403 }
      );
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Email ka lia-fukun la loos.' },
        { status: 401 }
      );
    }

    const roles: string[] = user.roles.filter(Boolean);
    const primaryRole = roles[0] || 'STUDENT';

    const authUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: primaryRole,
      roles,
    };

    const token = generateToken(authUser);

    // Update last login
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // Audit log
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'AUTH_LOGIN', 'USER', $1, $2)`,
      [user.id, JSON.stringify({ email: user.email, role: primaryRole })]
    );

    const response = NextResponse.json({
      success: true,
      message: 'Ita-boot konsege tama ona iha sistema!',
      user: authUser,
      token,
    });

    response.cookies.set('nossef_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Iha fallansu ruma iha servidór. Favór koko fali.' },
      { status: 500 }
    );
  }
}
