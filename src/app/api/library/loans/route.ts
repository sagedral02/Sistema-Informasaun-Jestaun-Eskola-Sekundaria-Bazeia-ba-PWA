import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const res = await query(`
      SELECT ll.*,
             lb.title as book_title, lb.author as book_author,
             lc.barcode,
             s.student_no, s.full_name as student_name,
             u.full_name as issued_by_name
      FROM library_loans ll
      JOIN library_copies lc ON ll.copy_id = lc.id
      JOIN library_books lb ON lc.book_id = lb.id
      LEFT JOIN students s ON ll.student_id = s.id
      LEFT JOIN users u ON ll.issued_by = u.id
      ORDER BY ll.loan_date DESC
    `);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || (!user.roles.includes('SUPER_ADMIN') && !user.roles.includes('LIBRARIAN'))) {
    return NextResponse.json({ error: 'La iha autorizasaun.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { loan_id, action } = body;

    // Handle return
    if (action === 'RETURN' && loan_id) {
      await transaction(async (client) => {
        const loanRes = await client.query('SELECT * FROM library_loans WHERE id = $1', [loan_id]);
        if (loanRes.rows.length === 0) throw new Error('Empréstimu la hetan.');
        const loan = loanRes.rows[0];

        await client.query("UPDATE library_loans SET status = 'FILA_ONA', return_date = CURRENT_DATE WHERE id = $1", [loan_id]);
        await client.query("UPDATE library_copies SET is_available = TRUE WHERE id = $1", [loan.copy_id]);
        await client.query("UPDATE library_books SET available_copies = available_copies + 1 WHERE id = (SELECT book_id FROM library_copies WHERE id = $1)", [loan.copy_id]);
      });
      return NextResponse.json({ success: true, message: 'Livru fila ona ba biblioteka!' });
    }

    // New Loan
    const { copy_id, student_id, due_date } = body;
    const loan = await transaction(async (client) => {
      const res = await client.query(
        `INSERT INTO library_loans (copy_id, student_id, loan_date, due_date, status, issued_by)
         VALUES ($1, $2, CURRENT_DATE, $3, 'ATIVU', $4)
         RETURNING *`,
        [copy_id, student_id, due_date, user.id]
      );
      await client.query("UPDATE library_copies SET is_available = FALSE WHERE id = $1", [copy_id]);
      await client.query("UPDATE library_books SET available_copies = GREATEST(0, available_copies - 1) WHERE id = (SELECT book_id FROM library_copies WHERE id = $1)", [copy_id]);
      return res.rows[0];
    });

    return NextResponse.json(loan, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
