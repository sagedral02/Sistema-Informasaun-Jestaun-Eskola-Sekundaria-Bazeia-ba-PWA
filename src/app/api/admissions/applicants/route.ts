import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get('period_id');
    const status = searchParams.get('status');

    let sql = `
      SELECT a.*,
             m.code as chosen_major_code, m.name as chosen_major_name,
             ap.code as period_code,
             ag.full_name as guardian_name, ag.relationship as guardian_relationship, ag.phone as guardian_phone
      FROM applicants a
      JOIN admission_periods ap ON a.admission_period_id = ap.id
      LEFT JOIN majors m ON a.chosen_major_id = m.id
      LEFT JOIN applicant_guardians ag ON a.id = ag.applicant_id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (periodId) {
      params.push(periodId);
      conditions.push(`a.admission_period_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`a.status = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY a.created_at DESC';

    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      admission_period_id,
      full_name,
      gender,
      birth_date,
      birth_place,
      previous_school,
      chosen_major_id,
      guardian_name,
      guardian_relationship,
      guardian_phone,
      guardian_address,
      guardian_occupation,
    } = body;

    const countRes = await query('SELECT count(*) FROM applicants');
    const appNum = parseInt(countRes.rows[0].count, 10) + 1;
    const application_no = `APP-2026-${String(appNum).padStart(3, '0')}`;

    const applicant = await transaction(async (client) => {
      const appRes = await client.query(
        `INSERT INTO applicants (admission_period_id, application_no, full_name, gender, birth_date, birth_place, previous_school, chosen_major_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'SUBMITTED')
         RETURNING *`,
        [admission_period_id, application_no, full_name, gender, birth_date, birth_place, previous_school, chosen_major_id]
      );
      const app = appRes.rows[0];

      if (guardian_name) {
        await client.query(
          `INSERT INTO applicant_guardians (applicant_id, full_name, relationship, phone, address, occupation)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [app.id, guardian_name, guardian_relationship || 'Inan-Aman', guardian_phone, guardian_address, guardian_occupation]
        );
      }

      return app;
    });

    return NextResponse.json(applicant, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
