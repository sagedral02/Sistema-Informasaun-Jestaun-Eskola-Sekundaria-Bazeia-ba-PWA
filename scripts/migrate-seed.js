const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_tGIsv9Lcb2dM@ep-misty-union-b4royls5.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  console.log('--- HAHU INISIALIZASAUN DATABASE NEON (esc.nossef) ---');
  const client = await pool.connect();
  try {
    console.log('1. Kria tabela sira hotu...');
    await client.query(`
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
    console.log('Tabela sira hotu kria ona!');

    // Check if school already seeded
    const chk = await client.query('SELECT id FROM school_profile LIMIT 1');
    if (chk.rows.length > 0) {
      console.log('Dadus inisiál eziste ona iha database.');
      return;
    }

    console.log('2. Hahu seed dadus...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('nossef2026', salt);

    // Roles
    const roles = [
      { code: 'SUPER_ADMIN', name: 'Administradór Prinsipál Sistema' },
      { code: 'SCHOOL_ADMIN', name: 'Sekretária & Administrasaun Eskola' },
      { code: 'PRINCIPAL', name: 'Diretór Eskola' },
      { code: 'CURRICULUM_ADMIN', name: 'Xefe Departamentu Kurríkulu' },
      { code: 'FINANCE_ADMIN', name: 'Tezoureiru & Administradór Finansas' },
      { code: 'ADMISSION_OFFICER', name: 'Ofisiál Admisasaun & Rejistu' },
      { code: 'TEACHER', name: 'Mestre / Profesór' },
      { code: 'HOMEROOM_TEACHER', name: 'Mestre Titulár Klase' },
      { code: 'COUNSELOR', name: 'Orientadór & Konsellór (BK)' },
      { code: 'LIBRARIAN', name: 'Bibliotekáriu' },
      { code: 'ASSET_OFFICER', name: 'Responsável Patrimóniu & Sasán' },
      { code: 'STAFF', name: 'Funsionáriu Administrativu' },
      { code: 'STUDENT', name: 'Estudante' },
      { code: 'GUARDIAN', name: 'Enkaregadu de Edukasaun / Inan-Aman' },
    ];

    const roleMap = {};
    for (const r of roles) {
      const res = await client.query(
        'INSERT INTO roles (code, name, is_system_role) VALUES ($1, $2, TRUE) RETURNING id, code',
        [r.code, r.name]
      );
      roleMap[res.rows[0].code] = res.rows[0].id;
    }

    // Users
    const users = [
      {
        email: 'admin@nossef.edu.tl',
        phone: '+670 7711 0001',
        national_id: 'TL-19850101-001',
        full_name: 'Maria Madalena Soares, S.Pd',
        role: 'SUPER_ADMIN',
        roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
        is_staff: true,
        is_superuser: true,
      },
      {
        email: 'diretor@nossef.edu.tl',
        phone: '+670 7711 0002',
        national_id: 'TL-19720315-002',
        full_name: 'Pe. Guilhermino da Silva, SJ',
        role: 'PRINCIPAL',
        roles: ['PRINCIPAL'],
        is_staff: true,
        is_superuser: false,
      },
      {
        email: 'kurrikulu@nossef.edu.tl',
        phone: '+670 7711 0003',
        national_id: 'TL-19800520-003',
        full_name: 'Lourenço dos Santos, Lic.Ed',
        role: 'CURRICULUM_ADMIN',
        roles: ['CURRICULUM_ADMIN', 'TEACHER'],
        is_staff: true,
        is_superuser: false,
      },
      {
        email: 'finansas@nossef.edu.tl',
        phone: '+670 7711 0004',
        national_id: 'TL-19781112-004',
        full_name: 'Madre Teresa Noronha, RVM',
        role: 'FINANCE_ADMIN',
        roles: ['FINANCE_ADMIN'],
        is_staff: true,
        is_superuser: false,
      },
      {
        email: 'admisasaun@nossef.edu.tl',
        phone: '+670 7711 0005',
        national_id: 'TL-19890214-005',
        full_name: 'Filomena Barreto, B.Ed',
        role: 'ADMISSION_OFFICER',
        roles: ['ADMISSION_OFFICER', 'STAFF'],
        is_staff: true,
        is_superuser: false,
      },
      {
        email: 'mestre.matematika@nossef.edu.tl',
        phone: '+670 7711 0006',
        national_id: 'TL-19830409-006',
        full_name: 'Mestre Domingos da Costa',
        role: 'TEACHER',
        roles: ['TEACHER', 'HOMEROOM_TEACHER'],
        is_staff: true,
        is_superuser: false,
      },
      {
        email: 'mestre.portugues@nossef.edu.tl',
        phone: '+670 7711 0007',
        national_id: 'TL-19860718-007',
        full_name: 'Mestra Jacinta Pereira, Lic.Letras',
        role: 'TEACHER',
        roles: ['TEACHER'],
        is_staff: true,
        is_superuser: false,
      },
      {
        email: 'konsellu@nossef.edu.tl',
        phone: '+670 7711 0008',
        national_id: 'TL-19810925-008',
        full_name: 'Sra. Beatriz da Conceição, M.Psi',
        role: 'COUNSELOR',
        roles: ['COUNSELOR'],
        is_staff: true,
        is_superuser: false,
      },
      {
        email: 'biblioteka@nossef.edu.tl',
        phone: '+670 7711 0009',
        national_id: 'TL-19900130-009',
        full_name: 'João Baptista Martins',
        role: 'LIBRARIAN',
        roles: ['LIBRARIAN'],
        is_staff: true,
        is_superuser: false,
      },
      {
        email: 'patrimoniu@nossef.edu.tl',
        phone: '+670 7711 0010',
        national_id: 'TL-19871205-010',
        full_name: 'Afonso Guterres',
        role: 'ASSET_OFFICER',
        roles: ['ASSET_OFFICER'],
        is_staff: true,
        is_superuser: false,
      },
      {
        email: 'estudante1@nossef.edu.tl',
        phone: '+670 7711 0011',
        national_id: 'TL-20080612-011',
        full_name: 'António Soares Guterres',
        role: 'STUDENT',
        roles: ['STUDENT'],
        is_staff: false,
        is_superuser: false,
      },
      {
        email: 'enkaregadu1@nossef.edu.tl',
        phone: '+670 7711 0012',
        national_id: 'TL-19750808-012',
        full_name: 'Manuel Guterres (Aman)',
        role: 'GUARDIAN',
        roles: ['GUARDIAN'],
        is_staff: false,
        is_superuser: false,
      },
    ];

    const userMap = {};
    for (const u of users) {
      const res = await client.query(
        `INSERT INTO users (email, phone, national_id, full_name, password_hash, is_staff, is_superuser)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email`,
        [u.email, u.phone, u.national_id, u.full_name, passwordHash, u.is_staff, u.is_superuser]
      );
      const uid = res.rows[0].id;
      userMap[u.email] = uid;

      for (const rCode of u.roles) {
        if (roleMap[rCode]) {
          await client.query(
            'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [uid, roleMap[rCode]]
          );
        }
      }
    }

    // Academic Year
    const yearRes = await client.query(`
      INSERT INTO academic_years (code, name, start_date, end_date, is_active, is_closed)
      VALUES ('2026/2027', 'Tinan Akadémiku 2026/2027', '2026-01-15', '2026-12-15', TRUE, FALSE)
      RETURNING id
    `);
    const academicYearId = yearRes.rows[0].id;

    // School Profile
    await client.query(
      `INSERT INTO school_profile (code, official_name, short_name, foundation_year, address, administrative_post, municipality, country, phone, email, principal_name, emblem_url, active_academic_year_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        'NOSSEF-01',
        'Escola Secundaria Catolica Nossa Senhora de Fatima Railaco',
        'NOSSEF Railaco',
        1993,
        'Estrada Principal Railaco, Vila de Railaco',
        'Railaco',
        'Ermera',
        'Timor-Leste',
        '+670 7723 4567',
        'sekretaria.nossef@gmail.com',
        'Pe. Guilhermino da Silva, SJ',
        '/icons/icon-512x512.png',
        academicYearId,
      ]
    );

    // Trimesters
    const t1Res = await client.query(`
      INSERT INTO trimestres (academic_year_id, number, name, cau_number, start_date, end_date, is_active, is_closed)
      VALUES ($1, 1, 'Trimestre 1 (CAU 1)', 1, '2026-01-15', '2026-04-30', TRUE, FALSE) RETURNING id
    `, [academicYearId]);
    const t1Id = t1Res.rows[0].id;

    const t2Res = await client.query(`
      INSERT INTO trimestres (academic_year_id, number, name, cau_number, start_date, end_date, is_active, is_closed)
      VALUES ($1, 2, 'Trimestre 2 (CAU 2)', 2, '2026-05-15', '2026-08-31', FALSE, FALSE) RETURNING id
    `, [academicYearId]);
    const t2Id = t2Res.rows[0].id;

    const t3Res = await client.query(`
      INSERT INTO trimestres (academic_year_id, number, name, cau_number, start_date, end_date, is_active, is_closed)
      VALUES ($1, 3, 'Trimestre 3 (CAU 3)', 3, '2026-09-15', '2026-12-15', FALSE, FALSE) RETURNING id
    `, [academicYearId]);
    const t3Id = t3Res.rows[0].id;

    // Grades
    const gX = (await client.query(`INSERT INTO grade_levels (code, name, order_index) VALUES ('X', '10.º Ano (Klase X)', 10) RETURNING id`)).rows[0].id;
    const gXI = (await client.query(`INSERT INTO grade_levels (code, name, order_index) VALUES ('XI', '11.º Ano (Klase XI)', 11) RETURNING id`)).rows[0].id;
    const gXII = (await client.query(`INSERT INTO grade_levels (code, name, order_index) VALUES ('XII', '12.º Ano (Klase XII)', 12) RETURNING id`)).rows[0].id;

    // Majors
    const mCT = (await client.query(`INSERT INTO majors (code, name) VALUES ('CT', 'Ciências Naturais (Siénsia Naturál / IPA)') RETURNING id`)).rows[0].id;
    const mCSH = (await client.query(`INSERT INTO majors (code, name) VALUES ('CSH', 'Ciências Sociais e Humanidades (Siénsia Sosiál / IPS)') RETURNING id`)).rows[0].id;

    // Classrooms
    const c10CT = (await client.query(
      `INSERT INTO classrooms (academic_year_id, grade_level_id, major_id, code, name, room_number, capacity, homeroom_teacher_id)
       VALUES ($1, $2, $3, '10-CT-A', '10.º Ano CT-A', 'Sala 01 - S. Inácio', 35, $4) RETURNING id`,
      [academicYearId, gX, mCT, userMap['mestre.matematika@nossef.edu.tl']]
    )).rows[0].id;

    const c10CSH = (await client.query(
      `INSERT INTO classrooms (academic_year_id, grade_level_id, major_id, code, name, room_number, capacity, homeroom_teacher_id)
       VALUES ($1, $2, $3, '10-CSH-A', '10.º Ano CSH-A', 'Sala 02 - S. Francisco Xavier', 35, $4) RETURNING id`,
      [academicYearId, gX, mCSH, userMap['mestre.portugues@nossef.edu.tl']]
    )).rows[0].id;

    const c11CT = (await client.query(
      `INSERT INTO classrooms (academic_year_id, grade_level_id, major_id, code, name, room_number, capacity, homeroom_teacher_id)
       VALUES ($1, $2, $3, '11-CT-A', '11.º Ano CT-A', 'Sala 03 - Sto. Alberto', 35, $4) RETURNING id`,
      [academicYearId, gXI, mCT, userMap['mestre.matematika@nossef.edu.tl']]
    )).rows[0].id;

    const c12CT = (await client.query(
      `INSERT INTO classrooms (academic_year_id, grade_level_id, major_id, code, name, room_number, capacity, homeroom_teacher_id)
       VALUES ($1, $2, $3, '12-CT-A', '12.º Ano CT-A', 'Sala 05 - N. S. de Fátima', 35, $4) RETURNING id`,
      [academicYearId, gXII, mCT, userMap['kurrikulu@nossef.edu.tl']]
    )).rows[0].id;

    // Subjects
    const subjects = [
      { code: 'POR', name: 'Língua Portuguesa' },
      { code: 'TET', name: 'Língua Tetun' },
      { code: 'ING', name: 'Língua Inglesa' },
      { code: 'MAT', name: 'Matemátika' },
      { code: 'FIS', name: 'Fízika' },
      { code: 'QUI', name: 'Kímika' },
      { code: 'BIO', name: 'Biolojia' },
      { code: 'IST', name: 'Istória de Timor-Leste & Mundiál' },
      { code: 'GEO', name: 'Jeografia' },
      { code: 'REL', name: 'Relijiaun Katólika & Morál' },
      { code: 'EDF', name: 'Edukasaun Fízika & Desportu' },
      { code: 'FIL', name: 'Filozofia' },
    ];

    const subMap = {};
    for (const s of subjects) {
      const res = await client.query(
        'INSERT INTO subjects (code, name, is_active) VALUES ($1, $2, TRUE) RETURNING id, code',
        [s.code, s.name]
      );
      subMap[res.rows[0].code] = res.rows[0].id;
    }

    // Offerings
    const offeringMat = (await client.query(
      `INSERT INTO subject_offerings (academic_year_id, grade_level_id, major_id, subject_id, weekly_periods, passing_score, credit_hours)
       VALUES ($1, $2, $3, $4, 5, 10.0, 3) RETURNING id`,
      [academicYearId, gX, mCT, subMap['MAT']]
    )).rows[0].id;

    const offeringPor = (await client.query(
      `INSERT INTO subject_offerings (academic_year_id, grade_level_id, major_id, subject_id, weekly_periods, passing_score, credit_hours)
       VALUES ($1, $2, $3, $4, 4, 10.0, 3) RETURNING id`,
      [academicYearId, gX, mCT, subMap['POR']]
    )).rows[0].id;

    // Teaching Assignments
    const taMat = (await client.query(
      `INSERT INTO teaching_assignments (academic_year_id, classroom_id, subject_offering_id, teacher_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [academicYearId, c10CT, offeringMat, userMap['mestre.matematika@nossef.edu.tl']]
    )).rows[0].id;

    const taPor = (await client.query(
      `INSERT INTO teaching_assignments (academic_year_id, classroom_id, subject_offering_id, teacher_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [academicYearId, c10CT, offeringPor, userMap['mestre.portugues@nossef.edu.tl']]
    )).rows[0].id;

    // Assessment types
    const atTpk = (await client.query(`INSERT INTO assessment_types (code, name, default_weight) VALUES ('TPK', 'Trabalho de Casa / TPK', 20.0) RETURNING id`)).rows[0].id;
    const atPar = (await client.query(`INSERT INTO assessment_types (code, name, default_weight) VALUES ('PAR', 'Teste Pársiál Escritu', 30.0) RETURNING id`)).rows[0].id;
    const atCau = (await client.query(`INSERT INTO assessment_types (code, name, default_weight) VALUES ('CAU', 'Ezame Trimestrál (CAU)', 50.0) RETURNING id`)).rows[0].id;

    // Admissions
    const admPeriod = (await client.query(`
      INSERT INTO admission_periods (code, name, academic_year_id, start_date, end_date, is_open)
      VALUES ('ADM-2026', 'Admisasaun & Matríkula Foun 2026', $1, '2026-01-02', '2026-01-20', TRUE) RETURNING id
    `, [academicYearId])).rows[0].id;

    await client.query(`
      INSERT INTO applicants (admission_period_id, application_no, full_name, gender, birth_date, birth_place, previous_school, chosen_major_id, status)
      VALUES ($1, 'APP-2026-001', 'Bernardino da Costa Martins', 'Mane', '2009-03-12', 'Railaco Craic', 'Eskola Pré-Sekundária Railaco', $2, 'ACCEPTED')
    `, [admPeriod, mCT]);

    await client.query(`
      INSERT INTO applicants (admission_period_id, application_no, full_name, gender, birth_date, birth_place, previous_school, chosen_major_id, status)
      VALUES ($1, 'APP-2026-002', 'Filomena de Jesus Soares', 'Feto', '2009-08-25', 'Gleno, Ermera', 'Eskola Catolica Gleno', $2, 'SUBMITTED')
    `, [admPeriod, mCSH]);

    // Students
    const s1 = (await client.query(`
      INSERT INTO students (user_id, student_no, full_name, gender, birth_date, birth_place, address, phone, entry_year, status)
      VALUES ($1, 'NOSSEF-2026-0101', 'António Soares Guterres', 'Mane', '2008-06-12', 'Railaco Vila', 'Aldeia Railaco Craic, Ermera', '+670 7711 0011', 2026, 'ATIVU') RETURNING id
    `, [userMap['estudante1@nossef.edu.tl']])).rows[0].id;

    const g1 = (await client.query(`
      INSERT INTO guardians (user_id, full_name, relationship, phone, address, occupation)
      VALUES ($1, 'Manuel Guterres', 'Aman', '+670 7711 0012', 'Aldeia Railaco Craic, Ermera', 'Agrikultór') RETURNING id
    `, [userMap['enkaregadu1@nossef.edu.tl']])).rows[0].id;

    await client.query(
      `INSERT INTO student_guardians (student_id, guardian_id, is_primary, can_pickup) VALUES ($1, $2, TRUE, TRUE)`,
      [s1, g1]
    );

    await client.query(`
      INSERT INTO student_enrollments (academic_year_id, student_id, grade_level_id, major_id, classroom_id, enrollment_date, status)
      VALUES ($1, $2, $3, $4, $5, '2026-01-15', 'ACTIVE')
    `, [academicYearId, s1, gX, mCT, c10CT]);

    const s2 = (await client.query(`
      INSERT INTO students (student_no, full_name, gender, birth_date, birth_place, address, phone, entry_year, status)
      VALUES ('NOSSEF-2026-0102', 'Maria Madalena Tilman', 'Feto', '2008-09-18', 'Ermera Vila', 'Aldeia Colmera, Railaco', '+670 7788 1234', 2026, 'ATIVU') RETURNING id
    `)).rows[0].id;

    await client.query(`
      INSERT INTO student_enrollments (academic_year_id, student_id, grade_level_id, major_id, classroom_id, enrollment_date, status)
      VALUES ($1, $2, $3, $4, $5, '2026-01-15', 'ACTIVE')
    `, [academicYearId, s2, gX, mCT, c10CT]);

    // Grade XII student
    const s3 = (await client.query(`
      INSERT INTO students (student_no, full_name, gender, birth_date, birth_place, address, phone, entry_year, status)
      VALUES ('NOSSEF-2024-0045', 'João Bosco da Silva', 'Mane', '2006-11-04', 'Dili', 'Vila de Railaco, Ermera', '+670 7734 5678', 2024, 'ATIVU') RETURNING id
    `)).rows[0].id;

    await client.query(`
      INSERT INTO student_enrollments (academic_year_id, student_id, grade_level_id, major_id, classroom_id, enrollment_date, status)
      VALUES ($1, $2, $3, $4, $5, '2026-01-15', 'ACTIVE')
    `, [academicYearId, s3, gXII, mCT, c12CT]);

    // Timetable
    const sch1 = (await client.query(`
      INSERT INTO schedule_entries (academic_year_id, classroom_id, subject_offering_id, teacher_id, day_of_week, period_number, start_time, end_time, room_number)
      VALUES ($1, $2, $3, $4, 1, 1, '08:00:00', '08:45:00', 'Sala 01 - S. Inácio') RETURNING id
    `, [academicYearId, c10CT, offeringMat, userMap['mestre.matematika@nossef.edu.tl']])).rows[0].id;

    await client.query(`
      INSERT INTO schedule_entries (academic_year_id, classroom_id, subject_offering_id, teacher_id, day_of_week, period_number, start_time, end_time, room_number)
      VALUES ($1, $2, $3, $4, 1, 2, '08:45:00', '09:30:00', 'Sala 01 - S. Inácio')
    `, [academicYearId, c10CT, offeringMat, userMap['mestre.matematika@nossef.edu.tl']]);

    // Attendance
    const attSession = (await client.query(`
      INSERT INTO attendance_sessions (academic_year_id, trimester_id, classroom_id, schedule_entry_id, session_date, session_mode, recorded_by, is_submitted, submitted_at)
      VALUES ($1, $2, $3, $4, '2026-10-06', 'DAILY', $5, TRUE, NOW()) RETURNING id
    `, [academicYearId, t1Id, c10CT, sch1, userMap['mestre.matematika@nossef.edu.tl']])).rows[0].id;

    await client.query(`
      INSERT INTO attendance_records (session_id, student_id, status, notes)
      VALUES ($1, $2, 'PREZENTE', 'Prezente pontuál')
    `, [attSession, s1]);

    await client.query(`
      INSERT INTO attendance_records (session_id, student_id, status, notes)
      VALUES ($1, $2, 'LISENSA', 'Lisensa família nian')
    `, [attSession, s2]);

    // Assessments & CAU 1
    const ass1 = (await client.query(`
      INSERT INTO assessments (teaching_assignment_id, trimester_id, assessment_type_id, title, max_score, date_administered, is_locked)
      VALUES ($1, $2, $3, 'TPK 1: Funsaun Kuadrátika', 20.0, '2026-02-15', TRUE) RETURNING id
    `, [taMat, t1Id, atTpk])).rows[0].id;

    await client.query(`
      INSERT INTO student_scores (assessment_id, student_id, score, letter_grade, recorded_by)
      VALUES ($1, $2, 16.5, 'B', $3)
    `, [ass1, s1, userMap['mestre.matematika@nossef.edu.tl']]);

    await client.query(`
      INSERT INTO student_scores (assessment_id, student_id, score, letter_grade, recorded_by)
      VALUES ($1, $2, 14.0, 'C', $3)
    `, [ass1, s2, userMap['mestre.matematika@nossef.edu.tl']]);

    const assCau1 = (await client.query(`
      INSERT INTO assessments (teaching_assignment_id, trimester_id, assessment_type_id, title, max_score, date_administered, is_locked)
      VALUES ($1, $2, $3, 'Ezame CAU 1 - Trimestre 1', 20.0, '2026-04-20', TRUE) RETURNING id
    `, [taMat, t1Id, atCau])).rows[0].id;

    await client.query(`
      INSERT INTO student_scores (assessment_id, student_id, score, letter_grade, recorded_by)
      VALUES ($1, $2, 17.0, 'B', $3)
    `, [assCau1, s1, userMap['mestre.matematika@nossef.edu.tl']]);

    await client.query(`
      INSERT INTO student_scores (assessment_id, student_id, score, letter_grade, recorded_by)
      VALUES ($1, $2, 15.0, 'C', $3)
    `, [assCau1, s2, userMap['mestre.matematika@nossef.edu.tl']]);

    // Term Grades
    await client.query(`
      INSERT INTO term_grades (academic_year_id, trimester_id, student_id, subject_offering_id, final_score, letter_grade, is_locked)
      VALUES ($1, $2, $3, $4, 16.8, 'B', TRUE)
    `, [academicYearId, t1Id, s1, offeringMat]);

    await client.query(`
      INSERT INTO term_grades (academic_year_id, trimester_id, student_id, subject_offering_id, final_score, letter_grade, is_locked)
      VALUES ($1, $2, $3, $4, 14.6, 'C', TRUE)
    `, [academicYearId, t1Id, s2, offeringMat]);

    // Report Card
    const rc1 = (await client.query(`
      INSERT INTO report_cards (academic_year_id, trimester_id, student_id, classroom_id, total_score, average_score, rank_in_class, homeroom_notes, principal_notes, status, published_at)
      VALUES ($1, $2, $3, $4, 16.8, 16.8, 1, 'Estudante hatudu dedikasaun no komportamentu ne''ebé ezemplár tebes.', 'Parabéns no kontinua esforsu!', 'PUBLISHED', NOW())
      RETURNING id
    `, [academicYearId, t1Id, s1, c10CT])).rows[0].id;

    await client.query(`
      INSERT INTO report_card_subjects (report_card_id, subject_offering_id, score, letter_grade, teacher_notes)
      VALUES ($1, $2, 16.8, 'B', 'Domina konseitu matemátika ho di''ak tebes.')
    `, [rc1, offeringMat]);

    // National Exam Grade XII
    await client.query(`
      INSERT INTO national_exam_records (student_id, academic_year_id, exam_year, exam_number, portugues_score, ingles_score, matematika_score, spesifika_score, final_average, status)
      VALUES ($1, $2, 2026, 'EX-NAT-2026-0881', 15.5, 16.0, 17.5, 16.8, 16.45, 'LIU')
    `, [s3, academicYearId]);

    // Finance & Fees
    const feeSpp = (await client.query(`
      INSERT INTO fee_types (code, name, is_recurring)
      VALUES ('MENSALIDADE', 'Mensalidade Eskolár (SPP)', TRUE) RETURNING id
    `)).rows[0].id;

    const fp10 = (await client.query(`
      INSERT INTO fee_plans (academic_year_id, fee_type_id, grade_level_id, name, amount, due_day)
      VALUES ($1, $2, $3, 'Mensalidade 10.º Ano 2026', 15.00, 10) RETURNING id
    `, [academicYearId, feeSpp, gX])).rows[0].id;

    const inv1 = (await client.query(`
      INSERT INTO invoices (student_id, invoice_number, fee_plan_id, title, issue_date, due_date, subtotal, discount_amount, total_amount, paid_amount, status)
      VALUES ($1, 'FAT-2026-01-001', $2, 'Mensalidade Fulan Janeiru 2026', '2026-01-05', '2026-01-15', 15.00, 0, 15.00, 15.00, 'SELU_ONA') RETURNING id
    `, [s1, fp10])).rows[0].id;

    await client.query(`
      INSERT INTO invoice_items (invoice_id, description, amount)
      VALUES ($1, 'Mensalidade Fulan Janeiru 2026 - 10.º Ano CT-A', 15.00)
    `, [inv1]);

    const pay1 = (await client.query(`
      INSERT INTO payments (student_id, payment_number, payment_date, amount, payment_method, reference_no, received_by, status)
      VALUES ($1, 'PAG-2026-01-001', '2026-01-10', 15.00, 'CASH', 'CASH-REC-001', $2, 'VERIFIKADU') RETURNING id
    `, [s1, userMap['finansas@nossef.edu.tl']])).rows[0].id;

    await client.query(`
      INSERT INTO payment_allocations (payment_id, invoice_id, allocated_amount)
      VALUES ($1, $2, 15.00)
    `, [pay1, inv1]);

    await client.query(`
      INSERT INTO receipts (receipt_number, payment_id, issued_at, issued_by)
      VALUES ('REC-2026-0001', $1, NOW(), $2)
    `, [pay1, userMap['finansas@nossef.edu.tl']]);

    // Unpaid invoice for Feb
    const inv2 = (await client.query(`
      INSERT INTO invoices (student_id, invoice_number, fee_plan_id, title, issue_date, due_date, subtotal, discount_amount, total_amount, paid_amount, status)
      VALUES ($1, 'FAT-2026-02-001', $2, 'Mensalidade Fulan Fevereiru 2026', '2026-02-01', '2026-02-15', 15.00, 0, 15.00, 0.00, 'SEIDAUK_SELU') RETURNING id
    `, [s1, fp10])).rows[0].id;

    await client.query(`
      INSERT INTO invoice_items (invoice_id, description, amount)
      VALUES ($1, 'Mensalidade Fulan Fevereiru 2026 - 10.º Ano CT-A', 15.00)
    `, [inv2]);

    // Counseling
    const case1 = (await client.query(`
      INSERT INTO counseling_cases (student_id, counselor_id, case_number, category, title, description, status, is_confidential)
      VALUES ($1, $2, 'BK-2026-001', 'Orientasaun Vokasionál', 'Diskusaun Vokasaun & Planu Universitáriu', 'Estudante hakarak konsellu kona-ba hili kursu Medisina ka Enjeñaria iha Universidade.', 'REZOLVIDU', TRUE)
      RETURNING id
    `, [s1, userMap['konsellu@nossef.edu.tl']])).rows[0].id;

    await client.query(`
      INSERT INTO counseling_follow_ups (case_id, follow_up_date, notes, counselor_id)
      VALUES ($1, '2026-03-01', 'Fó ona informasaun kona-ba rekezitu no bolsa de estudu.', $2)
    `, [case1, userMap['konsellu@nossef.edu.tl']]);

    // Extracurricular
    const extraKoral = (await client.query(`
      INSERT INTO extracurricular_activities (name, description, supervisor_id, schedule_info)
      VALUES ('Korál Nossa Senhora de Fátima', 'Grupu korál misa no kantu litúrjiku eskola nian', $1, 'Loron Sesta 14:00 - 16:00') RETURNING id
    `, [userMap['mestre.portugues@nossef.edu.tl']])).rows[0].id;

    await client.query(`
      INSERT INTO extracurricular_activities (name, description, supervisor_id, schedule_info)
      VALUES ('Klube Futebol NOSSEF Railaco', 'Ekipa futebol no desportu inter-eskolár Railaco', $1, 'Loron Sábadu 08:00 - 10:30')
    `, [userMap['mestre.matematika@nossef.edu.tl']]);

    await client.query(`
      INSERT INTO extracurricular_memberships (activity_id, student_id, joined_date, role)
      VALUES ($1, $2, '2026-01-20', 'Kantór Tenor')
    `, [extraKoral, s1]);

    // Library
    const book1 = (await client.query(`
      INSERT INTO library_books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies)
      VALUES ('978-989-8260-12-3', 'Matemática para o Ensino Secundário', 'Prof. Carlos Alberto', 'Lidel Edições Técnicas', 2021, 'Matemátika & Siénsia', 15, 14) RETURNING id
    `)).rows[0].id;

    await client.query(`
      INSERT INTO library_books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies)
      VALUES ('978-989-655-001-8', 'Gramática da Língua Portuguesa', 'Maria Helena Mira Mateus', 'Caminho', 2020, 'Língua & Literatura', 20, 20)
    `);

    const copy1 = (await client.query(`
      INSERT INTO library_copies (book_id, barcode, condition, is_available)
      VALUES ($1, 'BC-NOSSEF-00101', 'DIAK', FALSE) RETURNING id
    `, [book1])).rows[0].id;

    await client.query(`
      INSERT INTO library_loans (copy_id, student_id, loan_date, due_date, status, issued_by)
      VALUES ($1, $2, '2026-10-01', '2026-10-15', 'ATIVU', $3)
    `, [copy1, s1, userMap['biblioteka@nossef.edu.tl']]);

    // Assets
    await client.query(`
      INSERT INTO assets (asset_tag, name, category, location, purchase_date, cost, condition, status)
      VALUES ('AST-NOSSEF-001', 'Projetor Epson EB-X51', 'Eletróniku', 'Sala 01 - S. Inácio', '2024-03-10', 450.00, 'DIAK', 'ATIVU')
    `);

    await client.query(`
      INSERT INTO assets (asset_tag, name, category, location, purchase_date, cost, condition, status)
      VALUES ('AST-NOSSEF-002', 'Kadeira & Meza Estudante (Set 35)', 'Mobiliáriu', 'Sala 01 - S. Inácio', '2023-01-15', 1050.00, 'DIAK', 'ATIVU')
    `);

    // Announcements
    await client.query(`
      INSERT INTO announcements (title, content, target_audience, is_pinned, is_published, published_at, published_by)
      VALUES (
        'Avizu ba Ezame CAU 1 no Selu Mensalidade',
        'Notifika ba inan-aman no estudante hotu katak ezame CAU 1 sei hahu tuir orariu ne''ebe trasa ona. Favór regulariza konta mensalidade iha tezouraria antes semana ezame nian.',
        'HOTU',
        TRUE,
        TRUE,
        NOW(),
        $1
      )
    `, [userMap['diretor@nossef.edu.tl']]);

    // Notifications
    await client.query(`
      INSERT INTO notifications (user_id, title, message, link, is_read)
      VALUES ($1, 'Ezame CAU 1 Besik Ona', 'Ezame CAU 1 sei hala''o iha semana oin. Haree oráriu aula!', '/dashboard/avaliasaun', FALSE)
    `, [userMap['estudante1@nossef.edu.tl']]);

    // Audit log
    await client.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
      VALUES ($1, 'SEED_INITIAL_DATABASE', 'SYSTEM', 'NOSSEF-01', '{"status": "Sucesso", "escola": "Escola Secundaria Catolica Nossa Senhora de Fatima Railaco"}', '127.0.0.1')
    `, [userMap['admin@nossef.edu.tl']]);

    console.log('--- SEED CONCLUÍDO COM SUCESSO! ---');
  } catch (err) {
    console.error('Erro durante migração/seed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
