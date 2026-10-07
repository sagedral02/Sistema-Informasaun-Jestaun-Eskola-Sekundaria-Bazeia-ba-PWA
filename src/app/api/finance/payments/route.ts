import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');

    let sql = `
      SELECT p.*,
             s.student_no, s.full_name as student_name,
             u.full_name as received_by_name,
             r.receipt_number
      FROM payments p
      JOIN students s ON p.student_id = s.id
      JOIN users u ON p.received_by = u.id
      LEFT JOIN receipts r ON p.id = r.payment_id
    `;
    const params: any[] = [];
    if (studentId) {
      sql += ' WHERE p.student_id = $1';
      params.push(studentId);
    }
    sql += ' ORDER BY p.payment_date DESC, p.created_at DESC';

    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || (!user.roles.includes('SUPER_ADMIN') && !user.roles.includes('FINANCE_ADMIN'))) {
    return NextResponse.json({ error: 'La iha autorizasaun.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { student_id, invoice_id, amount, payment_method, reference_no, reversal_id, reversal_reason } = body;

    // Handle Payment Reversal (INV-14: Verified payment is never hard-deleted; correction uses reversal)
    if (reversal_id) {
      const revResult = await transaction(async (client) => {
        const payRes = await client.query('SELECT * FROM payments WHERE id = $1', [reversal_id]);
        if (payRes.rows.length === 0) throw new Error('Pagamentu la hetan.');
        const payment = payRes.rows[0];

        // Mark payment cancelled
        await client.query("UPDATE payments SET status = 'KANSELA' WHERE id = $1", [reversal_id]);

        // Insert payment reversal
        await client.query(
          `INSERT INTO payment_reversals (payment_id, reversal_date, reason, reversed_by)
           VALUES ($1, NOW(), $2, $3)`,
          [reversal_id, reversal_reason || 'Reversal pedidu husi finansas', user.id]
        );

        // Adjust invoices allocated
        const allocRes = await client.query(
          'SELECT * FROM payment_allocations WHERE payment_id = $1',
          [reversal_id]
        );

        for (const alloc of allocRes.rows) {
          await client.query(
            `UPDATE invoices
             SET paid_amount = GREATEST(0, paid_amount - $1),
                 status = CASE
                   WHEN (paid_amount - $1) <= 0 THEN 'SEIDAUK_SELU'
                   ELSE 'SELU_BALUN'
                 END
             WHERE id = $2`,
            [alloc.allocated_amount, alloc.invoice_id]
          );
        }

        // Audit log
        await client.query(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
           VALUES ($1, 'REVERSE_PAYMENT', 'PAYMENT', $2, $3)`,
          [user.id, reversal_id, JSON.stringify({ reason: reversal_reason, amount: payment.amount })]
        );

        return { reversed: true };
      });

      return NextResponse.json(revResult);
    }

    // Normal Payment Flow
    const payNumRes = await query('SELECT count(*) FROM payments');
    const pCount = parseInt(payNumRes.rows[0].count, 10) + 1;
    const payment_number = `PAG-2026-${String(pCount).padStart(4, '0')}`;
    const receipt_number = `REC-2026-${String(pCount).padStart(4, '0')}`;

    const paymentResult = await transaction(async (client) => {
      // 1. Create Payment
      const payRes = await client.query(
        `INSERT INTO payments (student_id, payment_number, payment_date, amount, payment_method, reference_no, received_by, status)
         VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, 'VERIFIKADU')
         RETURNING *`,
        [student_id, payment_number, amount, payment_method || 'CASH', reference_no || 'REC', user.id]
      );
      const payment = payRes.rows[0];

      // 2. Allocate to Invoice
      if (invoice_id) {
        await client.query(
          `INSERT INTO payment_allocations (payment_id, invoice_id, allocated_amount)
           VALUES ($1, $2, $3)`,
          [payment.id, invoice_id, amount]
        );

        // Update Invoice status
        await client.query(
          `UPDATE invoices
           SET paid_amount = paid_amount + $1,
               status = CASE
                 WHEN (paid_amount + $1) >= total_amount THEN 'SELU_ONA'
                 ELSE 'SELU_BALUN'
               END
           WHERE id = $2`,
          [amount, invoice_id]
        );
      }

      // 3. Issue Receipt
      const recRes = await client.query(
        `INSERT INTO receipts (receipt_number, payment_id, issued_at, issued_by)
         VALUES ($1, $2, NOW(), $3)
         RETURNING *`,
        [receipt_number, payment.id, user.id]
      );

      // 4. Audit Log
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES ($1, 'RECEIVE_PAYMENT', 'PAYMENT', $2, $3)`,
        [user.id, payment.id, JSON.stringify({ student_id, amount, receipt_number })]
      );

      return { payment, receipt: recRes.rows[0] };
    });

    return NextResponse.json(paymentResult, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
