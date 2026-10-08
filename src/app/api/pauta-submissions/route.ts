import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS pauta_submissions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      protocol_no VARCHAR(50) UNIQUE NOT NULL,
      classroom_id UUID,
      classroom_name VARCHAR(100) NOT NULL,
      subject_name VARCHAR(100) NOT NULL,
      trimester_number INT DEFAULT 1,
      teacher_name VARCHAR(255) NOT NULL,
      teacher_id UUID,
      file_name VARCHAR(255) NOT NULL,
      total_students INT DEFAULT 0,
      passed_count INT DEFAULT 0,
      exam_count INT DEFAULT 0,
      failed_count INT DEFAULT 0,
      average_score NUMERIC DEFAULT 0,
      submitted_to VARCHAR(255) DEFAULT 'Prof. Dra. Cristina Amaral & Ir. Maria Gorete Martins',
      status VARCHAR(50) DEFAULT 'PENDING_DIRECTOR_REVIEW',
      director_notes TEXT,
      scores_data JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

export async function GET(request: NextRequest) {
  try {
    await ensureTable();
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get('classroom_id');
    const status = searchParams.get('status');

    let sql = `SELECT * FROM pauta_submissions WHERE 1=1`;
    const params: any[] = [];

    if (classroomId) {
      params.push(classroomId);
      sql += ` AND classroom_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    sql += ` ORDER BY created_at DESC`;

    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    console.error('Error fetching pauta submissions:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTable();
    const body = await request.json();

    const {
      classroom_id,
      classroom_name,
      subject_name,
      trimester_number = 1,
      teacher_name = 'Mestre Domingos da Costa',
      teacher_id,
      file_name = 'Pauta_Valores_2026.xlsx',
      total_students = 0,
      passed_count = 0,
      exam_count = 0,
      failed_count = 0,
      average_score = 0,
      scores_data = [],
    } = body;

    // Generate unique Protocol Number: PV-NOSSEF-2026-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const protocol_no = `PV-NOSSEF-2026-${randomSuffix}`;

    const res = await query(
      `INSERT INTO pauta_submissions (
        protocol_no, classroom_id, classroom_name, subject_name,
        trimester_number, teacher_name, teacher_id, file_name,
        total_students, passed_count, exam_count, failed_count,
        average_score, scores_data, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'PENDING_DIRECTOR_REVIEW')
      RETURNING *`,
      [
        protocol_no,
        classroom_id || null,
        classroom_name || '10.º Ano CT-A',
        subject_name || 'Matemátika Jerál',
        trimester_number,
        teacher_name,
        teacher_id || null,
        file_name,
        total_students,
        passed_count,
        exam_count,
        failed_count,
        average_score,
        JSON.stringify(scores_data),
      ]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    console.error('Error creating pauta submission:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await ensureTable();
    const body = await request.json();
    const { id, status, director_notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'id no status obrigatoriu.' }, { status: 400 });
    }

    const res = await query(
      `UPDATE pauta_submissions
       SET status = $1, director_notes = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, director_notes || null, id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Submisaun la hetan.' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (err: any) {
    console.error('Error updating pauta submission:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
