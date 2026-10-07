import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const status = searchParams.get('status');

    let sql = `
      SELECT inv.*,
             s.student_no, s.full_name as student_name,
             c.code as classroom_code,
             fp.name as fee_plan_name
      FROM invoices inv
      JOIN students s ON inv.student_id = s.id
      LEFT JOIN student_enrollments se ON s.id = se.student_id AND se.status = 'ACTIVE'
      LEFT JOIN classrooms c ON se.classroom_id = c.id
      LEFT JOIN fee_plans fp ON inv.fee_plan_id = fp.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (studentId) {
      params.push(studentId);
      conditions.push(`inv.student_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`inv.status = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY inv.issue_date DESC, inv.created_at DESC';

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
    const { student_id, fee_plan_id, title, issue_date, due_date, amount, items } = body;

    const countRes = await query('SELECT count(*) FROM invoices');
    const invNum = parseInt(countRes.rows[0].count, 10) + 1;
    const invoice_number = `FAT-2026-${String(invNum).padStart(4, '0')}`;

    const res = await query(
      `INSERT INTO invoices (student_id, invoice_number, fee_plan_id, title, issue_date, due_date, subtotal, discount_amount, total_amount, paid_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $7, 0, 'SEIDAUK_SELU')
       RETURNING *`,
      [student_id, invoice_number, fee_plan_id, title, issue_date, due_date, amount]
    );
    const invoice = res.rows[0];

    if (items && Array.isArray(items)) {
      for (const item of items) {
        await query(
          `INSERT INTO invoice_items (invoice_id, description, amount) VALUES ($1, $2, $3)`,
          [invoice.id, item.description, item.amount]
        );
      }
    } else {
      await query(
        `INSERT INTO invoice_items (invoice_id, description, amount) VALUES ($1, $2, $3)`,
        [invoice.id, title, amount]
      );
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
