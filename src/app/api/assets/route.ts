import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const res = await query('SELECT * FROM assets ORDER BY purchase_date DESC NULLS LAST');
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || (!user.roles.includes('SUPER_ADMIN') && !user.roles.includes('ASSET_OFFICER'))) {
    return NextResponse.json({ error: 'La iha autorizasaun.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { asset_tag, name, category, location, purchase_date, cost, condition, status } = body;

    const res = await query(
      `INSERT INTO assets (asset_tag, name, category, location, purchase_date, cost, condition, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [asset_tag, name, category, location, purchase_date, cost || 0, condition || 'DIAK', status || 'ATIVU']
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
