import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    school: 'Escola Secundaria Catolica Nossa Senhora de Fatima Railaco',
  });
}
