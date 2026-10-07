import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || (!user.roles.includes('SUPER_ADMIN') && !user.roles.includes('FINANCE_ADMIN'))) {
    return NextResponse.json({ error: 'La iha autorizasaun.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { academic_year_id, month_name, year, issue_date, due_date } = body;

    const result = await transaction(async (client) => {
      // Find active fee plan for SPP
      const fpRes = await client.query(
        `SELECT fp.* FROM fee_plans fp
         JOIN fee_types ft ON fp.fee_type_id = ft.id
         WHERE fp.academic_year_id = $1 AND ft.code = 'MENSALIDADE'
         LIMIT 1`,
        [academic_year_id]
      );

      if (fpRes.rows.length === 0) {
        throw new Error('La hetan planu taxa Mensalidade (SPP) ativu ba tinan akadémiku ne\'e.');
      }
      const feePlan = fpRes.rows[0];

      // Find all active students
      const stdRes = await client.query(
        `SELECT s.id, s.full_name, s.student_no, se.classroom_id, c.code as classroom_code
         FROM students s
         JOIN student_enrollments se ON s.id = se.student_id
         JOIN classrooms c ON se.classroom_id = c.id
         WHERE se.academic_year_id = $1 AND se.status = 'ACTIVE'`,
        [academic_year_id]
      );

      const generated: any[] = [];
      const invoiceTitle = `Mensalidade Fulan ${month_name} ${year}`;

      for (const st of stdRes.rows) {
        // Prevent duplicates for same student and title
        const existing = await client.query(
          `SELECT id FROM invoices WHERE student_id = $1 AND title = $2`,
          [st.id, invoiceTitle]
        );

        if (existing.rows.length > 0) continue;

        const countRes = await client.query('SELECT count(*) FROM invoices');
        const num = parseInt(countRes.rows[0].count, 10) + 1;
        const invNo = `FAT-${year}-${String(num).padStart(4, '0')}`;

        const invRes = await client.query(
          `INSERT INTO invoices (student_id, invoice_number, fee_plan_id, title, issue_date, due_date, subtotal, discount_amount, total_amount, paid_amount, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $7, 0, 'SEIDAUK_SELU')
           RETURNING *`,
          [st.id, invNo, feePlan.id, invoiceTitle, issue_date || `${year}-01-01`, due_date || `${year}-01-15`, feePlan.amount]
        );
        const inv = invRes.rows[0];

        await client.query(
          `INSERT INTO invoice_items (invoice_id, description, amount)
           VALUES ($1, $2, $3)`,
          [inv.id, `${invoiceTitle} - ${st.classroom_code}`, feePlan.amount]
        );

        generated.push(inv);
      }

      return generated;
    });

    return NextResponse.json({
      success: true,
      message: `Konta mensalidade fulan ${month_name} jera ona ho susesu ba estudante ${result.length}!`,
      count: result.length,
      invoices: result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
