import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'SUMMARY';

    // 1. Overall stats
    const totalStudents = (await query("SELECT count(*) FROM students WHERE status = 'ATIVU'")).rows[0].count;
    const maleStudents = (await query("SELECT count(*) FROM students WHERE status = 'ATIVU' AND gender = 'Mane'")).rows[0].count;
    const femaleStudents = (await query("SELECT count(*) FROM students WHERE status = 'ATIVU' AND gender = 'Feto'")).rows[0].count;
    const totalTeachers = (await query("SELECT count(*) FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE r.code = 'TEACHER'")).rows[0].count;
    const totalClassrooms = (await query("SELECT count(*) FROM classrooms")).rows[0].count;

    // 2. Finance aggregates
    const financeRes = await query(`
      SELECT
        COALESCE(SUM(total_amount), 0) as total_invoiced,
        COALESCE(SUM(paid_amount), 0) as total_collected,
        COALESCE(SUM(total_amount - paid_amount), 0) as total_arrears
      FROM invoices
      WHERE status != 'KANSELA'
    `);

    // 3. Attendance rate
    const attendanceRes = await query(`
      SELECT
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'PREZENTE' THEN 1 END) as present_count
      FROM attendance_records
    `);
    const totAtt = parseInt(attendanceRes.rows[0].total_records, 10) || 1;
    const presAtt = parseInt(attendanceRes.rows[0].present_count, 10) || 0;
    const attendanceRate = Math.round((presAtt / totAtt) * 100);

    // 4. Students per class breakdown
    const classBreakdown = await query(`
      SELECT c.name as class_name, c.code as class_code,
             COUNT(se.student_id) as student_count
      FROM classrooms c
      LEFT JOIN student_enrollments se ON c.id = se.classroom_id AND se.status = 'ACTIVE'
      GROUP BY c.id, c.name, c.code
      ORDER BY c.code ASC
    `);

    return NextResponse.json({
      summary: {
        totalStudents: parseInt(totalStudents, 10),
        maleStudents: parseInt(maleStudents, 10),
        femaleStudents: parseInt(femaleStudents, 10),
        totalTeachers: parseInt(totalTeachers, 10),
        totalClassrooms: parseInt(totalClassrooms, 10),
        attendanceRate,
        finance: {
          totalInvoiced: parseFloat(financeRes.rows[0].total_invoiced),
          totalCollected: parseFloat(financeRes.rows[0].total_collected),
          totalArrears: parseFloat(financeRes.rows[0].total_arrears),
        },
      },
      classBreakdown: classBreakdown.rows,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
