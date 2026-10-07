import { query, transaction } from './db';
import bcrypt from 'bcryptjs';

export async function initializeDatabase() {
  console.log('Hahu inisializasaun database ba NOSSEF Railaco...');

  // 1. Create tables
  await query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      national_id VARCHAR(50),
      full_name VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      is_staff BOOLEAN DEFAULT FALSE,
      is_superuser BOOLEAN DEFAULT FALSE,
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS roles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      is_system_role BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, role_id)
    );

    CREATE TABLE IF NOT EXISTS school_profile (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code VARCHAR(50) UNIQUE NOT NULL,
      official_name VARCHAR(255) NOT NULL,
      short_name VARCHAR(100) NOT NULL,
      foundation_year INT DEFAULT 1993,
      address TEXT NOT NULL,
      administrative_post VARCHAR(100) NOT NULL,
      municipality VARCHAR(100) NOT NULL,
      country VARCHAR(100) DEFAULT 'Timor-Leste',
      phone VARCHAR(50),
      email VARCHAR(100),
      principal_name VARCHAR(255),
      emblem_url TEXT,
      active_academic_year_id UUID,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS academic_years (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      is_active BOOLEAN DEFAULT FALSE,
      is_closed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS trimestres (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
      number INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      cau_number INT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      is_active BOOLEAN DEFAULT FALSE,
      is_closed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(academic_year_id, number)
    );

    CREATE TABLE IF NOT EXISTS grade_levels (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code VARCHAR(10) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      order_index INT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS majors (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS classrooms (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
      grade_level_id UUID REFERENCES grade_levels(id) ON DELETE CASCADE,
      major_id UUID REFERENCES majors(id) ON DELETE CASCADE,
      code VARCHAR(50) NOT NULL,
      name VARCHAR(100) NOT NULL,
      room_number VARCHAR(50),
      capacity INT DEFAULT 35,
      homeroom_teacher_id UUID REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS subject_offerings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
      grade_level_id UUID REFERENCES grade_levels(id) ON DELETE CASCADE,
      major_id UUID REFERENCES majors(id) ON DELETE CASCADE,
      subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
      weekly_periods INT DEFAULT 4,
      passing_score NUMERIC DEFAULT 10.0,
      credit_hours INT DEFAULT 2,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS teaching_assignments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
      classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
      subject_offering_id UUID REFERENCES subject_offerings(id) ON DELETE CASCADE,
      teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS staff_profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      employee_no VARCHAR(50) UNIQUE,
      full_name VARCHAR(255) NOT NULL,
      role_type VARCHAR(100) NOT NULL,
      phone VARCHAR(50),
      gender VARCHAR(10),
      hire_date DATE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS admission_periods (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      is_open BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS applicants (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      admission_period_id UUID REFERENCES admission_periods(id) ON DELETE CASCADE,
      application_no VARCHAR(50) UNIQUE NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      gender VARCHAR(10) NOT NULL,
      birth_date DATE NOT NULL,
      birth_place VARCHAR(100),
      previous_school VARCHAR(255),
      chosen_major_id UUID REFERENCES majors(id),
      status VARCHAR(50) DEFAULT 'SUBMITTED',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS applicant_guardians (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      applicant_id UUID REFERENCES applicants(id) ON DELETE CASCADE,
      full_name VARCHAR(255) NOT NULL,
      relationship VARCHAR(50) NOT NULL,
      phone VARCHAR(50),
      address TEXT,
      occupation VARCHAR(100)
    );

    CREATE TABLE IF NOT EXISTS applicant_documents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      applicant_id UUID REFERENCES applicants(id) ON DELETE CASCADE,
      document_type VARCHAR(100) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_url TEXT,
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS admission_decisions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      applicant_id UUID REFERENCES applicants(id) ON DELETE CASCADE,
      decision_status VARCHAR(50) NOT NULL,
      notes TEXT,
      decided_by UUID REFERENCES users(id),
      decided_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS students (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id),
      student_no VARCHAR(50) UNIQUE NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      gender VARCHAR(10) NOT NULL,
      birth_date DATE NOT NULL,
      birth_place VARCHAR(100),
      address TEXT,
      phone VARCHAR(50),
      entry_year INT NOT NULL,
      status VARCHAR(50) DEFAULT 'ATIVU',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS guardians (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id),
      full_name VARCHAR(255) NOT NULL,
      relationship VARCHAR(50) NOT NULL,
      phone VARCHAR(50),
      address TEXT,
      occupation VARCHAR(100)
    );

    CREATE TABLE IF NOT EXISTS student_guardians (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      guardian_id UUID REFERENCES guardians(id) ON DELETE CASCADE,
      is_primary BOOLEAN DEFAULT TRUE,
      can_pickup BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS student_enrollments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      grade_level_id UUID REFERENCES grade_levels(id) ON DELETE CASCADE,
      major_id UUID REFERENCES majors(id) ON DELETE CASCADE,
      classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
      enrollment_date DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS student_status_history (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      previous_status VARCHAR(50),
      new_status VARCHAR(50),
      reason TEXT,
      changed_by UUID REFERENCES users(id),
      changed_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS student_transfers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      transfer_type VARCHAR(50) NOT NULL,
      destination_school VARCHAR(255) NOT NULL,
      reason TEXT,
      transfer_date DATE NOT NULL,
      approved_by UUID REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS schedule_entries (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
      classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
      subject_offering_id UUID REFERENCES subject_offerings(id) ON DELETE CASCADE,
      teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
      day_of_week INT NOT NULL,
      period_number INT NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      room_number VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS schedule_exceptions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      schedule_entry_id UUID REFERENCES schedule_entries(id) ON DELETE CASCADE,
      exception_date DATE NOT NULL,
      substitute_teacher_id UUID REFERENCES users(id),
      reason TEXT,
      is_cancelled BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS attendance_sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
      trimester_id UUID REFERENCES trimestres(id) ON DELETE CASCADE,
      classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
      schedule_entry_id UUID REFERENCES schedule_entries(id),
      session_date DATE NOT NULL,
      session_mode VARCHAR(20) DEFAULT 'DAILY',
      recorded_by UUID REFERENCES users(id),
      is_submitted BOOLEAN DEFAULT FALSE,
      submitted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS attendance_corrections (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      record_id UUID REFERENCES attendance_records(id) ON DELETE CASCADE,
      previous_status VARCHAR(20),
      new_status VARCHAR(20),
      reason TEXT,
      corrected_by UUID REFERENCES users(id),
      corrected_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS student_leave_requests (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      leave_type VARCHAR(50) NOT NULL,
      reason TEXT,
      status VARCHAR(50) DEFAULT 'PENDING',
      reviewed_by UUID REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS staff_attendance (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      attendance_date DATE NOT NULL,
      check_in_time TIME,
      check_out_time TIME,
      status VARCHAR(20) DEFAULT 'PREZENTE',
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS offline_mutation_receipts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      client_mutation_id VARCHAR(100) UNIQUE NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      client_timestamp TIMESTAMPTZ NOT NULL,
      synced_at TIMESTAMPTZ DEFAULT NOW(),
      status VARCHAR(20) DEFAULT 'SYNCED',
      server_response JSONB
    );

    CREATE TABLE IF NOT EXISTS assessment_types (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      default_weight NUMERIC DEFAULT 20.0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS grading_schemes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      min_score NUMERIC DEFAULT 0.0,
      max_score NUMERIC DEFAULT 20.0,
      passing_score NUMERIC DEFAULT 10.0
    );

    CREATE TABLE IF NOT EXISTS grading_components (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      subject_offering_id UUID REFERENCES subject_offerings(id) ON DELETE CASCADE,
      trimester_id UUID REFERENCES trimestres(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      assessment_type_id UUID REFERENCES assessment_types(id) ON DELETE CASCADE,
      weight NUMERIC DEFAULT 25.0
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      teaching_assignment_id UUID REFERENCES teaching_assignments(id) ON DELETE CASCADE,
      trimester_id UUID REFERENCES trimestres(id) ON DELETE CASCADE,
      assessment_type_id UUID REFERENCES assessment_types(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      max_score NUMERIC DEFAULT 20.0,
      date_administered DATE NOT NULL,
      is_locked BOOLEAN DEFAULT FALSE,
      locked_at TIMESTAMPTZ,
      locked_by UUID REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS student_scores (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      score NUMERIC NOT NULL,
      letter_grade VARCHAR(5),
      notes TEXT,
      recorded_by UUID REFERENCES users(id),
      recorded_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS score_revisions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_score_id UUID REFERENCES student_scores(id) ON DELETE CASCADE,
      previous_score NUMERIC,
      new_score NUMERIC,
      reason TEXT,
      revised_by UUID REFERENCES users(id),
      revised_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS term_grades (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
      trimester_id UUID REFERENCES trimestres(id) ON DELETE CASCADE,
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      subject_offering_id UUID REFERENCES subject_offerings(id) ON DELETE CASCADE,
      final_score NUMERIC NOT NULL,
      letter_grade VARCHAR(5),
      is_locked BOOLEAN DEFAULT FALSE,
      calculated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS report_cards (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
      trimester_id UUID REFERENCES trimestres(id) ON DELETE CASCADE,
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
      total_score NUMERIC DEFAULT 0,
      average_score NUMERIC DEFAULT 0,
      rank_in_class INT,
      homeroom_notes TEXT,
      principal_notes TEXT,
      status VARCHAR(50) DEFAULT 'DRAFT',
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS report_card_subjects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      report_card_id UUID REFERENCES report_cards(id) ON DELETE CASCADE,
      subject_offering_id UUID REFERENCES subject_offerings(id) ON DELETE CASCADE,
      score NUMERIC NOT NULL,
      letter_grade VARCHAR(5),
      teacher_notes TEXT
    );

    CREATE TABLE IF NOT EXISTS promotion_decisions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      from_grade_id UUID REFERENCES grade_levels(id),
      to_grade_id UUID REFERENCES grade_levels(id),
      decision VARCHAR(50) NOT NULL,
      notes TEXT,
      decided_by UUID REFERENCES users(id),
      decided_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS national_exam_records (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
      exam_year INT NOT NULL,
      exam_number VARCHAR(50) UNIQUE NOT NULL,
      portugues_score NUMERIC NOT NULL,
      ingles_score NUMERIC NOT NULL,
      matematika_score NUMERIC NOT NULL,
      spesifika_score NUMERIC NOT NULL,
      final_average NUMERIC NOT NULL,
      status VARCHAR(20) DEFAULT 'LIU',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS fee_types (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      is_recurring BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS fee_plans (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
      fee_type_id UUID REFERENCES fee_types(id) ON DELETE CASCADE,
      grade_level_id UUID REFERENCES grade_levels(id),
      name VARCHAR(100) NOT NULL,
      amount NUMERIC NOT NULL,
      due_day INT DEFAULT 10
    );

    CREATE TABLE IF NOT EXISTS student_fee_assignments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      fee_plan_id UUID REFERENCES fee_plans(id) ON DELETE CASCADE,
      custom_amount NUMERIC,
      is_active BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS discounts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      discount_type VARCHAR(20) DEFAULT 'FIXED',
      amount NUMERIC NOT NULL,
      is_active BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS scholarships (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      scholarship_name VARCHAR(100) NOT NULL,
      sponsor VARCHAR(100) NOT NULL,
      coverage_percent NUMERIC DEFAULT 100.0,
      valid_year_id UUID REFERENCES academic_years(id)
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      invoice_number VARCHAR(50) UNIQUE NOT NULL,
      fee_plan_id UUID REFERENCES fee_plans(id),
      title VARCHAR(255) NOT NULL,
      issue_date DATE NOT NULL,
      due_date DATE NOT NULL,
      subtotal NUMERIC NOT NULL,
      discount_amount NUMERIC DEFAULT 0,
      total_amount NUMERIC NOT NULL,
      paid_amount NUMERIC DEFAULT 0,
      status VARCHAR(50) DEFAULT 'SEIDAUK_SELU',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
      description VARCHAR(255) NOT NULL,
      amount NUMERIC NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      payment_number VARCHAR(50) UNIQUE NOT NULL,
      payment_date DATE NOT NULL,
      amount NUMERIC NOT NULL,
      payment_method VARCHAR(50) DEFAULT 'CASH',
      reference_no VARCHAR(100),
      received_by UUID REFERENCES users(id),
      status VARCHAR(50) DEFAULT 'VERIFIKADU',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payment_allocations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
      invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
      allocated_amount NUMERIC NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payment_reversals (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
      reversal_date DATE NOT NULL,
      reason TEXT NOT NULL,
      reversed_by UUID REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS receipts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      receipt_number VARCHAR(50) UNIQUE NOT NULL,
      payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
      issued_at TIMESTAMPTZ DEFAULT NOW(),
      issued_by UUID REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS counseling_cases (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      counselor_id UUID REFERENCES users(id),
      case_number VARCHAR(50) UNIQUE NOT NULL,
      category VARCHAR(100) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'ABERTO',
      is_confidential BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS counseling_follow_ups (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      case_id UUID REFERENCES counseling_cases(id) ON DELETE CASCADE,
      follow_up_date DATE NOT NULL,
      notes TEXT NOT NULL,
      counselor_id UUID REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS discipline_incidents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      incident_date DATE NOT NULL,
      infraction_type VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      severity VARCHAR(20) DEFAULT 'KAMAN',
      action_taken TEXT,
      points INT DEFAULT 5,
      reported_by UUID REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS extracurricular_activities (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      description TEXT,
      supervisor_id UUID REFERENCES users(id),
      schedule_info VARCHAR(255)
    );

    CREATE TABLE IF NOT EXISTS extracurricular_memberships (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      activity_id UUID REFERENCES extracurricular_activities(id) ON DELETE CASCADE,
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      joined_date DATE NOT NULL,
      role VARCHAR(50) DEFAULT 'Membru'
    );

    CREATE TABLE IF NOT EXISTS extracurricular_attendances (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      activity_id UUID REFERENCES extracurricular_activities(id) ON DELETE CASCADE,
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      event_date DATE NOT NULL,
      status VARCHAR(20) DEFAULT 'PREZENTE'
    );

    CREATE TABLE IF NOT EXISTS library_books (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      isbn VARCHAR(50),
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      publisher VARCHAR(255),
      publication_year INT,
      category VARCHAR(100) NOT NULL,
      total_copies INT DEFAULT 1,
      available_copies INT DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS library_copies (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      book_id UUID REFERENCES library_books(id) ON DELETE CASCADE,
      barcode VARCHAR(50) UNIQUE NOT NULL,
      condition VARCHAR(20) DEFAULT 'DIAK',
      is_available BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS library_loans (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      copy_id UUID REFERENCES library_copies(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id),
      student_id UUID REFERENCES students(id),
      loan_date DATE NOT NULL,
      due_date DATE NOT NULL,
      return_date DATE,
      status VARCHAR(50) DEFAULT 'ATIVU',
      issued_by UUID REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS assets (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      asset_tag VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      location VARCHAR(100) NOT NULL,
      purchase_date DATE,
      cost NUMERIC DEFAULT 0,
      condition VARCHAR(50) DEFAULT 'DIAK',
      status VARCHAR(50) DEFAULT 'ATIVU'
    );

    CREATE TABLE IF NOT EXISTS asset_assignments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
      assigned_to_user_id UUID REFERENCES users(id),
      assigned_to_room VARCHAR(100),
      assigned_date DATE NOT NULL,
      returned_date DATE
    );

    CREATE TABLE IF NOT EXISTS asset_maintenances (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
      maintenance_date DATE NOT NULL,
      description TEXT NOT NULL,
      cost NUMERIC DEFAULT 0,
      performed_by VARCHAR(255)
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      target_audience VARCHAR(50) DEFAULT 'HOTU',
      is_pinned BOOLEAN DEFAULT FALSE,
      is_published BOOLEAN DEFAULT TRUE,
      published_at TIMESTAMPTZ DEFAULT NOW(),
      published_by UUID REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      link VARCHAR(255),
      is_read BOOLEAN DEFAULT FALSE,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      endpoint TEXT NOT NULL,
      keys_p256dh TEXT NOT NULL,
      keys_auth TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS stored_files (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      file_name VARCHAR(255) NOT NULL,
      file_path TEXT NOT NULL,
      file_size INT,
      mime_type VARCHAR(100),
      uploaded_by UUID REFERENCES users(id),
      category VARCHAR(100),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS generated_documents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      document_type VARCHAR(100) NOT NULL,
      document_number VARCHAR(100) UNIQUE NOT NULL,
      student_id UUID REFERENCES students(id),
      template_name VARCHAR(100),
      file_url TEXT,
      generated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id),
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id VARCHAR(100),
      details JSONB,
      ip_address VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('Tabela sira hotu kria ona ho susesu!');
}
