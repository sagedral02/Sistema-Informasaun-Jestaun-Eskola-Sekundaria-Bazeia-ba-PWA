import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query('SELECT count(*) as user_count FROM users');
    return NextResponse.json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
      user_count: parseInt(res.rows[0].user_count, 10),
      school: 'Escola Secundaria Catolica Nossa Senhora de Fatima Railaco',
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        error: err.message,
      },
      { status: 503 }
    );
  }
}
