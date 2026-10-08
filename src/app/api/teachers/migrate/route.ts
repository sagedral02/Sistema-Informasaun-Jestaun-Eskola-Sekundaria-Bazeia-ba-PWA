import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Add teachers table if not exists
    await query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        employee_no VARCHAR(50),
        nip VARCHAR(50),
        full_name VARCHAR(255) NOT NULL,
        gender VARCHAR(10),
        phone VARCHAR(50),
        email VARCHAR(255),
        employment_status VARCHAR(50) DEFAULT 'ACTIVE',
        employment_type VARCHAR(50) DEFAULT 'FULL_TIME',
        join_date DATE,
        leave_date DATE,
        specialization TEXT,
        qualification VARCHAR(100),
        is_homeroom_teacher BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Try to seed from existing user_roles TEACHER data
    await query(`
      INSERT INTO teachers (user_id, full_name, employment_status, employment_type)
      SELECT DISTINCT u.id, u.full_name, 'ACTIVE', 'FULL_TIME'
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.code IN ('TEACHER', 'HOMEROOM_TEACHER')
        AND NOT EXISTS (SELECT 1 FROM teachers t2 WHERE t2.user_id = u.id)
      ON CONFLICT DO NOTHING
    `).catch(() => null);

    return NextResponse.json({ ok: true, message: 'Teachers table created/updated' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
