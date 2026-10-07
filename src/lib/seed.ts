import { query, transaction } from './db';
import { hashPassword } from './auth';

export async function seedDatabase() {
  console.log('Hahu prenximentu dadus inisiál (seed) ba NOSSEF Railaco...');

  const passwordHash = await hashPassword('nossef2026');

  // Check if school already seeded
  const checkSchool = await query(`SELECT id FROM school_profile LIMIT 1`);
  if (checkSchool.rows.length > 0) {
    console.log('Dadus inisiál eziste ona iha database. Pasa ba oin.');
    return;
  }

  await transaction(async (client) => {
    // 1. Roles
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

    const roleMap: Record<string, string> = {};
    for (const r of roles) {
      const res = await client.query(
        `INSERT INTO roles (code, name, is_system_role) VALUES ($1, $2, TRUE) RETURNING id, code`,
        [r.code, r.name]
      );
      roleMap[res.rows[0].code] = res.rows[0].id;
    }

    // 2. Users
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

    const userMap: Record<string, string> = {};
    for (const u of users) {
      const res = await client.query(
        `INSERT INTO users (email, phone, national_id, full_name, password_hash, is_staff, is_superuser)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email`,
        [u.email, u.phone, u.national_id, u.full_name, passwordHash, u.is_staff, u.is_superuser]
      );
      const uid = res.rows[0].id;
      userMap[u.email] = uid;

      // Link roles
      for (const rCode of u.roles) {
        if (roleMap[rCode]) {
          await client.query(
            `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [uid, roleMap[rCode]]
          );
        }
      }
    }

    // 3. Academic Year 2026/2027
    const yearRes = await client.query(`
      INSERT INTO academic_years (code, name, start_date, end_date, is_active, is_closed)
      VALUES ('2026/2027', 'Tinan Akadémiku 2026/2027', '2026-01-15', '2026-12-15', TRUE, FALSE)
      RETURNING id
    `);
    const academicYearId = yearRes.rows[0].id;

    // 4. School Profile
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

    // 5. Trimesters (PRD: Trimestre 1..3 mapped 1-to-1 with CAU 1..3)
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

    // 6. Grade Levels: X, XI, XII
    const gX = (await client.query(`INSERT INTO grade_levels (code, name, order_index) VALUES ('X', '10.º Ano (Klase X)', 10) RETURNING id`)).rows[0].id;
    const gXI = (await client.query(`INSERT INTO grade_levels (code, name, order_index) VALUES ('XI', '11.º Ano (Klase XI)', 11) RETURNING id`)).rows[0].id;
    const gXII = (await client.query(`INSERT INTO grade_levels (code, name, order_index) VALUES ('XII', '12.º Ano (Klase XII)', 12) RETURNING id`)).rows[0].id;

    // 7. Majors: CT (Ciências Naturais / IPA) & CSH (Ciências Sociais e Humanidades / IPS)
    const mCT = (await client.query(`INSERT INTO majors (code, name) VALUES ('CT', 'Ciências Naturais (Siénsia Naturál / IPA)') RETURNING id`)).rows[0].id;
    const mCSH = (await client.query(`INSERT INTO majors (code, name) VALUES ('CSH', 'Ciências Sociais e Humanidades (Siénsia Sosiál / IPS)') RETURNING id`)).rows[0].id;

    // 8. Classrooms
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

    // 9. Subjects
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

    const subMap: Record<string, string> = {};
    for (const s of subjects) {
      const res = await client.query(
        `INSERT INTO subjects (code, name, is_active) VALUES ($1, $2, TRUE) RETURNING id, code`,
        [s.code, s.name]
      );
      subMap[res.rows[0].code] = res.rows[0].id;
    }

    // 10. Subject Offerings for 10-CT & 12-CT
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

    const offeringFis = (await client.query(
      `INSERT INTO subject_offerings (academic_year_id, grade_level_id, major_id, subject_id, weekly_periods, passing_score, credit_hours)
       VALUES ($1, $2, $3, $4, 4, 10.0, 3) RETURNING id`,
      [academicYearId, gX, mCT, subMap['FIS']]
    )).rows[0].id;

    const offeringRel = (await client.query(
      `INSERT INTO subject_offerings (academic_year_id, grade_level_id, major_id, subject_id, weekly_periods, passing_score, credit_hours)
       VALUES ($1, $2, $3, $4, 2, 10.0, 2) RETURNING id`,
      [academicYearId, gX, mCT, subMap['REL']]
    )).rows[0].id;

    // 12-CT Offerings for National Exams
    const offering12Mat = (await client.query(
      `INSERT INTO subject_offerings (academic_year_id, grade_level_id, major_id, subject_id, weekly_periods, passing_score, credit_hours)
       VALUES ($1, $2, $3, $4, 5, 10.0, 3) RETURNING id`,
      [academicYearId, gXII, mCT, subMap['MAT']]
    )).rows[0].id;

    // 11. Teaching Assignments
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

    // 12. Assessment Types (TPK, Teste Pársiál, Prova Prátika, Ezame CAU)
    const atTpk = (await client.query(`INSERT INTO assessment_types (code, name, default_weight) VALUES ('TPK', 'Trabalho de Casa / TPK', 20.0) RETURNING id`)).rows[0].id;
    const atPar = (await client.query(`INSERT INTO assessment_types (code, name, default_weight) VALUES ('PAR', 'Teste Pársiál Escritu', 30.0) RETURNING id`)).rows[0].id;
    const atCau = (await client.query(`INSERT INTO assessment_types (code, name, default_weight) VALUES ('CAU', 'Ezame Trimestrál (CAU)', 50.0) RETURNING id`)).rows[0].id;

    // 13. Admissions Period & Sample Applicants
    const admPeriod = (await client.query(`
      INSERT INTO admission_periods (code, name, academic_year_id, start_date, end_date, is_open)
      VALUES ('ADM-2026', 'Admisasaun & Matríkula Foun 2026', $1, '2026-01-02', '2026-01-20', TRUE) RETURNING id
    `, [academicYearId])).rows[0].id;

    const app1 = (await client.query(`
      INSERT INTO applicants (admission_period_id, application_no, full_name, gender, birth_date, birth_place, previous_school, chosen_major_id, status)
      VALUES ($1, 'APP-2026-001', 'Bernardino da Costa Martins', 'Mane', '2009-03-12', 'Railaco Craic', 'Eskola Pré-Sekundária Railaco', $2, 'ACCEPTED') RETURNING id
    `, [admPeriod, mCT])).rows[0].id;

    const app2 = (await client.query(`
      INSERT INTO applicants (admission_period_id, application_no, full_name, gender, birth_date, birth_place, previous_school, chosen_major_id, status)
      VALUES ($1, 'APP-2026-002', 'Filomena de Jesus Soares', 'Feto', '2009-08-25', 'Gleno, Ermera', 'Eskola Catolica Gleno', $2, 'SUBMITTED') RETURNING id
    `, [admPeriod, mCSH])).rows[0].id;

    // 14. Students & Guardians
    // Student 1 (Antonio Soares Guterres - 10 CT-A)
    const s1 = (await client.query(`
      INSERT INTO students (user_id, student_no, full_name, gender, birth_date, birth_place, address, phone, entry_year, status)
      VALUES ($1, 'NOSSEF-2026-0101', 'António Soares Guterres', 'Mane', '2008-06-12', 'Railaco Vila', 'Aldeia Railaco Craic, Ermera', '+670 7711 0011', 2026, 'ATIVU') RETURNING id
    `, [userMap['estudante1@nossef.edu.tl']])).rows[0].id;

    const g1 = (await client.query(`
      INSERT INTO guardians (user_id, full_name, relationship, phone, address, occupation)
      VALUES ($1, 'Manuel Guterres', 'Aman', '+670 7711 0012', 'Aldeia Railaco Craic, Ermera', 'Agrikultór') RETURNING id
    `, [userMap['enkaregadu1@nossef.edu.tl']])).rows[0].id;

    await client.query(`
      INSERT INTO student_guardians (student_id, guardian_id, is_primary, can_pickup) VALUES ($1, $2, TRUE, TRUE)
    `, [s1, g1]);

    // Enroll Antonio into 10-CT-A
    await client.query(`
      INSERT INTO student_enrollments (academic_year_id, student_id, grade_level_id, major_id, classroom_id, enrollment_date, status)
      VALUES ($1, $2, $3, $4, $5, '2026-01-15', 'ACTIVE')
    `, [academicYearId, s1, gX, mCT, c10CT]);

    // Student 2: Maria Madalena Tilman (10 CT-A)
    const s2 = (await client.query(`
      INSERT INTO students (student_no, full_name, gender, birth_date, birth_place, address, phone, entry_year, status)
      VALUES ('NOSSEF-2026-0102', 'Maria Madalena Tilman', 'Feto', '2008-09-18', 'Ermera Vila', 'Aldeia Colmera, Railaco', '+670 7788 1234', 2026, 'ATIVU') RETURNING id
    `)).rows[0].id;

    await client.query(`
      INSERT INTO student_enrollments (academic_year_id, student_id, grade_level_id, major_id, classroom_id, enrollment_date, status)
      VALUES ($1, $2, $3, $4, $5, '2026-01-15', 'ACTIVE')
    `, [academicYearId, s2, gX, mCT, c10CT]);

    // Student 3: João Bosco da Silva (12 CT-A - Graduating class!)
    const s3 = (await client.query(`
      INSERT INTO students (student_no, full_name, gender, birth_date, birth_place, address, phone, entry_year, status)
      VALUES ('NOSSEF-2024-0045', 'João Bosco da Silva', 'Mane', '2006-11-04', 'Dili', 'Vila de Railaco, Ermera', '+670 7734 5678', 2024, 'ATIVU') RETURNING id
    `)).rows[0].id;

    await client.query(`
      INSERT INTO student_enrollments (academic_year_id, student_id, grade_level_id, major_id, classroom_id, enrollment_date, status)
      VALUES ($1, $2, $3, $4, $5, '2026-01-15', 'ACTIVE')
    `, [academicYearId, s3, gXII, mCT, c12CT]);

    // 15. Schedules (Timetable with collision testing foundation)
    // Segunda-Feira period 1 & 2: Matematika 10-CT-A
    const sch1 = (await client.query(`
      INSERT INTO schedule_entries (academic_year_id, classroom_id, subject_offering_id, teacher_id, day_of_week, period_number, start_time, end_time, room_number)
      VALUES ($1, $2, $3, $4, 1, 1, '08:00:00', '08:45:00', 'Sala 01 - S. Inácio') RETURNING id
    `, [academicYearId, c10CT, offeringMat, userMap['mestre.matematika@nossef.edu.tl']])).rows[0].id;

    await client.query(`
      INSERT INTO schedule_entries (academic_year_id, classroom_id, subject_offering_id, teacher_id, day_of_week, period_number, start_time, end_time, room_number)
      VALUES ($1, $2, $3, $4, 1, 2, '08:45:00', '09:30:00', 'Sala 01 - S. Inácio')
    `, [academicYearId, c10CT, offeringMat, userMap['mestre.matematika@nossef.edu.tl']]);

    // Terca-Feira: Portugues
    await client.query(`
      INSERT INTO schedule_entries (academic_year_id, classroom_id, subject_offering_id, teacher_id, day_of_week, period_number, start_time, end_time, room_number)
      VALUES ($1, $2, $3, $4, 2, 1, '08:00:00', '08:45:00', 'Sala 01 - S. Inácio')
    `, [academicYearId, c10CT, offeringPor, userMap['mestre.portugues@nossef.edu.tl']]);

    // 16. Attendance Session & Records (Phase F6)
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

    // 17. Assessments, CAU 1 & Gradebook (Phase F7)
    // TPK 1
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

    // Ezame CAU 1 (50% weight)
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

    // Term Grades for Trimestre 1
    await client.query(`
      INSERT INTO term_grades (academic_year_id, trimester_id, student_id, subject_offering_id, final_score, letter_grade, is_locked)
      VALUES ($1, $2, $3, $4, 16.8, 'B', TRUE)
    `, [academicYearId, t1Id, s1, offeringMat]);

    await client.query(`
      INSERT INTO term_grades (academic_year_id, trimester_id, student_id, subject_offering_id, final_score, letter_grade, is_locked)
      VALUES ($1, $2, $3, $4, 14.6, 'C', TRUE)
    `, [academicYearId, t1Id, s2, offeringMat]);

    // 18. Report Card (Boletin de Notas - Phase F8)
    const rc1 = (await client.query(`
      INSERT INTO report_cards (academic_year_id, trimester_id, student_id, classroom_id, total_score, average_score, rank_in_class, homeroom_notes, principal_notes, status, published_at)
      VALUES ($1, $2, $3, $4, 16.8, 16.8, 1, 'Estudante hatudu dedikasaun no komportamentu ne''ebé ezemplár tebes.', 'Parabéns no kontinua esforsu!', 'PUBLISHED', NOW())
      RETURNING id
    `, [academicYearId, t1Id, s1, c10CT])).rows[0].id;

    await client.query(`
      INSERT INTO report_card_subjects (report_card_id, subject_offering_id, score, letter_grade, teacher_notes)
      VALUES ($1, $2, 16.8, 'B', 'Domina konseitu matemátika ho di''ak tebes.')
    `, [rc1, offeringMat]);

    // National Exam Record for João Bosco da Silva (12th Grade)
    await client.query(`
      INSERT INTO national_exam_records (student_id, academic_year_id, exam_year, exam_number, portugues_score, ingles_score, matematika_score, spesifika_score, final_average, status)
      VALUES ($1, $2, 2026, 'EX-NAT-2026-0881', 15.5, 16.0, 17.5, 16.8, 16.45, 'LIU')
    `, [s3, academicYearId]);

    // 19. Finance — SPP and Invoices (Phase F9)
    const feeSpp = (await client.query(`
      INSERT INTO fee_types (code, name, is_recurring)
      VALUES ('MENSALIDADE', 'Mensalidade Eskolár (SPP)', TRUE) RETURNING id
    `)).rows[0].id;

    const feeMat = (await client.query(`
      INSERT INTO fee_types (code, name, is_recurring)
      VALUES ('MATRIKULA', 'Konta Matríkula / Rejistu Tinan', FALSE) RETURNING id
    `)).rows[0].id;

    // Fee plan: $15.00/month for Grade X
    const fp10 = (await client.query(`
      INSERT INTO fee_plans (academic_year_id, fee_type_id, grade_level_id, name, amount, due_day)
      VALUES ($1, $2, $3, 'Mensalidade 10.º Ano 2026', 15.00, 10) RETURNING id
    `, [academicYearId, feeSpp, gX])).rows[0].id;

    // Invoice for Antonio (Paid)
    const inv1 = (await client.query(`
      INSERT INTO invoices (student_id, invoice_number, fee_plan_id, title, issue_date, due_date, subtotal, discount_amount, total_amount, paid_amount, status)
      VALUES ($1, 'FAT-2026-01-001', $2, 'Mensalidade Fulan Janeiru 2026', '2026-01-05', '2026-01-15', 15.00, 0, 15.00, 15.00, 'SELU_ONA') RETURNING id
    `, [s1, fp10])).rows[0].id;

    await client.query(`
      INSERT INTO invoice_items (invoice_id, description, amount)
      VALUES ($1, 'Mensalidade Fulan Janeiru 2026 - 10.º Ano CT-A', 15.00)
    `, [inv1]);

    // Payment for inv1
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

    // Invoice for February (Unpaid / Current)
    const inv2 = (await client.query(`
      INSERT INTO invoices (student_id, invoice_number, fee_plan_id, title, issue_date, due_date, subtotal, discount_amount, total_amount, paid_amount, status)
      VALUES ($1, 'FAT-2026-02-001', $2, 'Mensalidade Fulan Fevereiru 2026', '2026-02-01', '2026-02-15', 15.00, 0, 15.00, 0.00, 'SEIDAUK_SELU') RETURNING id
    `, [s1, fp10])).rows[0].id;

    // 20. Counseling & Discipline (Phase F10)
    const case1 = (await client.query(`
      INSERT INTO counseling_cases (student_id, counselor_id, case_number, category, title, description, status, is_confidential)
      VALUES ($1, $2, 'BK-2026-001', 'Orientasaun Vokasionál', 'Diskusaun Vokasaun & Planu Universitáriu', 'Estudante hakarak konsellu kona-ba hili kursu Medisina ka Enjeñaria iha Universidade.', 'REZOLVIDU', TRUE)
      RETURNING id
    `, [s1, userMap['konsellu@nossef.edu.tl']])).rows[0].id;

    await client.query(`
      INSERT INTO counseling_follow_ups (case_id, follow_up_date, notes, counselor_id)
      VALUES ($1, '2026-03-01', 'Fó ona informasaun kona-ba rekezitu no bolsa de estudu.', $2)
    `, [case1, userMap['konsellu@nossef.edu.tl']]);

    // 21. Extracurricular (Phase F10)
    const extraKoral = (await client.query(`
      INSERT INTO extracurricular_activities (name, description, supervisor_id, schedule_info)
      VALUES ('Korál Nossa Senhora de Fátima', 'Grupu korál misa no kantu litúrjiku eskola nian', $1, 'Loron Sesta 14:00 - 16:00') RETURNING id
    `, [userMap['mestre.portugues@nossef.edu.tl']])).rows[0].id;

    const extraFut = (await client.query(`
      INSERT INTO extracurricular_activities (name, description, supervisor_id, schedule_info)
      VALUES ('Klube Futebol NOSSEF Railaco', 'Ekipa futebol no desportu inter-eskolár Railaco', $1, 'Loron Sábadu 08:00 - 10:30') RETURNING id
    `, [userMap['mestre.matematika@nossef.edu.tl']])).rows[0].id;

    await client.query(`
      INSERT INTO extracurricular_memberships (activity_id, student_id, joined_date, role)
      VALUES ($1, $2, '2026-01-20', 'Kantór Tenor')
    `, [extraKoral, s1]);

    // 22. Library (Phase F11)
    const book1 = (await client.query(`
      INSERT INTO library_books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies)
      VALUES ('978-989-8260-12-3', 'Matemática para o Ensino Secundário', 'Prof. Carlos Alberto', 'Lidel Edições Técnicas', 2021, 'Matemátika & Siénsia', 15, 14) RETURNING id
    `)).rows[0].id;

    const book2 = (await client.query(`
      INSERT INTO library_books (isbn, title, author, publisher, publication_year, category, total_copies, available_copies)
      VALUES ('978-989-655-001-8', 'Gramática da Língua Portuguesa', 'Maria Helena Mira Mateus', 'Caminho', 2020, 'Língua & Literatura', 20, 20) RETURNING id
    `)).rows[0].id;

    const copy1 = (await client.query(`
      INSERT INTO library_copies (book_id, barcode, condition, is_available)
      VALUES ($1, 'BC-NOSSEF-00101', 'DIAK', FALSE) RETURNING id
    `, [book1])).rows[0].id;

    await client.query(`
      INSERT INTO library_loans (copy_id, student_id, loan_date, due_date, status, issued_by)
      VALUES ($1, $2, '2026-10-01', '2026-10-15', 'ATIVU', $3)
    `, [copy1, s1, userMap['biblioteka@nossef.edu.tl']]);

    // 23. Assets (Phase F11)
    await client.query(`
      INSERT INTO assets (asset_tag, name, category, location, purchase_date, cost, condition, status)
      VALUES ('AST-NOSSEF-001', 'Projetor Epson EB-X51', 'Eletróniku', 'Sala 01 - S. Inácio', '2024-03-10', 450.00, 'DIAK', 'ATIVU')
    `);

    await client.query(`
      INSERT INTO assets (asset_tag, name, category, location, purchase_date, cost, condition, status)
      VALUES ('AST-NOSSEF-002', 'Kadeira & Meza Estudante (Set 35)', 'Mobiliáriu', 'Sala 01 - S. Inácio', '2023-01-15', 1050.00, 'DIAK', 'ATIVU')
    `);

    // 24. Announcements (Phase F12)
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

    // 25. Notifications (Phase F12)
    await client.query(`
      INSERT INTO notifications (user_id, title, message, link, is_read)
      VALUES ($1, 'Ezame CAU 1 Besik Ona', 'Ezame CAU 1 sei hala''o iha semana oin. Haree oráriu aula!', '/dashboard/avaliasaun', FALSE)
    `, [userMap['estudante1@nossef.edu.tl']]);

    // 26. Audit Log
    await client.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
      VALUES ($1, 'SEED_INITIAL_DATABASE', 'SYSTEM', 'NOSSEF-01', '{"status": "Sucesso", "escola": "Escola Secundaria Catolica Nossa Senhora de Fatima Railaco"}', '127.0.0.1')
    `, [userMap['admin@nossef.edu.tl']]);
  });

  console.log('Seed dadus inisiál konkluidu ho susesu!');
}
