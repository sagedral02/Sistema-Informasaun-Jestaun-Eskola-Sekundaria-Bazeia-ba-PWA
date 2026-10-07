import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Presiza tama uluk iha sistema.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { client_mutation_id, entity_type, client_timestamp, data } = body;

    if (!client_mutation_id) {
      return NextResponse.json({ error: 'client_mutation_id obrigatoriu.' }, { status: 400 });
    }

    // Check idempotency (INV-15)
    const existing = await query(
      'SELECT * FROM offline_mutation_receipts WHERE client_mutation_id = $1',
      [client_mutation_id]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({
        status: 'ALREADY_SYNCED',
        message: 'Mutasaun offline ne\'e prosesa ona uluk.',
        receipt: existing.rows[0],
      });
    }

    // Process attendance session and records
    const receipt = await transaction(async (client) => {
      let serverResponse: any = {};

      if (entity_type === 'ATTENDANCE_SESSION') {
        const { academic_year_id, trimester_id, classroom_id, schedule_entry_id, session_date, session_mode, records } = data;
        const sessRes = await client.query(
          `INSERT INTO attendance_sessions (academic_year_id, trimester_id, classroom_id, schedule_entry_id, session_date, session_mode, recorded_by, is_submitted, submitted_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, NOW())
           RETURNING *`,
          [academic_year_id, trimester_id, classroom_id, schedule_entry_id, session_date, session_mode || 'DAILY', user.id]
        );
        const session = sessRes.rows[0];

        if (records && Array.isArray(records)) {
          for (const rec of records) {
            await client.query(
              `INSERT INTO attendance_records (session_id, student_id, status, notes)
               VALUES ($1, $2, $3, $4)`,
              [session.id, rec.student_id, rec.status || 'PREZENTE', rec.notes || '']
            );
          }
        }
        serverResponse = { sessionId: session.id, recordCount: records ? records.length : 0 };
      }

      const recRes = await client.query(
        `INSERT INTO offline_mutation_receipts (client_mutation_id, entity_type, client_timestamp, status, server_response)
         VALUES ($1, $2, $3, 'SYNCED', $4)
         RETURNING *`,
        [client_mutation_id, entity_type, client_timestamp || new Date().toISOString(), JSON.stringify(serverResponse)]
      );

      return recRes.rows[0];
    });

    return NextResponse.json({
      status: 'SYNCED',
      message: 'Mutasaun offline konsege sinkroniza ona ho susesu!',
      receipt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
