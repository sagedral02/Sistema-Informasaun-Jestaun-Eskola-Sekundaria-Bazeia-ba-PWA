import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json([]);
  }

  try {
    const res = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [user.id]
    );
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'La iha sesaun.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { notification_id, action } = body;

    if (action === 'READ_ALL') {
      await query('UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = $1', [user.id]);
      return NextResponse.json({ success: true });
    }

    if (notification_id) {
      await query('UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = $1 AND user_id = $2', [notification_id, user.id]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Asaun la rekoñese.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
