import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || (!user.roles.includes('SUPER_ADMIN') && !user.roles.includes('CURRICULUM_ADMIN') && !user.roles.includes('PRINCIPAL'))) {
    return NextResponse.json({ error: 'La iha autorizasaun atu tranka nota ofisiál.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { trimester_id, subject_offering_id } = body;

    await query(
      `UPDATE term_grades
       SET is_locked = TRUE
       WHERE trimester_id = $1 AND subject_offering_id = $2`,
      [trimester_id, subject_offering_id]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'FINALIZE_TERM_GRADES', 'TERM_GRADE', $2, $3)`,
      [user.id, subject_offering_id, JSON.stringify({ trimester_id, status: 'LOCKED' })]
    );

    return NextResponse.json({
      success: true,
      message: 'Nota final ba trimestre tranka ona ho susesu (Locked)!',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
