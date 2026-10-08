# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# Sistem Informasi Manajemen SMA — Timor-Leste
> **Status:** FINAL — Source of Truth implementasi
> **Target:** Satu SMA (single-school), production-ready, PWA
> **Baseline keputusan:** 15 Agustus 2026
> **Audiens:** Junior developer, AI coding agent, reviewer, QA, operator/DevOps sekolah
> **Aturan:** Jika implementasi berbeda dengan PRD ini tanpa change request/ADR resmi, PRD ini yang menjadi acuan.
# 0. Cara Menggunakan PRD Ini
Dokumen ini adalah kontrak implementasi, roadmap, dan panduan teknis. Ia bukan sekadar daftar fitur. Setiap domain harus dibangun mengikuti workflow, state, model data, permission, API, testing, audit, dan operational requirement yang didefinisikan di sini.
- Baca Bagian 1–15 sebelum coding domain apa pun.
- Gunakan roadmap F0 sampai F15 sebagai urutan dependency.
- Jangan membuat status, tabel, endpoint, atau rule baru jika requirement sudah tercakup di sini.
- Jangan menaruh business rule hanya di frontend.
- Jangan hard-delete data akademik/keuangan yang sudah digunakan.
- Setiap perubahan schema wajib migration dan test.
- Setiap write endpoint wajib permission test dan validation test.
- Operasi nilai final, rapor, promotion, invoice, payment, reversal wajib transactional.
- Setiap background task yang dapat retry wajib idempotent.
- Jika ada ambiguity operasional sekolah yang benar-benar belum ditentukan, pertahankan integritas data dan catat ADR; jangan menebak aturan bisnis baru.
# 1. Keputusan Final Produk
| Area | Keputusan final |
| --- | --- |
| Jenis sistem | School Information Management System untuk satu SMA di Timor-Leste |
| Multi-school | Tidak. Tidak ada tenant switching. |
| Jenjang | Kelas X, XI, XII |
| Jurusan | IPA dan IPS |
| Periode | 3 trimestre per tahun ajaran |
| Ujian periode | CAU 1→Trimestre 1, CAU 2→Trimestre 2, CAU 3→Trimestre 3 |
| Ujian nasional | Pencatatan ujian/hasil nasional kelas XII terpisah dari CAU |
| Pendaftaran | Pendaftaran Siswa Baru / Admissions; aturan penerimaan dibuat khusus sekolah Timor-Leste dan tidak bergantung pada regulasi negara lain |
| Finance | SPP dan biaya siswa; bukan general ledger/BOS/payroll penuh |
| Frontend | Next.js 16.2.x Active LTS baseline, App Router, TypeScript |
| Backend | Python 3.12 + Django 5.2 LTS + Django REST Framework |
| Arsitektur | Modular monolith |
| Database | PostgreSQL 17 |
| Async | Celery 5.6.x + Redis 7.x |
| File | Private S3-compatible object storage |
| PWA | Manifest + Service Worker + IndexedDB + explicit offline queue |
| Timezone | Asia/Dili |
| Currency | USD |
| Bahasa UI | Tetun + Portuguese + Indonesian dictionary support |
| Auth browser | Django session/cookie + CSRF; RBAC + object scope |
**CAU 1/2/3 adalah aturan sekolah/proyek yang telah ditetapkan.** Database dan validasi wajib mengikat nomor CAU ke nomor trimestre, tetapi label tetap berada pada konfigurasi/display layer agar tidak tersebar sebagai string hard-coded.
# 2. Konteks Timor-Leste yang Mengikat Desain
- Kalender sekolah ditetapkan per tahun; tanggal tahun ajaran dan trimestre harus configurable, bukan hard-coded.
- Ensino Secundário berakhir pada tingkat 12.º ano; sistem harus menutup siklus akademik sampai kelas XII dan kelulusan.
- Ujian nasional kelas XII dicatat sebagai domain tersendiri dan tidak dihitung dari CAU secara otomatis.
- Mata uang resmi adalah USD; semua money memakai Decimal, tidak pernah float.
- Timezone default Asia/Dili (UTC+9); timestamp server disimpan UTC dan ditampilkan dalam timezone sekolah.
- Tetun dan Portuguese adalah bahasa resmi; UI minimal disiapkan untuk i18n. Bahasa Indonesia dipertahankan sebagai bahasa kerja proyek.
# 3. Product Goals
- Menjadi source of truth operasional siswa dari calon siswa sampai alumni.
- Menggantikan spreadsheet terpisah untuk siswa, kelas, absensi, nilai, CAU, rapor, dan SPP.
- Menjaga histori tahunan/trimestre tanpa overwrite.
- Mengizinkan guru bekerja pada koneksi internet tidak stabil terutama untuk absensi.
- Menjaga finance dengan invoice, allocation, receipt, reversal dan audit trail.
- Memberikan portal sesuai role dan object scope.
- Mendukung deployment production yang bisa dimonitor, dibackup, direstore dan diuji.
## 3.1 Success Metrics
| Metric | Target |
| --- | --- |
| Availability | >=99.5% jam operasional; target engineering 99.9% bila hosting mendukung |
| API p95 | <500 ms untuk CRUD/filter normal pada dataset satu SMA |
| Lost attendance mutation | 0 |
| Duplicate generated SPP invoice | 0 |
| Duplicate payment akibat retry | 0 |
| Unauthorized object access | 0 dalam test/review |
| Audit coverage | 100% grade final, report publish, payment/reversal, role change |
| Backup | Automated harian minimum |
| Restore verification | Minimal per kuartal atau setelah perubahan infra besar |
# 4. Scope Final
## 4.1 In Scope
- Authentication, session, password reset, role, permission, account lifecycle.
- Profil sekolah dan konfigurasi.
- Tahun ajaran + tiga trimestre.
- Grade X/XI/XII, jurusan IPA/IPS, rombel, ruang, jam pelajaran.
- Pendaftaran siswa baru/admissions + daftar ulang.
- Siswa, guardian, histori status, enrollment, transfer, promotion, graduation.
- Guru/staf, teaching assignment, wali kelas.
- Kurikulum internal: subject, subject offering per grade/major/year.
- Jadwal, collision detection, exception, substitute teacher.
- Absensi siswa daily/lesson + leave + correction + offline PWA.
- Absensi guru/staf sederhana.
- Assessment, CAU1/2/3, gradebook, remedial, term grade, locking.
- Rapor per trimestre, transcript, yearly summary.
- National exam record kelas XII.
- Finance SPP dan biaya siswa: fee plan, invoice, partial payment, discount, scholarship, proof, verification, receipt, reversal, arrears.
- BK/konseling dan discipline dengan permission restricted.
- Ekstrakurikuler.
- Perpustakaan.
- Inventaris/aset.
- Announcement, calendar, in-app notification, Web Push, email.
- Document/file management dan generated document.
- Alumni/archive.
- Dashboard per role, report, PDF/XLSX/CSV.
- Import validate-preview-confirm-result.
- Audit/security logs.
- Health checks, structured logs, error monitoring, backup, restore, CI/CD.
## 4.2 Explicitly Out of Scope
- Multi-school / SaaS multi-tenant.
- Payroll/gaji penuh.
- General ledger/double-entry, BOS/ARKAS atau akuntansi pemerintah penuh.
- LMS penuh/SCORM/video-course/forum.
- CBT online exam engine dengan question bank kompleks.
- Biometrik/fingerprint/face recognition.
- GPS tracking.
- Transport/bus tracking.
- Asrama.
- Marketplace.
- AI grading/chatbot sebagai core.
- Integrasi tulis ke sistem pemerintah tanpa API/otorisasi resmi.
# 5. Terminologi Domain
| Term | Definition |
| --- | --- |
| AcademicYear | Satu tahun ajaran. |
| Trimester | Periode 1,2,3 di dalam AcademicYear. |
| CAU | Ujian utama yang dipetakan satu-ke-satu dengan nomor trimestre. |
| GradeLevel | X, XI, XII. |
| Major | IPA atau IPS. |
| ClassRoom | Rombel spesifik, mis. X IPA 1. |
| Enrollment | Keanggotaan student pada academic year + grade + major + classroom. |
| SubjectOffering | Subject yang berlaku pada grade/major/year. |
| TeachingAssignment | Teacher mengajar subject offering pada classroom. |
| Assessment | Tugas/quiz/practical/project/CAU/other. |
| TermGrade | Nilai final subject per student per trimestre. |
| ReportCard | Rapor snapshot per student per trimestre. |
| SPP | Tagihan rutin siswa; display label dapat diterjemahkan. |
| Invoice | Tagihan resmi. |
| PaymentAllocation | Alokasi Payment ke Invoice. |
| Reversal | Pembalikan transaksi sebagai pengganti hard-delete. |
| Guardian | Orang tua/wali yang memiliki relationship ke student. |
# 6. Actors
| Role code | Purpose |
| --- | --- |
| SUPER_ADMIN | Akun teknis tertinggi; bukan akun kerja harian. |
| SCHOOL_ADMIN | TU/admin sekolah. |
| PRINCIPAL | Kepala sekolah. |
| CURRICULUM_ADMIN | Wakasek/admin kurikulum. |
| FINANCE_ADMIN | Bendahara. |
| ADMISSION_OFFICER | Petugas pendaftaran. |
| TEACHER | Guru pengampu. |
| HOMEROOM_TEACHER | Wali kelas. |
| COUNSELOR | BK/konselor. |
| LIBRARIAN | Perpustakaan. |
| ASSET_OFFICER | Inventaris. |
| STAFF | Staf umum. |
| STUDENT | Portal siswa. |
| GUARDIAN | Portal wali/orang tua. |
User dapat memiliki lebih dari satu role. Role saja tidak cukup: akses record tetap dibatasi object scope.
# 7. Authorization Model
Tiga lapisan wajib: authentication → permission → object scope. Frontend navigation bukan security boundary.
## 7.1 Permission Catalog
- `school.view`
- `school.manage_settings`
- `user.view`
- `user.create`
- `user.update`
- `user.disable`
- `role.manage`
- `admission.view`
- `admission.create`
- `admission.verify`
- `admission.decide`
- `admission.enroll`
- `student.view`
- `student.create`
- `student.update`
- `student.change_status`
- `student.export`
- `guardian.view`
- `guardian.update`
- `staff.view`
- `staff.manage`
- `academic.view`
- `academic.manage_year`
- `academic.manage_trimester`
- `academic.manage_subject`
- `academic.manage_class`
- `schedule.view`
- `schedule.manage`
- `schedule.substitute`
- `attendance.view`
- `attendance.record`
- `attendance.correct`
- `attendance.approve`
- `assessment.view`
- `assessment.create`
- `assessment.update`
- `score.record`
- `score.revise`
- `grade.finalize`
- `grade.reopen`
- `report.view`
- `report.generate`
- `report.publish`
- `report.reopen`
- `finance.view`
- `finance.manage_fee`
- `finance.generate_invoice`
- `finance.receive_payment`
- `finance.verify_payment`
- `finance.reverse_payment`
- `finance.export`
- `counseling.view`
- `counseling.manage`
- `discipline.view`
- `discipline.manage`
- `library.view`
- `library.manage_catalog`
- `library.issue`
- `library.return`
- `asset.view`
- `asset.manage`
- `asset.assign`
- `extracurricular.view`
- `extracurricular.manage`
- `announcement.view`
- `announcement.publish`
- `notification.manage`
- `document.view`
- `document.upload`
- `document.generate`
- `audit.view`
- `system.import`
- `system.export`
- `system.view_jobs`
## 7.2 Mandatory Object Scope
| Context | Rule |
| --- | --- |
| TEACHER student.view | Only students in active teaching assignments/classrooms. |
| TEACHER attendance.record | Only assigned lesson/class or valid substitution. |
| TEACHER score.record | Only assessments under own teaching assignment and unlocked state. |
| HOMEROOM_TEACHER | Only active homeroom classroom for homeroom-specific actions. |
| STUDENT | Only self-owned academic/finance/document data. |
| GUARDIAN | Only students linked by active StudentGuardian relation. |
| FINANCE_ADMIN | No grade editing unless separately granted academic role. |
| COUNSELOR | Restricted counseling scope; not inherited by ordinary teacher. |
# 8. Architecture
```text
[Browser / Installed PWA]
        | HTTPS
        v
[Reverse Proxy / TLS]
    |                |
    v                v
[Next.js]       [Django REST API]
                    |
          +---------+---------+
          |         |         |
     PostgreSQL   Redis   Object Storage
                    |
                Celery Worker
                    |
                Celery Beat
```
- Modular monolith, not microservices.
- PostgreSQL = source of truth.
- IndexedDB = offline cache/queue only.
- Redis = broker/cache, never source of truth.
- Files live in private object storage; DB stores metadata/object key.
- Heavy work goes to Celery.
- Business rules enforced by Django service layer.
- Frontend calculations are previews only for authoritative grades/finance.
## 8.1 Technology Baseline
| Component | Baseline |
| --- | --- |
| Node | LTS version supported by Next.js baseline; pin in repo |
| Next.js | 16.2.x Active LTS patched |
| TypeScript | Pinned stable |
| Python | 3.12.x |
| Django | 5.2.x LTS latest patch |
| DRF | Pinned compatible stable |
| PostgreSQL | 17.x |
| Redis | 7.x |
| Celery | 5.6.x |
| Production app server | Gunicorn WSGI baseline |
| Storage | S3-compatible private bucket |
# 9. Repository Layout
```text
school-sis/
├── apps/
│   ├── web/                  # Next.js PWA
│   └── api/                  # Django + Celery configuration
├── packages/
│   ├── api-contracts/        # Generated OpenAPI TypeScript client/types
│   └── ui/                   # Shared frontend components
├── infra/
│   ├── docker/
│   ├── reverse-proxy/
│   ├── scripts/
│   └── monitoring/
├── docs/
│   ├── adr/
│   ├── api/
│   └── runbooks/
├── .github/workflows/
├── .env.example
├── docker-compose.dev.yml
├── Makefile
└── README.md
```
## 9.1 Django App Layout
```text
apps/api/
├── manage.py
├── config/
│   ├── settings/{base,local,test,production}.py
│   ├── urls.py
│   ├── wsgi.py
│   ├── celery.py
│   └── logging.py
├── common/
│   ├── api/
│   ├── permissions/
│   ├── exceptions/
│   ├── storage/
│   └── utils/
└── modules/
    ├── accounts/
    ├── school/
    ├── admissions/
    ├── students/
    ├── staff/
    ├── academics/
    ├── schedules/
    ├── attendance/
    ├── assessments/
    ├── report_cards/
    ├── national_exams/
    ├── finance/
    ├── counseling/
    ├── extracurricular/
    ├── library/
    ├── assets/
    ├── communications/
    ├── documents/
    ├── reports/
    ├── integrations/
    └── audit/
```
## 9.2 Standard Django Module Layout
```text
module/
├── models/
├── migrations/
├── selectors/         # reads/query composition
├── services/          # writes/workflows/business rules
├── api/
│   ├── serializers.py
│   ├── permissions.py
│   ├── filters.py
│   ├── views.py
│   └── urls.py
├── tasks.py
├── events.py
├── admin.py
└── tests/
    ├── factories.py
    ├── test_models.py
    ├── test_services.py
    ├── test_permissions.py
    └── test_api.py
```
# 10. Engineering Rules
- UUID primary key for public-facing domain records.
- `created_at` and `updated_at` on mutable records.
- Use `created_by`/`updated_by` on sensitive mutable records where useful.
- Timestamps timezone-aware; store UTC.
- Money = DecimalField; never float.
- Human document numbers separate from primary key.
- Enums use Django TextChoices or equivalent stable code.
- Database constraints enforce invariants whenever possible.
- Cross-row critical rules run in service layer inside `transaction.atomic()`.
- Views/ViewSets do not contain large business workflows.
- Serializers validate transport/input; do not become domain service.
- Selectors never mutate.
- Services receive actor + validated data, not raw request object.
- Django signals remain minimal; critical workflows explicit.
- Celery task arguments contain IDs and small primitives, not model serialization.
- Celery tasks that may retry are idempotent.
- Enqueue tasks after commit using `transaction.on_commit()`/equivalent.
- Never commit secrets.
- Never log passwords/tokens/full restricted payloads.
- Prevent N+1 with select_related/prefetch_related.
- List endpoints always paginated.
- Bulk endpoints have explicit maximum batch size.
- Historical academic and finance records are never edited by direct SQL as operational workflow.
# 11. API Contract Standard
Base path: `/api/v1/`. Breaking contracts require a new version; compatible additions stay v1.
## 11.1 Success Envelope
```json
{
  "data": {},
  "meta": {"request_id": "uuid", "pagination": null},
  "error": null
}
```
## 11.2 Error Envelope
```json
{
  "data": null,
  "meta": {"request_id": "uuid"},
  "error": {
    "code": "ATTENDANCE_SESSION_LOCKED",
    "message": "Attendance session is locked.",
    "fields": {}
  }
}
```
| Case | Status |
| --- | --- |
| List/Retrieve | 200 |
| Create | 201 |
| Async job accepted | 202 |
| Delete allowed entity | 204 |
| Validation | 400 |
| Unauthenticated | 401 |
| Forbidden | 403 |
| Not found/hidden object | 404 |
| Version/state conflict | 409 |
| Rate limited | 429 |
## 11.3 Pagination
Default page size 25, maximum 100. Cursor pagination wajib untuk audit/activity/notification feed; page-number pagination boleh untuk master data stabil.
## 11.4 Idempotency Required
- Payment creation/receipt.
- Offline attendance sync batch.
- SPP invoice generation trigger.
- Import confirmation.
- Heavy report generation.
- Notification batch fan-out.
## 11.5 Concurrency
- Offline-sensitive records carry integer `version`.
- Payment/invoice final mutation uses `select_for_update()` on relevant rows.
- Grade/report finalization re-checks state inside transaction.
- Client-supplied total/balance/final grade is never trusted.
# 12. Database Conventions
- Default PostgreSQL schema `public` is enough for single-school.
- Use Django default table naming unless a migration reason exists.
- Use `PROTECT` for referenced historical masters; CASCADE only for true child records.
- No hard delete for published report, finalized grade, invoice, verified payment, reversal, audit event.
- Use partial unique constraints where an "only one active" invariant exists.
- JSONField only for snapshots/metadata/audit; never replace core relational design.
- Indexes must match list/filter/report access patterns.
- Every integrity invariant gets either DB constraint or service-level check with test; critical ones get both.
# 13. Authentication and Session
Browser baseline memakai Django session authentication + secure cookie + CSRF. Jangan menyimpan long-lived auth token di localStorage.
## 13.1 Production Settings Minimum
- `DEBUG=False`.
- `SECRET_KEY` from environment/secret manager.
- Explicit `ALLOWED_HOSTS`.
- Explicit `CSRF_TRUSTED_ORIGINS`.
- `SESSION_COOKIE_SECURE=True`.
- `SESSION_COOKIE_HTTPONLY=True`.
- `CSRF_COOKIE_SECURE=True`.
- `SECURE_SSL_REDIRECT=True` after proxy headers are validated.
- HSTS after HTTPS is proven stable.
- Content-type sniffing protection/security headers.
- Strong Django password validators.
- Login/reset throttling.
## 13.2 Account Lifecycle
```text
CREATED/INVITED
      ↓
    ACTIVE
      ↕
  SUSPENDED
      ↓
   DISABLED
```
- Disabling user revokes sessions.
- Teacher/staff profile creation does not implicitly activate a login account.
- Student/guardian portal account is linked only to the correct profile relation.
- Password reset token single-use and expiring.
- Password is never readable by admin.
# 14. Audit Trail
- `LOGIN_SUCCESS`
- `LOGIN_FAILURE`
- `LOGOUT`
- `PASSWORD_RESET`
- `USER_CREATED`
- `USER_DISABLED`
- `ROLE_ASSIGNED`
- `ROLE_REMOVED`
- `PERMISSION_CHANGED`
- `APPLICANT_VERIFIED`
- `ADMISSION_DECISION_CHANGED`
- `APPLICANT_ENROLLED`
- `STUDENT_CREATED`
- `STUDENT_UPDATED`
- `STUDENT_STATUS_CHANGED`
- `STUDENT_TRANSFERRED`
- `ENROLLMENT_CREATED`
- `ENROLLMENT_CHANGED`
- `PROMOTION_EXECUTED`
- `SCHEDULE_CREATED`
- `SCHEDULE_CHANGED`
- `SUBSTITUTE_ASSIGNED`
- `ATTENDANCE_RECORDED`
- `ATTENDANCE_CORRECTED`
- `ATTENDANCE_LOCKED`
- `SCORE_RECORDED`
- `SCORE_REVISED`
- `TERM_GRADE_FINALIZED`
- `TERM_GRADE_REOPENED`
- `REPORT_CARD_GENERATED`
- `REPORT_CARD_PUBLISHED`
- `REPORT_CARD_REOPENED`
- `INVOICE_GENERATED`
- `INVOICE_VOIDED`
- `PAYMENT_CREATED`
- `PAYMENT_VERIFIED`
- `PAYMENT_REVERSED`
- `RECEIPT_GENERATED`
- `COUNSELING_CASE_ACCESSED`
- `COUNSELING_CASE_UPDATED`
- `DOCUMENT_DOWNLOADED_SENSITIVE`
- `IMPORT_CONFIRMED`
- `EXPORT_GENERATED`
- `SYSTEM_SETTING_CHANGED`
## 14.1 AuditLog Fields
| Field | Rule |
| --- | --- |
| id | UUID PK |
| actor_id | User nullable only for system job |
| event_type | Stable code |
| resource_type/resource_id | Target |
| request_id | Correlation ID |
| ip_address | Optional, retention-aware |
| user_agent | Optional/truncated |
| before/after | JSON snapshots minimized for PII |
| metadata | Safe JSON |
| created_at | Immutable timestamp |
Audit endpoint is read-only. No product UI endpoint may delete audit rows.
# 15. Complete Data Model Specification
Field list ini adalah minimum contract. Tambahan field boleh dilakukan hanya bila tidak mengubah invariant dan benar-benar dibutuhkan UI/workflow yang sudah ada di PRD.
## 15.1 `SchoolProfile` — `school`
Singleton profil dan konfigurasi identitas sekolah
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK; one active singleton |
| name | varchar(200) | yes | official school name |
| code | varchar(50) | no | internal code |
| address | text | no | school address |
| municipality | varchar(100) | no | Timor-Leste municipality |
| phone | varchar(50) | no | official contact |
| email | email | no | official contact |
| timezone | varchar(64) | yes | default Asia/Dili |
| currency | char(3) | yes | default USD |
| default_locale | varchar(10) | yes | tet/pt/id |
| logo_file_id | FK StoredFile | no | school logo |
**Constraints / invariants:**
- Aplikasi memastikan satu profile
- Timezone must be valid IANA zone
- Currency default USD
**Indexes minimum / query support:**
- `name`
## 15.2 `AcademicYear` — `academics`
Tahun ajaran
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| name | varchar(30) | yes | human label |
| start_date | date | yes | start |
| end_date | date | yes | end |
| status | enum | yes | DRAFT/ACTIVE/CLOSED |
| is_current | bool | yes | at most one true |
**Constraints / invariants:**
- start_date < end_date
- Only one current/active year unless transition explicitly managed
**Indexes minimum / query support:**
- `status`
- `start_date`
## 15.3 `Trimester` — `academics`
Exactly three academic periods per year
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes | parent |
| number | smallint | yes | 1,2,3 |
| name | varchar(50) | yes | Trimestre 1/2/3 |
| start_date | date | yes | inside academic year |
| end_date | date | yes | inside academic year |
| grade_entry_start | datetime | no | input window |
| grade_entry_end | datetime | no | input window |
| status | enum | yes | DRAFT/ACTIVE/GRADING/CLOSED |
| cau_number | smallint | yes | must equal number |
**Constraints / invariants:**
- Unique academic_year+number
- number in 1..3
- cau_number = number
- date ranges do not overlap
- dates within academic year
**Indexes minimum / query support:**
- `academic_year_id,number`
- `status`
## 15.4 `GradeLevel` — `academics`
Class grade master
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| code | varchar(4) | yes | X/XI/XII |
| sequence | smallint | yes | 10/11/12 |
| active | bool | yes | default true |
**Constraints / invariants:**
- Unique code
- Seed only X, XI, XII for this product
**Indexes minimum / query support:**
- `sequence`
## 15.5 `Major` — `academics`
Jurusan master
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| code | varchar(10) | yes | IPA/IPS |
| name | varchar(100) | yes | display label |
| active | bool | yes | default true |
**Constraints / invariants:**
- Unique code
- Seed IPA and IPS
**Indexes minimum / query support:**
- `code`
## 15.6 `Room` — `academics`
Physical room
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| code | varchar(50) | yes | unique |
| name | varchar(100) | yes | display |
| capacity | integer | no | nonnegative |
| room_type | enum | yes | CLASSROOM/LAB/LIBRARY/HALL/OTHER |
| active | bool | yes | default true |
**Constraints / invariants:**
- Unique code
- capacity >= 0
**Indexes minimum / query support:**
- `active`
- `room_type`
## 15.7 `BellPeriod` — `academics`
School lesson time slot
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| name | varchar(50) | yes | Jam 1 etc |
| sequence | smallint | yes | ordering |
| start_time | time | yes | local school time |
| end_time | time | yes | local school time |
| active | bool | yes | default true |
**Constraints / invariants:**
- start_time < end_time
- Unique active sequence
**Indexes minimum / query support:**
- `sequence`
## 15.8 `SchoolCalendarEvent` — `academics`
Holiday/event/exam/deadline calendar record
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes | year |
| trimester_id | FK Trimester | no | term if relevant |
| event_type | enum | yes | HOLIDAY/EXAM/EVENT/DEADLINE/OTHER |
| title | varchar(200) | yes | display |
| start_at | datetime/date | yes | start |
| end_at | datetime/date | yes | end |
| affects_classes | bool | yes | schedule impact |
| notes | text | no | internal |
**Constraints / invariants:**
- end >= start
**Indexes minimum / query support:**
- `academic_year_id,event_type`
- `start_at`
## 15.9 `User` — `accounts`
Authentication principal
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK; custom user from first migration |
| username | varchar | yes | normalized unique |
| email | email | no | unique when provided if policy says |
| is_active | bool | yes | auth status |
| is_staff | bool | yes | Django admin only |
| preferred_locale | varchar(10) | no | tet/pt/id |
| last_login | datetime | no | auth metadata |
| password | hash | yes | Django password hasher |
**Constraints / invariants:**
- Unique username
**Indexes minimum / query support:**
- `is_active`
## 15.10 `Role` — `accounts`
Role catalog
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| code | varchar(50) | yes | stable machine code |
| name | varchar(100) | yes | display |
| active | bool | yes | default true |
**Constraints / invariants:**
- Unique code
**Indexes minimum / query support:**
- `code`
## 15.11 `UserRole` — `accounts`
User-to-role assignment
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| user_id | FK User | yes | user |
| role_id | FK Role | yes | role |
| valid_from | datetime | no | optional |
| valid_until | datetime | no | optional |
| assigned_by_id | FK User | no | actor |
**Constraints / invariants:**
- No duplicate active user+role
**Indexes minimum / query support:**
- `user_id`
- `role_id`
## 15.12 `Teacher` — `staff`
Teacher profile
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| user_id | OneToOne User | no | portal account |
| employee_no | varchar(50) | no | unique when present |
| full_name | varchar(200) | yes | official name |
| gender | enum | no | configured |
| phone | varchar(50) | no | contact |
| email | email | no | contact |
| employment_status | enum | yes | ACTIVE/INACTIVE/LEAVE/ENDED |
| join_date | date | no | history |
| leave_date | date | no | when ended |
**Constraints / invariants:**
- Unique employee_no when non-null
**Indexes minimum / query support:**
- `employment_status`
- `full_name`
## 15.13 `StaffProfile` — `staff`
Non-teacher staff profile
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| user_id | OneToOne User | no | portal account |
| employee_no | varchar(50) | no | unique when present |
| full_name | varchar(200) | yes | official |
| position | varchar(100) | yes | job title |
| department | varchar(100) | no | unit |
| employment_status | enum | yes | ACTIVE/INACTIVE/LEAVE/ENDED |
| phone | varchar(50) | no | contact |
**Constraints / invariants:**
- Unique employee_no when non-null
**Indexes minimum / query support:**
- `employment_status`
- `department`
## 15.14 `Subject` — `academics`
Master subject
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| code | varchar(30) | yes | stable unique |
| name | varchar(150) | yes | display |
| short_name | varchar(30) | no | report UI |
| category | enum | yes | CORE/MAJOR/ELECTIVE/OTHER |
| active | bool | yes | default true |
**Constraints / invariants:**
- Unique code
**Indexes minimum / query support:**
- `category`
- `active`
## 15.15 `SubjectOffering` — `academics`
Subject applicability by year/grade/major
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes | year |
| grade_level_id | FK GradeLevel | yes | X/XI/XII |
| major_id | FK Major | no | null means all majors |
| subject_id | FK Subject | yes | subject |
| weekly_periods | smallint | yes | >0 |
| is_required | bool | yes | required/elective |
| active | bool | yes | operational |
**Constraints / invariants:**
- Unique year+grade+major+subject
- weekly_periods > 0
**Indexes minimum / query support:**
- `academic_year_id,grade_level_id,major_id`
## 15.16 `ClassRoom` — `academics`
Rombel per academic year
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes | year |
| grade_level_id | FK GradeLevel | yes | X/XI/XII |
| major_id | FK Major | yes | IPA/IPS |
| name | varchar(100) | yes | e.g. X IPA 1 |
| code | varchar(50) | yes | unique in year |
| homeroom_teacher_id | FK Teacher | no | wali kelas |
| default_room_id | FK Room | no | room |
| capacity | integer | no | nonnegative |
| active | bool | yes | operational |
**Constraints / invariants:**
- Unique academic_year+code
- capacity >= 0
**Indexes minimum / query support:**
- `academic_year_id,grade_level_id,major_id`
- `homeroom_teacher_id`
## 15.17 `TeachingAssignment` — `academics`
Teacher assigned to subject/class
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes | year |
| teacher_id | FK Teacher | yes | teacher |
| classroom_id | FK ClassRoom | yes | class |
| subject_offering_id | FK SubjectOffering | yes | offering |
| valid_from | date | no | start |
| valid_until | date | no | end |
| active | bool | yes | current |
**Constraints / invariants:**
- Classroom year matches assignment
- Offering compatible with class grade/major
**Indexes minimum / query support:**
- `teacher_id,active`
- `classroom_id,active`
## 15.18 `AdmissionPeriod` — `admissions`
Enrollment intake window
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes | target year |
| name | varchar(150) | yes | display |
| registration_start | datetime | yes | open start |
| registration_end | datetime | yes | close |
| capacity_total | integer | no | optional |
| status | enum | yes | DRAFT/OPEN/CLOSED/DECISION/COMPLETED |
**Constraints / invariants:**
- registration_start < registration_end
**Indexes minimum / query support:**
- `academic_year_id,status`
## 15.19 `Applicant` — `admissions`
Prospective student
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| admission_period_id | FK AdmissionPeriod | yes | period |
| registration_no | varchar(50) | yes | server-generated unique |
| full_name | varchar(200) | yes | official |
| birth_place | varchar(100) | no |  |
| birth_date | date | yes | not future |
| gender | enum | no |  |
| previous_school | varchar(200) | no | previous institution |
| phone | varchar(50) | no |  |
| email | email | no |  |
| address | text | no |  |
| desired_major_id | FK Major | no | preference only |
| status | enum | yes | workflow |
| submitted_at | datetime | no | set once |
**Constraints / invariants:**
- Unique registration_no
- No invalid backwards state without reopen
**Indexes minimum / query support:**
- `admission_period_id,status`
- `full_name`
## 15.20 `ApplicantGuardian` — `admissions`
Guardian captured before enrollment
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| applicant_id | FK Applicant | yes | parent |
| full_name | varchar(200) | yes |  |
| relationship | varchar/enum | yes | FATHER/MOTHER/GUARDIAN/OTHER |
| phone | varchar(50) | no |  |
| email | email | no |  |
| occupation | varchar(150) | no |  |
| address | text | no |  |
| is_primary | bool | yes | primary contact |
**Constraints / invariants:**
- Max one primary per applicant
**Indexes minimum / query support:**
- `applicant_id,is_primary`
## 15.21 `ApplicantDocument` — `admissions`
Applicant document verification
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| applicant_id | FK Applicant | yes |  |
| document_type | varchar(50) | yes | configured type |
| file_id | FK StoredFile | yes | private |
| verification_status | enum | yes | PENDING/VALID/INVALID |
| verified_by_id | FK User | no | actor |
| verified_at | datetime | no |  |
| note | text | no | reason |
**Constraints / invariants:**
- One active document per required type if policy requires
**Indexes minimum / query support:**
- `applicant_id,document_type`
- `verification_status`
## 15.22 `AdmissionDecision` — `admissions`
Selection decision
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| applicant_id | OneToOne Applicant | yes |  |
| decision | enum | yes | ACCEPTED/WAITING_LIST/REJECTED |
| score | decimal | no | optional |
| rank | integer | no | optional |
| decided_by_id | FK User | yes | actor |
| decided_at | datetime | yes |  |
| note | text | no |  |
**Constraints / invariants:**
- One current decision per applicant
**Indexes minimum / query support:**
- `decision`
- `rank`
## 15.23 `Student` — `students`
Student master identity
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| user_id | OneToOne User | no | portal account |
| student_no | varchar(50) | yes | internal unique |
| national_student_no | varchar(80) | no | external ID if school uses |
| full_name | varchar(200) | yes | official |
| birth_place | varchar(100) | no |  |
| birth_date | date | yes |  |
| gender | enum | no |  |
| address | text | no |  |
| phone | varchar(50) | no |  |
| email | email | no |  |
| photo_file_id | FK StoredFile | no | private |
| admission_date | date | yes |  |
| status | enum | yes | ACTIVE/GRADUATED/TRANSFERRED/LEFT/INACTIVE |
**Constraints / invariants:**
- Unique student_no
- Unique national_student_no when non-null
**Indexes minimum / query support:**
- `status`
- `student_no`
- `full_name`
## 15.24 `Guardian` — `students`
Parent/guardian master
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| user_id | OneToOne User | no | portal account |
| full_name | varchar(200) | yes |  |
| phone | varchar(50) | no |  |
| email | email | no |  |
| address | text | no |  |
| occupation | varchar(150) | no |  |
| active | bool | yes |  |
**Constraints / invariants:**
- No automatic merge solely by same name
**Indexes minimum / query support:**
- `full_name`
- `phone`
## 15.25 `StudentGuardian` — `students`
Many-to-many student guardian relationship
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| guardian_id | FK Guardian | yes |  |
| relationship | varchar/enum | yes |  |
| is_primary | bool | yes |  |
| receives_notifications | bool | yes | default true |
| financial_contact | bool | yes | default false |
| active | bool | yes |  |
**Constraints / invariants:**
- Unique active student+guardian
- Max one primary active guardian per student
**Indexes minimum / query support:**
- `student_id,active`
- `guardian_id,active`
## 15.26 `StudentEnrollment` — `students`
Historical yearly placement
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| academic_year_id | FK AcademicYear | yes |  |
| grade_level_id | FK GradeLevel | yes |  |
| major_id | FK Major | yes | IPA/IPS |
| classroom_id | FK ClassRoom | yes |  |
| status | enum | yes | ACTIVE/PROMOTED/REPEATED/TRANSFERRED/COMPLETED/CANCELLED |
| start_date | date | yes |  |
| end_date | date | no |  |
| source | enum | yes | ADMISSION/PROMOTION/TRANSFER/MANUAL |
**Constraints / invariants:**
- One ACTIVE enrollment per student+academic year
- Classroom year/grade/major matches enrollment
**Indexes minimum / query support:**
- `student_id,academic_year_id`
- `classroom_id,status`
- `major_id`
## 15.27 `StudentStatusHistory` — `students`
Status history
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| from_status | enum | no |  |
| to_status | enum | yes |  |
| effective_date | date | yes |  |
| reason | text | no |  |
| changed_by_id | FK User | yes |  |
**Constraints / invariants:**
- Append-only through services
**Indexes minimum / query support:**
- `student_id,effective_date`
## 15.28 `StudentTransfer` — `students`
Transfer/mutation record
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| transfer_type | enum | yes | IN/OUT/INTERNAL_MAJOR/INTERNAL_CLASS |
| effective_date | date | yes |  |
| from_detail | json/text | no | snapshot |
| to_detail | json/text | no | snapshot |
| reason | text | yes | mandatory for major/out changes |
| document_file_id | FK StoredFile | no |  |
| approved_by_id | FK User | no |  |
**Constraints / invariants:**
- History preserved
**Indexes minimum / query support:**
- `student_id,effective_date`
- `transfer_type`
## 15.29 `ScheduleEntry` — `schedules`
Recurring class timetable
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes |  |
| trimester_id | FK Trimester | no | if term-specific |
| classroom_id | FK ClassRoom | yes |  |
| teaching_assignment_id | FK TeachingAssignment | yes |  |
| weekday | smallint | yes | 1..7 |
| bell_period_id | FK BellPeriod | yes |  |
| room_id | FK Room | no |  |
| valid_from | date | yes |  |
| valid_until | date | no |  |
| active | bool | yes |  |
**Constraints / invariants:**
- No overlapping teacher
- No overlapping classroom
- No overlapping room
- Assignment matches classroom
**Indexes minimum / query support:**
- `classroom_id,weekday,bell_period_id`
- `teaching_assignment_id,weekday`
- `room_id,weekday`
## 15.30 `ScheduleException` — `schedules`
One-date schedule override
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| schedule_entry_id | FK ScheduleEntry | yes |  |
| date | date | yes |  |
| exception_type | enum | yes | CANCELLED/MOVED/SUBSTITUTED |
| new_bell_period_id | FK BellPeriod | no |  |
| new_room_id | FK Room | no |  |
| substitute_teacher_id | FK Teacher | no |  |
| reason | text | yes |  |
**Constraints / invariants:**
- Unique schedule_entry+date
- Replacement must pass collision checks
**Indexes minimum / query support:**
- `date`
- `exception_type`
## 15.31 `AttendanceSession` — `attendance`
Attendance-taking session
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes |  |
| trimester_id | FK Trimester | yes |  |
| classroom_id | FK ClassRoom | yes |  |
| date | date | yes |  |
| session_type | enum | yes | DAILY/LESSON |
| schedule_entry_id | FK ScheduleEntry | no | required for LESSON |
| teaching_assignment_id | FK TeachingAssignment | no | required for LESSON |
| opened_by_id | FK User | yes |  |
| status | enum | yes | OPEN/SUBMITTED/LOCKED |
| version | integer | yes | optimistic concurrency |
| submitted_at | datetime | no |  |
| locked_at | datetime | no |  |
**Constraints / invariants:**
- Unique daily class+date for DAILY
- Unique schedule+date for LESSON
- version >= 1
**Indexes minimum / query support:**
- `classroom_id,date`
- `status`
## 15.32 `AttendanceRecord` — `attendance`
One student attendance state inside a session
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| session_id | FK AttendanceSession | yes |  |
| student_id | FK Student | yes | must be enrolled |
| status | enum | yes | PRESENT/SICK/PERMITTED/ABSENT/LATE |
| minutes_late | smallint | no | only LATE |
| note | text | no |  |
| recorded_by_id | FK User | yes |  |
| version | integer | yes |  |
**Constraints / invariants:**
- Unique session+student
- minutes_late >= 0
- LATE minutes validation
**Indexes minimum / query support:**
- `student_id`
- `session_id`
- `status`
## 15.33 `AttendanceCorrection` — `attendance`
Immutable correction history
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| attendance_record_id | FK AttendanceRecord | yes |  |
| from_status | enum | yes |  |
| to_status | enum | yes |  |
| reason | text | yes | mandatory |
| requested_by_id | FK User | yes |  |
| approved_by_id | FK User | no | if approval policy |
| created_at | datetime | yes |  |
**Constraints / invariants:**
- Append-only
**Indexes minimum / query support:**
- `attendance_record_id,created_at`
## 15.34 `StudentLeaveRequest` — `attendance`
Student leave/permission request
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| start_date | date | yes |  |
| end_date | date | yes |  |
| leave_type | enum | yes | SICK/PERMITTED/OTHER |
| reason | text | yes |  |
| supporting_file_id | FK StoredFile | no |  |
| status | enum | yes | PENDING/APPROVED/REJECTED/CANCELLED |
| reviewed_by_id | FK User | no |  |
**Constraints / invariants:**
- start_date <= end_date
**Indexes minimum / query support:**
- `student_id,start_date`
- `status`
## 15.35 `StaffAttendance` — `attendance`
Simple teacher/staff daily attendance
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| person_type | enum | yes | TEACHER/STAFF |
| teacher_id | FK Teacher | no | conditional |
| staff_id | FK StaffProfile | no | conditional |
| date | date | yes |  |
| status | enum | yes | PRESENT/SICK/PERMITTED/ABSENT/LATE |
| check_in_at | datetime | no |  |
| check_out_at | datetime | no |  |
| note | text | no |  |
**Constraints / invariants:**
- Exactly one teacher/staff
- Unique person+date
**Indexes minimum / query support:**
- `date`
- `status`
## 15.36 `OfflineMutationReceipt` — `attendance`
Server-side replay protection for offline writes
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| mutation_id | UUID | yes | client-generated |
| user_id | FK User | yes |  |
| device_id | varchar(100) | yes | opaque local id |
| mutation_type | varchar(80) | yes |  |
| resource_id | UUID | no | result |
| result_status | enum | yes | APPLIED/DUPLICATE/CONFLICT/REJECTED |
| processed_at | datetime | yes |  |
| response_snapshot | jsonb | no | small safe response |
**Constraints / invariants:**
- Unique user+mutation_id
**Indexes minimum / query support:**
- `user_id,processed_at`
## 15.37 `AssessmentType` — `assessments`
Assessment type master
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| code | varchar(30) | yes | ASSIGNMENT/QUIZ/PRACTICAL/PROJECT/CAU/OTHER |
| name | varchar(100) | yes | display |
| active | bool | yes |  |
**Constraints / invariants:**
- Unique code
**Indexes minimum / query support:**
- `active`
## 15.38 `GradingScheme` — `assessments`
Weighted grading rule per offering/trimester
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes |  |
| trimester_id | FK Trimester | yes |  |
| subject_offering_id | FK SubjectOffering | yes |  |
| name | varchar(100) | yes |  |
| status | enum | yes | DRAFT/ACTIVE/LOCKED |
| passing_score | decimal | no | school configurable |
**Constraints / invariants:**
- Unique active scheme per trimester+offering
- Cannot activate unless component weights total 100
**Indexes minimum / query support:**
- `trimester_id,subject_offering_id,status`
## 15.39 `GradingComponent` — `assessments`
Weighted scheme component
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| grading_scheme_id | FK GradingScheme | yes |  |
| assessment_type_id | FK AssessmentType | yes |  |
| name | varchar(100) | yes |  |
| weight_percent | decimal | yes | >0 and <=100 |
| sequence | smallint | yes |  |
| is_cau_component | bool | yes | true for CAU component |
**Constraints / invariants:**
- weight > 0
- Sum =100 checked at scheme activation
**Indexes minimum / query support:**
- `grading_scheme_id,sequence`
## 15.40 `Assessment` — `assessments`
Concrete graded activity
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| teaching_assignment_id | FK TeachingAssignment | yes |  |
| trimester_id | FK Trimester | yes |  |
| assessment_type_id | FK AssessmentType | yes |  |
| grading_component_id | FK GradingComponent | yes |  |
| title | varchar(200) | yes |  |
| assessment_date | date | yes |  |
| max_score | decimal | yes | >0 |
| cau_number | smallint | no | required for CAU; equals trimester |
| status | enum | yes | DRAFT/OPEN/CLOSED/LOCKED |
| version | integer | yes |  |
**Constraints / invariants:**
- If CAU then cau_number = trimester.number
- max_score > 0
- Assignment term/year compatible
**Indexes minimum / query support:**
- `teaching_assignment_id,trimester_id`
- `assessment_type_id`
- `assessment_date`
## 15.41 `StudentScore` — `assessments`
Raw assessment score
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| assessment_id | FK Assessment | yes |  |
| student_id | FK Student | yes | must be in assigned class |
| score | decimal | no | null means ungraded |
| status | enum | yes | PENDING/GRADED/ABSENT/EXCUSED |
| is_remedial | bool | yes |  |
| recorded_by_id | FK User | yes |  |
| version | integer | yes |  |
**Constraints / invariants:**
- Unique assessment+student
- 0 <= score <= assessment.max_score
**Indexes minimum / query support:**
- `assessment_id`
- `student_id`
- `status`
## 15.42 `ScoreRevision` — `assessments`
Score revision audit record
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_score_id | FK StudentScore | yes |  |
| old_score | decimal | no |  |
| new_score | decimal | no |  |
| reason | text | yes | mandatory |
| changed_by_id | FK User | yes |  |
| changed_at | datetime | yes |  |
**Constraints / invariants:**
- Append-only
**Indexes minimum / query support:**
- `student_score_id,changed_at`
## 15.43 `TermGrade` — `assessments`
Final subject grade per student per trimester
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| trimester_id | FK Trimester | yes |  |
| teaching_assignment_id | FK TeachingAssignment | yes |  |
| calculated_score | decimal | no | server calculated |
| final_score | decimal | no | authoritative when finalized |
| grade_label | varchar(20) | no | optional |
| status | enum | yes | DRAFT/FINALIZED/REOPENED |
| finalized_by_id | FK User | no |  |
| finalized_at | datetime | no |  |
| version | integer | yes |  |
**Constraints / invariants:**
- Unique student+trimester+teaching_assignment
- Finalized direct edit forbidden
**Indexes minimum / query support:**
- `student_id,trimester_id`
- `status`
## 15.44 `ReportCard` — `report_cards`
Published trimester report snapshot
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| enrollment_id | FK StudentEnrollment | yes |  |
| trimester_id | FK Trimester | yes |  |
| status | enum | yes | DRAFT/REVIEWED/PUBLISHED/REOPENED |
| homeroom_note | text | no |  |
| attendance_summary | jsonb | yes | snapshot |
| published_at | datetime | no |  |
| published_by_id | FK User | no |  |
| revision_no | integer | yes | starts at 1 |
| pdf_file_id | FK StoredFile | no | generated snapshot |
**Constraints / invariants:**
- Unique student+trimester+revision_no
- Only one current published revision
**Indexes minimum / query support:**
- `student_id,trimester_id`
- `status`
## 15.45 `ReportCardSubject` — `report_cards`
Subject row snapshot in report
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| report_card_id | FK ReportCard | yes |  |
| subject_id | FK Subject | yes |  |
| term_grade_id | FK TermGrade | yes |  |
| final_score | decimal | yes | snapshot |
| grade_label | varchar(20) | no | snapshot |
| teacher_note | text | no |  |
**Constraints / invariants:**
- Unique report_card+subject
**Indexes minimum / query support:**
- `report_card_id`
## 15.46 `PromotionDecision` — `report_cards`
Promotion/repeat/graduation decision
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| academic_year_id | FK AcademicYear | yes |  |
| decision | enum | yes | PROMOTED/REPEATED/GRADUATED/TRANSFERRED |
| from_enrollment_id | FK StudentEnrollment | yes |  |
| target_grade_level_id | FK GradeLevel | no | for promotion/repeat |
| target_major_id | FK Major | no | default same |
| target_classroom_id | FK ClassRoom | no | if assigned |
| reason | text | no | mandatory for repeat/major change |
| approved_by_id | FK User | yes |  |
**Constraints / invariants:**
- One final decision student+year
- Major change requires reason
**Indexes minimum / query support:**
- `academic_year_id,decision`
## 15.47 `NationalExamRecord` — `national_exams`
Official national exam record for grade XII
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes | must have grade XII enrollment |
| academic_year_id | FK AcademicYear | yes |  |
| exam_name | varchar(150) | yes | configurable official label |
| candidate_no | varchar(100) | no |  |
| status | enum | yes | REGISTERED/ATTENDED/ABSENT/PASSED/FAILED/PENDING |
| overall_score | decimal | no | if applicable |
| result_date | date | no |  |
| certificate_no | varchar(100) | no |  |
| document_file_id | FK StoredFile | no | restricted |
**Constraints / invariants:**
- Unique student+year+exam_name
**Indexes minimum / query support:**
- `academic_year_id,status`
## 15.48 `FeeType` — `finance`
Student fee category
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| code | varchar(30) | yes | SPP/REGISTRATION/ACTIVITY/EXAM/OTHER |
| name | varchar(100) | yes | display |
| recurrence | enum | yes | MONTHLY/ONE_TIME/TRIMESTER/YEARLY/MANUAL |
| active | bool | yes |  |
**Constraints / invariants:**
- Unique code
**Indexes minimum / query support:**
- `active`
- `recurrence`
## 15.49 `FeePlan` — `finance`
Fee tariff/structure
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes |  |
| fee_type_id | FK FeeType | yes |  |
| grade_level_id | FK GradeLevel | no | null all grades |
| major_id | FK Major | no | null all majors |
| amount | decimal(12,2) | yes | USD >=0 |
| due_day | smallint | no | 1..28 recommended for monthly |
| status | enum | yes | DRAFT/ACTIVE/INACTIVE |
**Constraints / invariants:**
- Unique active relevant combination
- amount >= 0
**Indexes minimum / query support:**
- `academic_year_id,fee_type_id,status`
## 15.50 `StudentFeeAssignment` — `finance`
Per-student fee assignment/override
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| fee_plan_id | FK FeePlan | yes |  |
| effective_from | date | yes |  |
| effective_until | date | no |  |
| amount_override | decimal(12,2) | no |  |
| status | enum | yes | ACTIVE/INACTIVE |
**Constraints / invariants:**
- Effective range valid
**Indexes minimum / query support:**
- `student_id,status`
## 15.51 `Discount` — `finance`
Approved fee discount
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| academic_year_id | FK AcademicYear | yes |  |
| fee_type_id | FK FeeType | no | null broader policy |
| discount_type | enum | yes | FIXED/PERCENT |
| value | decimal | yes | nonnegative |
| start_date | date | yes |  |
| end_date | date | no |  |
| reason | text | yes |  |
| approved_by_id | FK User | yes |  |
| status | enum | yes | ACTIVE/EXPIRED/REVOKED |
**Constraints / invariants:**
- Percent <=100
- date range valid
**Indexes minimum / query support:**
- `student_id,status`
## 15.52 `Scholarship` — `finance`
Scholarship/fee waiver
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| name | varchar(150) | yes |  |
| coverage_type | enum | yes | FULL/PERCENT/FIXED |
| value | decimal | no | required except FULL |
| valid_from | date | yes |  |
| valid_until | date | no |  |
| status | enum | yes | ACTIVE/ENDED/REVOKED |
| note | text | no |  |
**Constraints / invariants:**
- Coverage value valid for type
**Indexes minimum / query support:**
- `student_id,status`
## 15.53 `Invoice` — `finance`
Student bill
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| invoice_no | varchar(50) | yes | human unique |
| student_id | FK Student | yes |  |
| academic_year_id | FK AcademicYear | yes |  |
| trimester_id | FK Trimester | no | if term-linked |
| billing_period | varchar/date | no | month for SPP |
| issue_date | date | yes |  |
| due_date | date | yes |  |
| subtotal | decimal(12,2) | yes | server calculated |
| discount_total | decimal(12,2) | yes | server calculated |
| total | decimal(12,2) | yes | server calculated |
| paid_amount | decimal(12,2) | yes | server maintained |
| balance | decimal(12,2) | yes | server maintained |
| status | enum | yes | UNPAID/PARTIALLY_PAID/PAID/VOID |
| generation_key | varchar(180) | no | deterministic idempotency key |
**Constraints / invariants:**
- Unique invoice_no
- Unique generation_key when non-null
- total/balance >=0
**Indexes minimum / query support:**
- `student_id,status`
- `due_date,status`
- `billing_period`
## 15.54 `InvoiceItem` — `finance`
Invoice component
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| invoice_id | FK Invoice | yes |  |
| fee_type_id | FK FeeType | yes |  |
| description | varchar(200) | yes |  |
| quantity | decimal | yes | default 1 |
| unit_amount | decimal | yes |  |
| discount_amount | decimal | yes | default 0 |
| line_total | decimal | yes | server calculated |
**Constraints / invariants:**
- line_total >= 0
**Indexes minimum / query support:**
- `invoice_id`
- `fee_type_id`
## 15.55 `Payment` — `finance`
Received student payment
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| payment_no | varchar(50) | yes | human unique |
| student_id | FK Student | yes |  |
| payment_date | datetime | yes |  |
| amount | decimal(12,2) | yes | >0 |
| method | enum | yes | CASH/BANK_TRANSFER/OTHER |
| reference_no | varchar(100) | no | bank reference |
| status | enum | yes | PENDING/VERIFIED/REVERSED |
| proof_file_id | FK StoredFile | no | private |
| received_by_id | FK User | no | cash actor |
| verified_by_id | FK User | no |  |
| verified_at | datetime | no |  |
| idempotency_key | varchar(100) | no | unique when present |
**Constraints / invariants:**
- Unique payment_no
- Unique idempotency_key when non-null
- amount > 0
**Indexes minimum / query support:**
- `student_id,status`
- `payment_date`
## 15.56 `PaymentAllocation` — `finance`
Payment-to-invoice allocation
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| payment_id | FK Payment | yes |  |
| invoice_id | FK Invoice | yes |  |
| amount | decimal(12,2) | yes | >0 |
**Constraints / invariants:**
- Unique payment+invoice
- Sum allocations <= payment amount
- Allocation <= invoice outstanding inside locked transaction
**Indexes minimum / query support:**
- `payment_id`
- `invoice_id`
## 15.57 `PaymentReversal` — `finance`
Verified payment reversal
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| payment_id | OneToOne Payment | yes |  |
| reason | text | yes | mandatory |
| reversed_by_id | FK User | yes |  |
| reversed_at | datetime | yes |  |
| approval_note | text | no |  |
**Constraints / invariants:**
- One reversal per payment
- Only VERIFIED payment can reverse
**Indexes minimum / query support:**
- `reversed_at`
## 15.58 `Receipt` — `finance`
Immutable payment receipt snapshot
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| receipt_no | varchar(50) | yes | unique |
| payment_id | FK Payment | yes |  |
| issued_at | datetime | yes |  |
| issued_by_id | FK User | yes |  |
| pdf_file_id | FK StoredFile | no | generated |
| snapshot | jsonb | yes | student/payment/allocation display snapshot |
**Constraints / invariants:**
- Unique receipt_no
**Indexes minimum / query support:**
- `payment_id`
## 15.59 `CounselingCase` — `counseling`
Confidential BK case
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| case_no | varchar(50) | yes | unique |
| category | varchar(100) | yes | configurable |
| severity | enum | yes | LOW/MEDIUM/HIGH/CRITICAL |
| summary | varchar(250) | yes | minimal |
| details | text | no | restricted |
| status | enum | yes | OPEN/IN_PROGRESS/RESOLVED/CLOSED |
| assigned_counselor_id | FK User/Teacher | no |  |
| opened_at | datetime | yes |  |
| closed_at | datetime | no |  |
**Constraints / invariants:**
- Unique case_no
**Indexes minimum / query support:**
- `student_id,status`
- `assigned_counselor_id`
## 15.60 `CounselingFollowUp` — `counseling`
Confidential follow-up note
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| case_id | FK CounselingCase | yes |  |
| follow_up_at | datetime | yes |  |
| note | text | yes | restricted |
| created_by_id | FK User | yes |  |
| next_action_at | datetime | no |  |
**Constraints / invariants:**
- Append-only policy preferred
**Indexes minimum / query support:**
- `case_id,follow_up_at`
## 15.61 `DisciplineIncident` — `counseling`
Student discipline incident
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| occurred_at | datetime | yes |  |
| category | varchar(100) | yes |  |
| severity | enum | yes | LOW/MEDIUM/HIGH |
| description | text | yes |  |
| reported_by_id | FK User | yes |  |
| action_taken | text | no |  |
| status | enum | yes | OPEN/RESOLVED |
**Constraints / invariants:**
- Incident remains historical after resolution
**Indexes minimum / query support:**
- `student_id,occurred_at`
- `status`
## 15.62 `ExtracurricularActivity` — `extracurricular`
School extracurricular activity
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes |  |
| name | varchar(150) | yes |  |
| advisor_teacher_id | FK Teacher | no |  |
| capacity | integer | no |  |
| active | bool | yes |  |
**Constraints / invariants:**
- Unique academic_year+name
**Indexes minimum / query support:**
- `academic_year_id,active`
## 15.63 `ExtracurricularMembership` — `extracurricular`
Student membership
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| activity_id | FK ExtracurricularActivity | yes |  |
| student_id | FK Student | yes |  |
| joined_at | date | yes |  |
| left_at | date | no |  |
| status | enum | yes | ACTIVE/INACTIVE |
**Constraints / invariants:**
- Unique active activity+student
**Indexes minimum / query support:**
- `student_id,status`
## 15.64 `ExtracurricularAttendance` — `extracurricular`
Optional but implemented basic activity attendance
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| activity_id | FK ExtracurricularActivity | yes |  |
| student_id | FK Student | yes |  |
| date | date | yes |  |
| status | enum | yes | PRESENT/ABSENT/PERMITTED |
| note | text | no |  |
**Constraints / invariants:**
- Unique activity+student+date
**Indexes minimum / query support:**
- `activity_id,date`
## 15.65 `LibraryBook` — `library`
Bibliographic title
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| isbn | varchar(30) | no |  |
| title | varchar(250) | yes |  |
| author | varchar(200) | no |  |
| publisher | varchar(200) | no |  |
| publication_year | smallint | no |  |
| category | varchar(100) | no |  |
| active | bool | yes |  |
**Constraints / invariants:**
- No forced uniqueness on title alone
**Indexes minimum / query support:**
- `title`
- `isbn`
- `category`
## 15.66 `LibraryCopy` — `library`
Physical copy
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| book_id | FK LibraryBook | yes |  |
| barcode | varchar(80) | yes | unique |
| acquisition_date | date | no |  |
| condition | enum | yes | GOOD/DAMAGED/LOST/REPAIR |
| status | enum | yes | AVAILABLE/ON_LOAN/LOST/REPAIR/RETIRED |
**Constraints / invariants:**
- Unique barcode
**Indexes minimum / query support:**
- `book_id,status`
- `barcode`
## 15.67 `LibraryLoan` — `library`
Checkout transaction
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| copy_id | FK LibraryCopy | yes |  |
| student_id | FK Student | no | one borrower type |
| teacher_id | FK Teacher | no | one borrower type |
| borrowed_at | datetime | yes |  |
| due_at | datetime | yes |  |
| returned_at | datetime | no |  |
| status | enum | yes | OPEN/RETURNED/OVERDUE/LOST |
| fine_amount | decimal(12,2) | yes | informational default 0 |
**Constraints / invariants:**
- Exactly one borrower
- One open loan per copy
**Indexes minimum / query support:**
- `status,due_at`
- `student_id,status`
## 15.68 `Asset` — `assets`
School asset master
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| asset_no | varchar(80) | yes | unique |
| name | varchar(200) | yes |  |
| category | varchar(100) | yes |  |
| serial_no | varchar(100) | no |  |
| purchase_date | date | no |  |
| purchase_cost | decimal(12,2) | no | USD metadata only |
| location_room_id | FK Room | no |  |
| condition | enum | yes | GOOD/FAIR/DAMAGED/REPAIR/LOST |
| status | enum | yes | AVAILABLE/ASSIGNED/REPAIR/RETIRED/LOST |
**Constraints / invariants:**
- Unique asset_no
**Indexes minimum / query support:**
- `category,status`
- `location_room_id`
## 15.69 `AssetAssignment` — `assets`
Asset assignment history
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| asset_id | FK Asset | yes |  |
| assigned_to_type | enum | yes | TEACHER/STAFF/ROOM |
| teacher_id | FK Teacher | no | conditional |
| staff_id | FK StaffProfile | no | conditional |
| room_id | FK Room | no | conditional |
| assigned_at | datetime | yes |  |
| returned_at | datetime | no |  |
| note | text | no |  |
**Constraints / invariants:**
- Exactly one target
- Only one active assignment per asset
**Indexes minimum / query support:**
- `asset_id,returned_at`
## 15.70 `AssetMaintenance` — `assets`
Asset maintenance history
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| asset_id | FK Asset | yes |  |
| started_at | date | yes |  |
| completed_at | date | no |  |
| description | text | yes |  |
| cost | decimal(12,2) | no |  |
| vendor | varchar(150) | no |  |
| status | enum | yes | OPEN/COMPLETED/CANCELLED |
**Constraints / invariants:**
- Completion date not before start
**Indexes minimum / query support:**
- `asset_id,status`
## 15.71 `Announcement` — `communications`
School announcement
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| title | varchar(200) | yes |  |
| body | text | yes | sanitized render |
| audience_type | enum | yes | ALL/ROLE/GRADE/MAJOR/CLASS/STUDENT/GUARDIAN/STAFF |
| publish_at | datetime | yes |  |
| expire_at | datetime | no |  |
| status | enum | yes | DRAFT/SCHEDULED/PUBLISHED/ARCHIVED |
| created_by_id | FK User | yes |  |
**Constraints / invariants:**
- expire > publish when set
**Indexes minimum / query support:**
- `status,publish_at`
- `audience_type`
## 15.72 `AnnouncementAudience` — `communications`
Resolved/explicit audience selector metadata
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| announcement_id | FK Announcement | yes |  |
| role_code | varchar(50) | no |  |
| grade_level_id | FK GradeLevel | no |  |
| major_id | FK Major | no |  |
| classroom_id | FK ClassRoom | no |  |
| student_id | FK Student | no |  |
**Constraints / invariants:**
- At least one selector field must match announcement audience type
**Indexes minimum / query support:**
- `announcement_id`
## 15.73 `Notification` — `communications`
Logical notification to one user
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| recipient_user_id | FK User | yes |  |
| type | varchar(80) | yes |  |
| title | varchar(200) | yes |  |
| body | text | yes | non-sensitive summary |
| target_url | varchar(300) | no | safe internal URL |
| dedup_key | varchar(180) | no | deterministic |
| read_at | datetime | no |  |
| created_at | datetime | yes |  |
**Constraints / invariants:**
- Unique recipient+dedup_key when non-null
**Indexes minimum / query support:**
- `recipient_user_id,read_at`
- `created_at`
## 15.74 `NotificationDelivery` — `communications`
Channel delivery state
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| notification_id | FK Notification | yes |  |
| channel | enum | yes | IN_APP/PUSH/EMAIL |
| status | enum | yes | PENDING/SENT/FAILED/SKIPPED |
| attempt_count | smallint | yes |  |
| last_error_code | varchar(100) | no | safe code |
| sent_at | datetime | no |  |
**Constraints / invariants:**
- Unique notification+channel
**Indexes minimum / query support:**
- `status`
- `channel`
## 15.75 `PushSubscription` — `communications`
Encrypted Web Push subscription
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| user_id | FK User | yes |  |
| endpoint_hash | varchar | yes | unique hash |
| endpoint_encrypted | text | yes | secret-ish |
| p256dh_encrypted | text | yes |  |
| auth_encrypted | text | yes |  |
| user_agent | varchar(300) | no |  |
| active | bool | yes |  |
| last_success_at | datetime | no |  |
**Constraints / invariants:**
- Unique endpoint_hash
**Indexes minimum / query support:**
- `user_id,active`
## 15.76 `StoredFile` — `documents`
Private object metadata
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| object_key | varchar(500) | yes | random unique |
| original_name | varchar(255) | yes | sanitized display |
| mime_type | varchar(150) | yes | validated |
| size_bytes | bigint | yes | within configured limit |
| sha256 | char(64) | yes | integrity |
| classification | enum | yes | PUBLIC/INTERNAL/CONFIDENTIAL/RESTRICTED |
| uploaded_by_id | FK User | no | system allowed |
| created_at | datetime | yes |  |
**Constraints / invariants:**
- Unique object_key
- size >= 0
**Indexes minimum / query support:**
- `classification`
- `sha256`
## 15.77 `GeneratedDocument` — `documents`
Generated document revision
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| document_type | varchar(80) | yes | REPORT_CARD/RECEIPT/LETTER/TRANSCRIPT/etc |
| resource_type | varchar(80) | yes |  |
| resource_id | UUID/string | yes |  |
| revision | integer | yes |  |
| file_id | FK StoredFile | yes |  |
| generated_by_id | FK User | no | system job allowed |
| generated_at | datetime | yes |  |
**Constraints / invariants:**
- Unique document_type+resource+revision
**Indexes minimum / query support:**
- `resource_type,resource_id`
## 15.78 `ReportJob` — `reports`
Asynchronous report/export job
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| requested_by_id | FK User | yes |  |
| report_type | varchar(80) | yes |  |
| parameters | jsonb | yes | validated schema |
| status | enum | yes | QUEUED/RUNNING/SUCCEEDED/FAILED/EXPIRED |
| progress_percent | smallint | yes | 0..100 |
| result_file_id | FK StoredFile | no |  |
| error_code | varchar(100) | no | safe |
| created_at | datetime | yes |  |
| finished_at | datetime | no |  |
**Constraints / invariants:**
- progress between 0 and 100
**Indexes minimum / query support:**
- `requested_by_id,status`
- `created_at`
## 15.79 `ImportJob` — `integrations`
Bulk import lifecycle
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| import_type | varchar(80) | yes | STUDENTS/TEACHERS/SCORES/etc |
| source_file_id | FK StoredFile | yes |  |
| requested_by_id | FK User | yes |  |
| status | enum | yes | UPLOADED/VALIDATING/READY/IMPORTING/SUCCEEDED/FAILED |
| total_rows | integer | yes |  |
| valid_rows | integer | yes |  |
| invalid_rows | integer | yes |  |
| result_file_id | FK StoredFile | no |  |
| idempotency_key | varchar(100) | yes | unique |
**Constraints / invariants:**
- Unique idempotency_key
**Indexes minimum / query support:**
- `status`
- `created_at`
## 15.80 `ImportRowError` — `integrations`
Per-row import error
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| import_job_id | FK ImportJob | yes |  |
| row_number | integer | yes | 1-based |
| field_name | varchar(100) | no |  |
| error_code | varchar(100) | yes |  |
| message | text | yes | human safe |
| raw_value | text | no | mask sensitive |
**Constraints / invariants:**
- Row number >0
**Indexes minimum / query support:**
- `import_job_id,row_number`
## 15.81 `AuditLog` — `audit`
Append-only security/business audit
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| actor_id | FK User | no | null system job |
| event_type | varchar(100) | yes | stable code |
| resource_type | varchar(100) | no |  |
| resource_id | varchar/UUID | no |  |
| request_id | UUID | no |  |
| ip_address | inet | no |  |
| user_agent | varchar/text | no | truncated |
| before | jsonb | no | minimize PII |
| after | jsonb | no | minimize PII |
| metadata | jsonb | yes | safe |
| created_at | datetime | yes | immutable |
**Constraints / invariants:**
- Append-only application behavior
**Indexes minimum / query support:**
- `event_type,created_at`
- `resource_type,resource_id`
- `actor_id,created_at`
# 16. Admissions / Pendaftaran Siswa Baru
## 16.1 Workflow
```text
DRAFT
  ↓ submit
SUBMITTED
  ↓ verify data/documents
VERIFIED
  ↓ selection
ELIGIBLE
  ├─ ACCEPTED
  ├─ WAITING_LIST
  └─ REJECTED
ACCEPTED
  ↓ re-registration
RE_REGISTERED
  ↓ atomic enrollment
ENROLLED
```
## 16.2 Business Rules
- Registration number generated server-side and unique.
- Public application only accepted during OPEN admission period.
- Applicant can save draft; after SUBMITTED identity edits are restricted/audited.
- Required documents are configurable per admission period.
- Applicant cannot become VERIFIED if required document verification incomplete.
- Selection formula/ranking is configurable; decision remains explicit and auditable.
- ACCEPTED does not create Student automatically.
- Only RE_REGISTERED applicant may enroll under normal flow.
- Enrollment creates Student, Guardian, StudentGuardian, StudentEnrollment in one transaction.
- Replaying enrollment for same applicant must return existing result or reject safely; never duplicate Student.
- Desired IPA/IPS is preference only until final enrollment assignment.
## 16.3 UI Routes
| Route | Purpose |
| --- | --- |
| /admissions | Dashboard |
| /admissions/periods | Admission period management |
| /admissions/applicants | Applicant list/filter |
| /admissions/applicants/[id] | Applicant profile/timeline |
| /admissions/applicants/[id]/verify | Verification workspace |
| /admissions/decisions | Decision/ranking workspace |
| /admissions/re-registration | Accepted candidate re-registration |
| /apply | Public mobile-first application |
| /apply/status | Candidate status |
## 16.4 API
| Method | Endpoint | Behavior |
| --- | --- | --- |
| GET | /api/v1/admissions/periods/ | List |
| POST | /api/v1/admissions/periods/ | Create |
| POST | /api/v1/admissions/periods/{id}/open/ | Validate then open |
| POST | /api/v1/admissions/periods/{id}/close/ | Close intake |
| GET | /api/v1/admissions/applicants/ | Scoped list |
| POST | /api/v1/admissions/applicants/ | Create draft |
| GET | /api/v1/admissions/applicants/{id}/ | Detail |
| PATCH | /api/v1/admissions/applicants/{id}/ | Edit allowed fields by state |
| POST | /api/v1/admissions/applicants/{id}/submit/ | Submit |
| POST | /api/v1/admissions/applicants/{id}/verify/ | Verification outcome |
| POST | /api/v1/admissions/applicants/{id}/decision/ | Decision |
| POST | /api/v1/admissions/applicants/{id}/re-register/ | Re-registration |
| POST | /api/v1/admissions/applicants/{id}/enroll/ | Atomic Student creation |
## 16.5 Required Tests
- [ ] Cannot submit outside registration window.
- [ ] Concurrent registration cannot duplicate registration_no.
- [ ] Missing required document blocks VERIFIED.
- [ ] Unauthorized teacher cannot list/read applicants.
- [ ] Decision transition audited.
- [ ] Rejected applicant cannot enroll.
- [ ] Enrollment transaction rollback leaves no partial Student/Guardian records.
- [ ] Enrollment retry does not duplicate records.
- [ ] File MIME/size validation enforced.
- [ ] Public status page does not expose applicant data by sequential guessing.
# 17. Students, Guardians, Enrollment, Transfer, Promotion
## 17.1 Core Invariant
`StudentEnrollment` is the authoritative history for grade, major and classroom. `Student` never stores current_class/current_major as sole truth.
```text
2026 → X IPA 1
2027 → XI IPA 1
2028 → XII IPA 1

or

2026 → X IPS 1
2027 → XI IPS 1
2028 → XII IPS 1
```
## 17.2 Student Lifecycle
```text
ACTIVE
 ├─ TRANSFERRED
 ├─ LEFT
 ├─ INACTIVE
 └─ GRADUATED
```
## 17.3 Promotion
```text
Trimestre 3 CLOSED
  ↓
Required TermGrades FINALIZED
  ↓
Report review/final data complete
  ↓
PROMOTED / REPEATED / GRADUATED
  ↓
Create next-year enrollment when applicable
  ↓
Close previous enrollment
```
- Promotion operates transactionally per student.
- Default target major = current major.
- IPA↔IPS change requires permission + reason + audit.
- X→XI, XI→XII are normal promotion paths.
- XII GRADUATED creates no next enrollment.
- REPEATED creates next-year enrollment in same grade by default.
- Historical enrollment is never rewritten to fake promotion.
## 17.4 Student 360 Page Sections
- Identity and contacts.
- Current enrollment summary.
- Academic history by year/trimestre.
- Guardian relationships.
- Attendance summary.
- Published grades/report cards.
- Finance summary only for authorized roles.
- Documents.
- Transfer/status history.
- Counseling summary only for restricted roles; not in general serializer.
## 17.5 Tests
- [ ] At most one ACTIVE enrollment per student per academic year.
- [ ] Enrollment classroom year/grade/major mismatch rejected.
- [ ] Class move preserves previous historical record/event.
- [ ] Major transfer is traceable.
- [ ] Guardian cannot access unrelated child.
- [ ] Graduated student cannot accidentally receive normal active enrollment.
- [ ] Promotion cannot run on incomplete required academic state without audited privileged override.
# 18. Academic Configuration
## 18.1 Academic Year Activation Gate
- [ ] Start/end dates valid.
- [ ] Exactly three trimestres exist.
- [ ] Trimestre numbers 1,2,3 unique and non-overlapping.
- [ ] CAU mapping equals respective trimester number.
- [ ] Grade X/XI/XII seeded.
- [ ] Major IPA/IPS seeded.
- [ ] Bell periods configured.
- [ ] Rombel created.
- [ ] Subject offerings configured.
- [ ] Teaching assignments sufficiently configured.
- [ ] SPP fee plan configured before billing if finance is active.
## 18.2 Historical Configuration Rule
Do not edit prior AcademicYear SubjectOffering/GradingScheme to represent new curriculum. Create new-year configurations. Historical reports must resolve from historical rows/snapshots.
# 19. Scheduling / Timetable
## 19.1 Collision Engine
- Reject same teacher in overlapping slot/date range.
- Reject same classroom in overlapping slot/date range.
- Reject same room in overlapping slot/date range.
- Reject TeachingAssignment incompatible with classroom grade/major/year.
- One-date changes use ScheduleException instead of editing recurring schedule.
- Substitute teacher must pass collision checks for exception date.
## 19.2 Error Codes
- `SCHEDULE_TEACHER_CONFLICT`
- `SCHEDULE_CLASS_CONFLICT`
- `SCHEDULE_ROOM_CONFLICT`
- `SCHEDULE_ASSIGNMENT_MISMATCH`
- `SCHEDULE_DATE_OUTSIDE_YEAR`
## 19.3 UI
- Admin weekly matrix with grade/major/class filters.
- Teacher personal schedule.
- Student/guardian schedule derived from enrollment.
- Substitution/exception workspace.
- Printable timetable export.
## 19.4 Tests
- [ ] Teacher double booking rejected.
- [ ] Class double booking rejected.
- [ ] Room double booking rejected.
- [ ] Cancelled exception affects only target date.
- [ ] Substitute conflict rejected.
- [ ] Historical schedule remains queryable.
# 20. Student Attendance
## 20.1 Modes
| Mode | Definition |
| --- | --- |
| DAILY | One attendance status per student/class/day when school uses daily attendance. |
| LESSON | Attendance per scheduled lesson/subject meeting. |
## 20.2 Status
- `PRESENT`
- `SICK`
- `PERMITTED`
- `ABSENT`
- `LATE`
## 20.3 Session Workflow
```text
OPEN → SUBMITTED → LOCKED
```
- Roster comes from active StudentEnrollment effective on session date.
- Blank status is not PRESENT.
- "Mark all present" must be an explicit UI action.
- Submit verifies required roster coverage.
- Locked session rejects direct writes.
- Post-submit/lock changes use AttendanceCorrection and mandatory reason.
- Attendance summary respects trimester date bounds and school calendar.
## 20.4 Offline Sync Payload
```json
{
  "batch_id": "uuid",
  "device_id": "opaque-device-id",
  "session_id": "uuid",
  "base_session_version": 4,
  "mutations": [{
    "mutation_id": "uuid",
    "student_id": "uuid",
    "base_record_version": 2,
    "status": "PRESENT",
    "minutes_late": null,
    "client_recorded_at": "ISO-8601"
  }]
}
```
## 20.5 Offline Conflict Resolution
- Same mutation_id replay returns stored result; never writes twice.
- If base version equals server version: apply.
- If version differs but desired state equals current server state: equivalent success/duplicate.
- If version differs and value conflicts: return conflict; never silent last-write-wins.
- UI displays local value and current server value.
- Only authorized user can choose resolution.
- Resolution creates audit/correction history where applicable.
## 20.6 Endpoints
| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | /api/v1/attendance/sessions/ | Open/create |
| GET | /api/v1/attendance/sessions/{id}/ | Roster + state |
| PATCH | /api/v1/attendance/sessions/{id}/records/{student_id}/ | Online update |
| POST | /api/v1/attendance/sessions/{id}/submit/ | Submit |
| POST | /api/v1/attendance/sessions/{id}/lock/ | Lock |
| POST | /api/v1/attendance/records/{id}/correct/ | Correction |
| POST | /api/v1/attendance/offline-sync/ | Batch idempotent sync |
| GET | /api/v1/attendance/students/{id}/summary/ | Summary |
## 20.7 Offline Tests
- [ ] Same mutation posted three times applies once.
- [ ] Conflict returns conflict object instead of overwrite.
- [ ] Teacher outside assignment denied.
- [ ] Substitute permission valid only for correct date.
- [ ] LATE minutes validation enforced.
- [ ] Locked session direct patch denied.
- [ ] Correction requires reason and audit.
- [ ] Transferred-out student excluded by effective date.
- [ ] Valid transferred-in student included.
- [ ] Logout clears local scoped roster but does not silently discard unsynced mutations before warning/handling.
# 21. Teacher/Staff Attendance
- Daily status: PRESENT/SICK/PERMITTED/ABSENT/LATE.
- Optional check-in/check-out timestamps.
- Used for school operational record only, not payroll calculation.
- Corrections audited.
- Staff can view own record if portal permission granted.
# 22. Assessment, CAU and Gradebook
## 22.1 Fixed Mapping
```text
Trimestre 1 → CAU 1
Trimestre 2 → CAU 2
Trimestre 3 → CAU 3
```
- CAU is an AssessmentType with `cau_number`.
- CAU number must equal Trimester number.
- Raw scores are not overwritten without revision trail when correction occurs after meaningful save/finalization.
- Frontend grade preview is non-authoritative.
- Backend Decimal calculation and configured rounding are authoritative.
## 22.2 Calculation
```text
normalized_score = earned / max_score * 100
component_result = configured aggregation of normalized scores
term_grade = Σ(component_result × weight_percent / 100)
```
- GradingComponent weights must total 100 before scheme becomes ACTIVE.
- Absent/excused treatment is configured; do not silently coerce to zero without rule.
- Remedial is traceable; policy determines replacement/max behavior.
- Final grade override requires dedicated permission, reason, and audit.
- Finalized term grade cannot silently recalculate after source score changes; it must be reopened.
## 22.3 State
```text
Assessment: DRAFT → OPEN → CLOSED → LOCKED
TermGrade : DRAFT → FINALIZED → REOPENED → FINALIZED
```
## 22.4 Gradebook UI
- Spreadsheet-like class roster with sticky student names.
- Autosave can debounce, but each save returns authoritative version.
- Unsaved/error cells visibly marked.
- Bulk paste/import validates before commit.
- CAU columns clearly labeled by trimester.
- Completion indicator shows ungraded students.
- Finalization requires explicit confirmation.
## 22.5 Tests
- [ ] CAU1 attached to Trimestre2 rejected.
- [ ] Score above max rejected.
- [ ] Unenrolled student rejected.
- [ ] Unassigned teacher denied.
- [ ] Locked assessment rejects write.
- [ ] Finalized grade does not silently change.
- [ ] Reopen requires permission/reason/audit.
- [ ] Weight total must be 100 before activation.
- [ ] Rounding deterministic.
# 23. Report Card, Transcript, Promotion, Graduation
## 23.1 Report Card Content
- School identity/logo.
- Student identity/student number.
- Academic year and Trimestre.
- Grade, IPA/IPS, classroom.
- Subject final grades.
- CAU display fields according to school report template.
- Attendance summary.
- Homeroom note.
- Revision/publication identifier.
- Optional public-safe QR verification token.
## 23.2 Workflow
```text
TermGrades FINALIZED
  ↓
ReportCard DRAFT snapshot
  ↓
Homeroom REVIEWED
  ↓
PUBLISHED
  ↓
PDF generation job

Correction after publish:
PUBLISHED → REOPENED → new revision → PUBLISHED
```
- Published report is immutable snapshot.
- Old revisions remain traceable and can be marked superseded.
- Bulk PDF generation runs via Celery.
- Transcript aggregates finalized/published historical data, not draft score.
- Graduation applies only to grade XII enrollment.
- National exam record is separate and can be referenced without recalculating official result.
## 23.3 Tests
- [ ] Incomplete required term grades block publish.
- [ ] Published report direct edit denied.
- [ ] New revision preserves old metadata/file.
- [ ] Guardian can download only linked child report.
- [ ] Student can download only own report.
- [ ] Promotion resolves current enrollment correctly.
- [ ] Major change requires reason.
- [ ] Graduation closes enrollment and does not create next enrollment.
# 24. National Examination — Grade XII
- Record candidate number, registration status, attendance, result, score if official format provides it, certificate number/file.
- Only grade XII students for that year are normally eligible.
- Do not calculate national result from CAU.
- Official exam naming remains configurable.
- Individual official result must be entered/imported from authorized source; no public scraping of personal results.
- National exam data is available in principal/admin/authorized student record, with privacy scope.
# 25. Finance — SPP and Student Fees
## 25.1 Scope
This is a student billing subsystem. It is not general accounting. Currency is USD; all arithmetic uses Decimal.
## 25.2 Invoice Lifecycle
```text
UNPAID
  ↓ verified allocation
PARTIALLY_PAID
  ↓ more allocation
PAID

Incorrect eligible invoice → VOID
Verified incorrect payment → REVERSED (never hard delete)
```
## 25.3 Monthly SPP Generation
- FeePlan ACTIVE defines amount and applicability.
- Eligible students determined by active enrollment/effective date.
- Deterministic key: `SPP:{academic_year}:{student_id}:{YYYY-MM}`.
- Unique generation_key guarantees no duplicate invoice even on task retry/concurrency.
- Discount/scholarship effective at billing date applied server-side.
- Admin can run preview/dry-run before execute.
- Celery job returns created/skipped/error counts.
- No invoice is generated for ineligible/closed enrollment after effective date unless explicit rule says otherwise.
## 25.4 Payment — Cash
```text
Finance user selects student/invoices
  ↓
Server starts transaction + locks invoices
  ↓
Validate outstanding balances
  ↓
Create VERIFIED cash Payment
  ↓
Create allocations
  ↓
Recompute invoice paid_amount/balance/status
  ↓
Create Receipt snapshot
  ↓ commit
After commit: render PDF + notification
```
## 25.5 Payment — Bank Transfer
- Guardian/student uploads proof to private storage.
- Payment begins PENDING.
- Finance verifies/rejects using explicit action.
- Proof upload alone never marks invoice paid.
- Verification transaction creates allocations and balance changes.
## 25.6 Overpayment Rule
System rejects allocation exceeding invoice outstanding. No implicit student-credit wallet is included. Finance must correct amount/allocation explicitly.
## 25.7 Reversal
- Only VERIFIED payment can be reversed.
- Reason is mandatory.
- Reversal runs transactionally.
- Allocations are reversed and invoice balances restored.
- Payment status becomes REVERSED.
- Original payment/receipt remain historical.
- Notification/report views reflect reversal clearly.
## 25.8 Finance Reports
- Outstanding SPP by month.
- Arrears by student/class/grade/major.
- Payments by date/method.
- Daily cashier summary.
- Student statement: invoice/payment/allocation/reversal.
- Discount/scholarship usage.
- Collection rate by period.
## 25.9 Finance API
| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /api/v1/finance/fee-types/ | List |
| POST | /api/v1/finance/fee-plans/ | Create plan |
| POST | /api/v1/finance/invoices/generate-preview/ | Dry-run |
| POST | /api/v1/finance/invoices/generate/ | Async idempotent generation |
| GET | /api/v1/finance/invoices/ | List/filter |
| GET | /api/v1/finance/invoices/{id}/ | Detail |
| POST | /api/v1/finance/invoices/{id}/void/ | Void with rules |
| POST | /api/v1/finance/payments/ | Create payment |
| POST | /api/v1/finance/payments/{id}/verify/ | Verify pending |
| POST | /api/v1/finance/payments/{id}/reverse/ | Reverse |
| GET | /api/v1/finance/receipts/{id}/ | Receipt metadata |
| POST | /api/v1/finance/reports/arrears/ | Report job |
## 25.10 Finance Tests
- [ ] SPP generation executed twice creates no duplicate.
- [ ] Concurrent generation creates exactly one invoice per generation_key.
- [ ] Concurrent payments cannot overpay invoice.
- [ ] Payment idempotency replay returns same logical payment.
- [ ] Reversal restores exact balances.
- [ ] Receipt references verified payment snapshot.
- [ ] Teacher cannot access finance write endpoints.
- [ ] Guardian sees only linked child finance.
- [ ] All money arithmetic uses Decimal.
- [ ] Invoice with verified allocation cannot be voided directly.
- [ ] Reversal requires reason and audit.
# 26. BK / Konseling dan Kedisiplinan
## 26.1 Tujuan
Menyimpan kasus pembinaan, tindak lanjut, dan pelanggaran secara terstruktur tanpa membuka catatan sensitif kepada seluruh guru. Domain BK dan disiplin berbagi student reference tetapi mempunyai permission dan workflow terpisah.
## 26.2 Counseling Workflow
```text
OPEN
  ↓
IN_PROGRESS
  ↓
RESOLVED
  ↘
   CLOSED
```
- Kasus dibuat oleh Guru BK atau role yang diberi permission khusus.
- Case memiliki kategori, ringkasan, tingkat urgensi, assigned counselor dan status.
- Detail sensitif tidak ditampilkan di dashboard umum.
- Follow-up bersifat append-only; koreksi dilakukan dengan entry baru atau audited edit.
- Guardian communication dicatat tanggal, channel, ringkasan dan actor.
- File evidence memakai private object storage.
- Closed case dapat dibuka ulang hanya dengan permission `counseling.reopen` dan alasan.
## 26.3 Discipline Workflow
- Incident mencatat waktu, lokasi, kategori, severity, reporter, student dan kronologi.
- Action dapat berupa warning, counseling referral, parent meeting atau tindakan sekolah lain yang configurable.
- Point system tidak wajib; jika sekolah mengaktifkannya, point rule disimpan sebagai konfigurasi bukan hard-coded.
- Incident tidak otomatis mengubah status enrollment.
- Pemberitahuan guardian harus eksplisit dan tercatat.
- Incident yang salah tidak dihapus; status `VOID` + reason + audit.
## 26.4 Permission
| Actor | Counseling | Discipline |
| --- | --- | --- |
| Guru BK | Read/write assigned/all sesuai scope | Read/write |
| Wali Kelas | Summary non-sensitive bila diberi scope | Read incidents kelas |
| Guru | Tidak melihat notes sensitif | Create incident + read own report bila diizinkan |
| Kepala Sekolah | Aggregate + authorized detail | Authorized detail |
| Student/Guardian | Tidak ada akses internal | Hanya notice yang dipublish khusus |
## 26.5 Tests
- [ ] Guru biasa tidak dapat membaca counseling notes.
- [ ] BK dapat melihat student yang diperlukan tanpa mendapatkan finance permission.
- [ ] VOID discipline incident tetap muncul di audit.
- [ ] Closed counseling case tidak dapat diubah tanpa reopen.
- [ ] Guardian notification tidak membocorkan internal notes.
# 27. Ekstrakurikuler
## 27.1 Fitur
- Master kegiatan: nama, pembina, deskripsi, jadwal, kapasitas, tahun ajaran, status.
- Pendaftaran/assignment siswa.
- Status membership: ACTIVE, WAITLIST, WITHDRAWN, COMPLETED.
- Attendance kegiatan.
- Catatan/prestasi sederhana.
- Laporan peserta dan kehadiran.
- Ekstrakurikuler tidak memengaruhi nilai akademik kecuali sekolah menambahkan rule resmi melalui future change request.
## 27.2 Constraints
- Satu siswa tidak boleh memiliki duplicate active membership di kegiatan yang sama pada tahun yang sama.
- Capacity enforcement dilakukan server-side.
- Pembina hanya mengelola kegiatan yang ditugaskan.
- Kegiatan archived tetap mempertahankan histori membership.
## 27.3 API
| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /api/v1/extracurricular/activities/ | List |
| POST | /api/v1/extracurricular/activities/ | Create |
| POST | /api/v1/extracurricular/activities/{id}/members/ | Add member |
| DELETE | /api/v1/extracurricular/members/{id}/ | Withdraw, not hard-delete historical membership |
| POST | /api/v1/extracurricular/activities/{id}/attendance/ | Record attendance |
# 28. Perpustakaan
## 28.1 Scope
Perpustakaan mengelola metadata buku, physical copy, peminjaman, pengembalian, perpanjangan, keterlambatan dan denda opsional. Setiap copy dilacak individual; jangan menggunakan hanya `books.quantity`.
## 28.2 Workflow Copy
```text
AVAILABLE → ON_LOAN → AVAILABLE
AVAILABLE → LOST
AVAILABLE → DAMAGED
AVAILABLE → WITHDRAWN
```
## 28.3 Loan Workflow
```text
OPEN
  ↓ return
RETURNED

OPEN + due_date passed → OVERDUE
OPEN + copy lost     → LOST
```
- Barcode/copy_code unik untuk setiap physical copy.
- Student/staff borrower harus aktif.
- Copy AVAILABLE wajib dikunci transactionally ketika loan dibuat.
- Satu copy hanya mempunyai satu open loan.
- Renewal menambah due_date dengan policy sekolah dan dicatat.
- Fine optional menggunakan Decimal; bukan bagian dari SPP invoice kecuali finance user secara eksplisit membuat charge.
- Lost/damaged resolution harus tercatat.
## 28.4 Library API
| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /api/v1/library/books/ | Search catalog |
| POST | /api/v1/library/books/ | Create metadata |
| POST | /api/v1/library/copies/ | Register copy |
| POST | /api/v1/library/loans/ | Checkout |
| POST | /api/v1/library/loans/{id}/return/ | Return |
| POST | /api/v1/library/loans/{id}/renew/ | Renew |
| GET | /api/v1/library/loans/overdue/ | Overdue list |
## 28.5 Tests
- [ ] Concurrent checkout satu copy menghasilkan satu open loan.
- [ ] Withdrawn copy tidak dapat dipinjam.
- [ ] Return dua kali bersifat idempotent atau ditolak jelas tanpa menggandakan event.
- [ ] Due-date timezone menggunakan date school-local.
- [ ] Student hanya melihat own loans; librarian melihat scoped library data.
# 29. Inventaris dan Aset
## 29.1 Scope
- Asset register: kode aset, kategori, serial number, nama, acquisition date, value optional, condition, location, status.
- Assignment ke staff/teacher/room.
- Maintenance history.
- Transfer lokasi.
- Disposal/retirement dengan alasan.
- Attachment invoice/foto optional private.
## 29.2 Asset State
```text
AVAILABLE
ASSIGNED
MAINTENANCE
LOST
RETIRED
```
## 29.3 Invariants
- asset_code unique.
- RETIRED asset tidak dapat di-assign kembali tanpa privileged restore workflow.
- Satu asset hanya memiliki satu active assignment.
- Assignment closing menyimpan returned_at dan condition_after.
- Maintenance tidak menghapus assignment history.
- Perubahan value/status/ownership diaudit.
# 30. Komunikasi, Pengumuman, dan Notifikasi
## 30.1 Announcement
- Title, body, publish_at, expire_at, priority, author, attachment.
- Audience: ALL, ROLE, GRADE, MAJOR, CLASSROOM, STUDENT, GUARDIAN, STAFF.
- Announcement draft tidak terlihat penerima.
- Publish dapat scheduled melalui Celery Beat/task.
- Expired announcement tetap historical tetapi tidak muncul sebagai current item.
## 30.2 Notification Event Catalog
| Event | Default Audience | Channels |
| --- | --- | --- |
| attendance.absent | Guardian linked student | In-app + Web Push |
| attendance.late | Guardian linked student | In-app |
| finance.invoice.created | Student + Guardian | In-app |
| finance.payment.verified | Student + Guardian | In-app + email optional |
| finance.payment.reversed | Student + Guardian | In-app + email optional |
| finance.invoice.overdue | Student + Guardian | In-app + Web Push |
| report_card.published | Student + Guardian | In-app + Web Push |
| schedule.changed | Affected teacher + class students | In-app |
| announcement.published | Resolved audience | In-app + Web Push optional |
| admission.result.published | Applicant contact | Public portal/in-app/email optional |
## 30.3 Delivery Design
- Core transaction writes domain state first.
- After DB commit, enqueue notification task.
- Notification row dibuat dengan stable dedup_key.
- Each channel creates NotificationDelivery.
- Delivery states: PENDING, SENT, FAILED, SKIPPED.
- Retry exponential backoff untuk transient error.
- Permanent invalid push subscription dinonaktifkan.
- Notification failure tidak rollback academic/finance transaction.
## 30.4 Web Push
- Store subscription endpoint/p256dh/auth encrypted at rest where infrastructure permits.
- User can revoke device subscription.
- Do not include sensitive grade/payment detail in push body; use generic message and authenticated deep link.
- Service worker click opens/focuses correct route.
- Push is enhancement; in-app inbox remains source of delivery history.
# 31. Dokumen dan File Storage
## 31.1 Storage Rules
- Production bucket private by default.
- Object key generated server-side; original filename is metadata only.
- No user-supplied path traversal.
- MIME validated by content signature where practical, not extension only.
- Max size configurable per document type.
- Allowed types default: PDF/JPEG/PNG; XLSX/CSV only in import context.
- Signed download URL short-lived or streamed through authorized backend.
- Every download of sensitive document may be audit logged.
- Files referenced by finalized records are not silently replaced; create new version/reference.
## 31.2 Document Categories
- Admission documents.
- Student identity/administrative documents.
- Guardian documents if required.
- Attendance leave evidence.
- Payment proof.
- Generated receipt.
- Report card/transcript.
- Transfer/graduation document.
- Counseling/discipline evidence restricted.
- Library/asset attachment.
## 31.3 Upload Workflow
```text
request upload authorization
  ↓
validate role + owner context
  ↓
upload to private object
  ↓
server verifies metadata/checksum/size
  ↓
create StoredFile
  ↓
attach to domain record
```
If direct-to-S3 presigned upload is used, the finalize endpoint must verify that object exists and belongs to the expected temporary prefix before creating domain attachment.
# 32. Import dan Export
## 32.1 Supported Imports
- Students.
- Guardians and relationships.
- Teachers/staff.
- Subjects.
- Classroom memberships/enrollments.
- Assessment scores.
- Opening finance balances/invoices only through privileged template.
- Library books/copies.
- Assets.
## 32.2 Mandatory Import Pipeline
```text
UPLOAD
  ↓
PARSE
  ↓
HEADER VALIDATION
  ↓
ROW NORMALIZATION
  ↓
ROW VALIDATION
  ↓
DUPLICATE DETECTION
  ↓
PREVIEW
  ↓ user CONFIRM
QUEUED IMPORT
  ↓
TRANSACTIONAL CHUNKS
  ↓
RESULT + ERROR FILE
```
- Never insert immediately on upload.
- Template version included in workbook/CSV metadata or expected headers.
- Preview shows create/update/skip/error counts.
- Identity matching rule is explicit per import type.
- ImportJob stores source checksum so accidental same-file retry can be detected.
- Chunk size configurable; one bad row does not necessarily fail all rows unless atomic mode selected.
- ImportRowError contains row number, field, stable error code, human message.
- No silent coercion of invalid dates/money/grades.
- Final result file downloadable.
## 32.3 Export
- Exports enforce same permission/scope as screen/API.
- Large export runs as ReportJob/Celery.
- CSV encoded UTF-8.
- XLSX uses stable columns and human labels.
- Export of PII is audit logged and restricted.
- Generated export expires according to retention policy.
# 33. Dashboard dan Reporting
## 33.1 Dashboard Rules
- Dashboard cards are derived data; they never become source-of-truth tables unless materialized aggregation is justified.
- Every metric displays period/filter context.
- No aggregate may expose a student outside actor scope.
- Expensive metrics cached with short TTL or asynchronously materialized.
- Numbers link to filtered source list where permission allows.
## 33.2 Role Dashboard
| Role | Required Widgets |
| --- | --- |
| Admin/TU | Active students, enrollment completeness, transfer, classes, recent audit-relevant operations |
| Principal | Attendance rate, absences, grade completion, SPP collection/arrears, admissions, national exam summary |
| Curriculum | Teaching assignment gaps, schedule conflicts, assessment/CAU completion, report-card readiness |
| Finance | Today payments, month collection, outstanding invoices, arrears, pending bank verification |
| Teacher | Today schedule, pending attendance, active assessments, missing scores |
| Homeroom | Class attendance, missing grades, student alerts, report readiness |
| BK | Open assigned cases and follow-up due |
| Librarian | Open loans, overdue, lost/damaged copies |
| Student | Today schedule, attendance summary, grades/reports published, finance status, announcements |
| Guardian | Child switcher, child attendance, published reports, invoices/payments, announcements |
## 33.3 Canonical Reports
| Code | Report | Domain |
| --- | --- | --- |
| ADM-01 | Applicant list | Admission |
| ADM-02 | Admission result | Admission |
| STU-01 | Active students by class | Student |
| STU-02 | Students by grade/major | Student |
| STU-03 | Enrollment history | Student |
| ATT-01 | Daily attendance | Attendance |
| ATT-02 | Attendance by student/trimestre | Attendance |
| ATT-03 | Chronic absence | Attendance |
| ACA-01 | Teaching assignments | Academic |
| ACA-02 | Schedule per class | Schedule |
| ACA-03 | Schedule per teacher | Schedule |
| GRD-01 | Assessment score sheet | Grade |
| GRD-02 | CAU completion | Grade |
| GRD-03 | Term grade register | Grade |
| RPT-01 | Report card per student | Report |
| RPT-02 | Bulk report cards | Report |
| RPT-03 | Transcript | Report |
| FIN-01 | Invoice register | Finance |
| FIN-02 | Payments by period | Finance |
| FIN-03 | Arrears by student | Finance |
| FIN-04 | Arrears by class | Finance |
| FIN-05 | Student statement | Finance |
| FIN-06 | Daily cashier | Finance |
| LIB-01 | Open/overdue loans | Library |
| AST-01 | Asset register | Asset |
| BK-01 | Case aggregate | Counseling restricted |
| EXT-01 | Extracurricular participants | Extracurricular |
# 34. PWA — Production Specification
## 34.1 Goals
- Installable experience pada browser yang mendukung.
- Fast shell/navigation pada koneksi lambat.
- Offline-safe attendance workflow.
- Graceful offline page untuk fitur network-only.
- No stale sensitive write assumptions.
- Update service worker tanpa membuat client memakai schema IndexedDB yang incompatible.
## 34.2 Manifest
```json
{
  "name": "Sistem Informasi SMA",
  "short_name": "SMA",
  "start_url": "/",
  "display": "standalone",
  "scope": "/",
  "theme_color": "<school-config>",
  "background_color": "#ffffff",
  "icons": ["192x192", "512x512", "maskable"]
}
```
- Manifest generated/static with production-safe school branding.
- Icons are project-owned assets.
- No personal/student data in manifest.
- Install instructions shown only where browser capability supports it.
## 34.3 Cache Classification
| Resource | Strategy | Notes |
| --- | --- | --- |
| Hashed JS/CSS/icons/fonts | Cache First | Immutable versioned assets |
| App shell/public static pages | Stale While Revalidate | No sensitive HTML snapshot |
| Reference master data needed offline | Network First + bounded cache | Only scoped minimum |
| Schedule current user | Network First + bounded fallback | TTL/versioned |
| Attendance class roster | Explicit IndexedDB snapshot | Downloaded with user scope |
| Grades/finance/admin API | Network Only by default | Do not generic-cache sensitive mutations |
| File download | Network Only | Unless explicit temporary user-controlled download |
| Auth/session endpoints | Network Only | Never service-worker cache |
## 34.4 IndexedDB Schema
| Store | Key | Contents |
| --- | --- | --- |
| meta | key | db_version, current_user, last_sync |
| class_rosters | teaching_assignment_id | Minimal student roster + server version |
| attendance_sessions | session_id | Session metadata |
| attendance_drafts | session_id:student_id | Local selected status/note |
| mutation_queue | mutation_id | Pending attendance command |
| sync_receipts | mutation_id | ACK/conflict/failure state |
| reference_cache | namespace:key | Small offline reference values |
- Never persist session cookie/token manually into IndexedDB.
- Never download all school students for generic offline use.
- Logout clears user-scoped IndexedDB stores.
- Login as different account clears/migrates previous user-scoped cache.
- IndexedDB migration functions are versioned and tested.
- If migration fails, preserve server data assumption, reset local cache, show actionable message.
## 34.5 Offline Mutation State Machine
```text
DRAFT
  ↓ enqueue
PENDING
  ↓ sync
SENDING
  ├── 2xx/duplicate ACK → APPLIED
  ├── 409 version conflict → CONFLICT
  ├── 4xx validation/auth → REJECTED
  └── network/5xx → PENDING (retry)
```
- Each mutation UUID generated client-side.
- Payload includes server base_version when editing existing record.
- Server persists OfflineMutationReceipt with unique mutation_id.
- Replay of APPLIED mutation returns previous result without reapplying.
- CONFLICT is visible to user; do not silently last-write-wins sensitive attendance correction.
- 401/403 stops sync and asks user to authenticate/re-authorize.
- Manual retry button is always available.
- Automatic sync attempts on app start, focus and browser online event.
- Background Sync may be used opportunistically but is never the only mechanism.
## 34.6 Service Worker Update Policy
- Build has app version identifier.
- New service worker installs but controlled activation avoids interrupting open attendance form.
- UI can display “Versi baru tersedia” and reload safely.
- IndexedDB schema compatibility checked before activation-dependent flow.
- Never `skipWaiting()` blindly while unsaved in-memory form exists.
- Old caches deleted by version namespace after activation.
## 34.7 Offline Acceptance Tests
- [ ] Open assigned class online, disconnect network, mark full attendance, reload app, draft remains.
- [ ] Reconnect and sync once; server receives all commands exactly once.
- [ ] Retry same mutation IDs; no duplicate attendance effects.
- [ ] Admin edits one attendance while teacher offline; teacher sync receives conflict.
- [ ] Logout offline cache cannot be opened after different user login.
- [ ] Service worker upgrade does not erase pending mutations.
- [ ] Finance and grade publish actions fail closed when offline.
# 35. Frontend Architecture
## 35.1 Route Groups
```text
apps/web/src/app/
├── (public)/
│   ├── login/
│   ├── admissions/
│   └── admission-result/
├── (portal)/
│   ├── dashboard/
│   ├── profile/
│   ├── announcements/
│   └── notifications/
├── (staff)/
│   ├── students/
│   ├── academics/
│   ├── schedules/
│   ├── attendance/
│   ├── grades/
│   ├── reports/
│   ├── finance/
│   ├── counseling/
│   ├── library/
│   └── assets/
└── api/   # only Next-specific utility endpoints if unavoidable; core API remains Django
```
## 35.2 Frontend Layer Rules
- `features/<domain>` owns hooks, forms, table definitions and domain UI.
- Generated OpenAPI types/client or a single typed API layer; no arbitrary fetch scattered across components.
- TanStack Query manages server state.
- Local UI state remains local; do not duplicate server objects into global Zustand store.
- React Hook Form + Zod handles client UX validation; Django remains authoritative validation.
- Permission-aware navigation hides unavailable features, but backend remains enforcement.
- No business calculation for final grades/invoice balance solely in browser.
- Money received from API as string decimal and formatted for display.
- Dates/timestamps go through shared timezone utilities.
## 35.3 Page State Contract
Every data page explicitly implements:
- Loading skeleton.
- Empty state.
- Permission denied state.
- Network error with retry.
- Validation errors mapped to fields.
- Pagination/filter state in URL where useful.
- Success feedback.
- Destructive/action confirmation where relevant.
- Mobile responsive state.
## 35.4 Tables
- Server-side pagination for large lists.
- Server-side filtering/sorting for canonical data.
- Stable row ID uses UUID, not array index.
- Column visibility may be user preference but permission controls data returned.
- Bulk action requires explicit selected IDs and server re-authorization.
- Export does not scrape current HTML table; it requests authorized report/export endpoint.
## 35.5 i18n
- UI string keys, no domain text duplicated arbitrarily.
- Dictionaries: `tet`, `pt`, `id`.
- Database user-entered text is not machine-translated automatically.
- Status has stable machine enum + translated label.
- Number/date formatting uses locale but canonical API format remains ISO/decimal.
- Fallback locale configured and missing-key test available.
## 35.6 Accessibility
- Keyboard operable navigation and dialogs.
- Visible focus state.
- Form labels programmatically associated.
- Error summary/readable errors.
- Color never sole carrier of attendance/grade/payment status.
- Minimum practical touch target on mobile.
- Table has accessible mobile alternative for critical teacher workflows.
- PDF is print-oriented; web portal remains accessible source.
# 36. Backend Django Architecture
## 36.1 Request Flow
```text
URL router
  ↓
DRF View/ViewSet (HTTP orchestration only)
  ↓
Serializer/DTO validation
  ↓
Permission + object scope
  ↓
Service / use-case
  ↓
Selector/repository/query helper
  ↓
Django ORM + transaction
  ↓
Domain event / on_commit background task
  ↓
Response serializer
```
## 36.2 Service Rule
- ViewSet must not contain multi-step business transactions.
- Model `save()` must not hide external side effects.
- Django signal is not the primary mechanism for critical finance/grade workflows.
- Services accept explicit actor/context.
- Selectors centralize repeated optimized read queries.
- Database constraint backs rules that must remain true under concurrency.
- `transaction.atomic()` wraps multi-row consistency.
- Use `select_for_update()` only inside transaction and only for rows that need serialization.
- External API/email/slow PDF operations happen after commit/background.
## 36.3 Suggested Module Internal Layout
```text
apps/attendance/
├── api/
│   ├── serializers.py
│   ├── permissions.py
│   ├── urls.py
│   └── views.py
├── models.py
├── services/
│   ├── create_session.py
│   ├── record_attendance.py
│   └── sync_offline.py
├── selectors.py
├── tasks.py
├── events.py
├── admin.py
└── tests/
    ├── test_models.py
    ├── test_services.py
    ├── test_api.py
    └── test_permissions.py
```
## 36.4 Settings Split
```text
config/settings/
├── base.py
├── local.py
├── test.py
├── staging.py
└── production.py
```
- No production secret committed.
- Environment validation fails startup if required secret missing.
- `DEBUG=False` in staging/production.
- Allowed hosts and trusted CSRF origins explicit.
- Secure cookie/HSTS/proxy SSL settings documented and tested behind reverse proxy.
# 37. Background Jobs — Celery
## 37.1 Queues
| Queue | Jobs |
| --- | --- |
| default | Small generic tasks |
| notifications | Email/Web Push deliveries |
| reports | PDF/XLSX/report generation |
| imports | Bulk import |
| finance | Monthly invoice generation/reminders |
| maintenance | Cleanup/health/retention tasks |
## 37.2 Task Contract
- Task receives IDs/primitives, not pickled Django model object.
- Task re-reads current data and validates expected state.
- Task has stable idempotency/dedup strategy if side-effecting.
- Transient external error retries with bounded exponential backoff.
- Business validation error does not retry indefinitely.
- Task stores failure reason/status when user-facing job.
- Queue is triggered using `transaction.on_commit` / Celery delay-on-commit equivalent when task depends on new DB state.
- Long job exposes progress at meaningful coarse checkpoints.
- No endless retry.
- Worker logs task_id, job_id, correlation_id when available.
## 37.3 Periodic Jobs
| Job | Schedule | Rule |
| --- | --- | --- |
| SPP generation | Configured monthly date | Idempotent unique generation key |
| Invoice overdue marking | Daily | Derived from due date/balance |
| Payment reminder | Daily or configured | Dedup per invoice/reminder window |
| Announcement scheduled publish | Every minute/few minutes | State transition guarded |
| Expired generated-file cleanup | Daily | Retention policy |
| Stale upload cleanup | Daily | Only unattached temp prefix |
| Data integrity scan | Daily/weekly | Alert, do not silently rewrite |
| Backup verification metadata check | Daily | Infrastructure integration dependent |
## 37.4 Worker Failure
- API remains usable for synchronous core operations if worker temporarily unavailable.
- Queued jobs remain pending in Redis according to broker durability configuration.
- Admin health page shows queue backlog/failed jobs.
- Never mark user job COMPLETED before artifact/delivery actually exists.
- Re-run action uses same business idempotency semantics.
# 38. Security and Privacy
## 38.1 Data Classification
| Class | Examples | Handling |
| --- | --- | --- |
| Public | Published school announcements | Can be public |
| Internal | Schedules, staff operational data | Authenticated/scoped |
| Personal | Student/guardian profile, contact | Restricted + audit where export |
| Sensitive operational | Grades, attendance details, counseling | Strict object scope |
| Financial | Invoices, payments, proof | Finance + owner scope |
| Secrets | Passwords, session secrets, API keys | Never log/display; secret store/env |
## 38.2 Authentication Controls
- Django password hashing with supported secure hasher.
- Password reset token expires and is single-purpose.
- Login rate limit at app/reverse proxy layer.
- Rotate session on login.
- Logout invalidates session.
- Inactive user cannot authenticate.
- Staff role removal takes effect on next authorization request; no permission copied permanently to frontend.
- Optional MFA can be added for Admin/Finance without changing domain authorization contract.
## 38.3 Session / CSRF
- Browser auth uses secure HttpOnly session cookie.
- CSRF enabled for unsafe methods.
- Frontend sends CSRF token per Django contract.
- `SameSite` selected to match deployment topology; default same-site deployment preferred.
- `Secure` cookie in production.
- No JWT stored in localStorage for primary browser flow.
## 38.4 Authorization
- Global role permission answers “may perform action type”.
- Object scope answers “may perform it on this student/class/payment/etc.”.
- Querysets are scope-filtered before object lookup where practical.
- Detail endpoints return 404 or 403 according to consistent security policy, never leak existence inadvertently.
- Bulk actions authorize every target or use a scoped queryset.
- Exports and files use same authorization path.
- Background task executes under captured actor/system reason and revalidates business scope when needed.
## 38.5 Input/Output Security
- DRF serializers validate types, enum, length, ranges and relationship scope.
- Rich text is sanitized or limited to safe markdown/text.
- File upload content/type/size checked.
- CSV injection prevented when exporting values starting with spreadsheet formula characters.
- No raw SQL string interpolation.
- No user-provided template executed server-side.
- API errors do not expose stack traces in production.
## 38.6 Headers/Transport
- HTTPS only.
- HSTS after HTTPS/proxy correctness verified.
- Content-Security-Policy configured and iteratively tightened.
- X-Content-Type-Options nosniff.
- Referrer-Policy.
- Frame-ancestors / clickjacking protection.
- Host header validation via ALLOWED_HOSTS/reverse proxy.
## 38.7 Secret Management
- DJANGO_SECRET_KEY, DB password, Redis credentials, S3 keys, email credentials, VAPID private key are environment/secret-store values.
- `.env` development file gitignored.
- `.env.example` contains names only.
- Rotate compromised secrets with documented runbook.
- No secret printed in health/debug endpoints.
# 39. Performance and Capacity
## 39.1 Expected Scale Assumption
Optimize for one SMA, not internet-scale SaaS. The design must comfortably handle several thousand active/historical students, multi-year grades/attendance, and burst traffic during attendance, result publication and monthly SPP operations.
## 39.2 Database Rules
- Use `select_related` for FK/one-to-one and `prefetch_related` for collections.
- Avoid N+1 in list/report endpoints; assert query counts for known hotspots where useful.
- Index foreign keys and common composite filters.
- Use partial/conditional unique constraints for “one active” rules where PostgreSQL/Django permits.
- Paginate lists; no unbounded “all students” API.
- Use `.only()`/`.values()` for aggregation/export only when it genuinely reduces load and remains maintainable.
- Use DB aggregation, not Python loops over entire tables.
- Run `EXPLAIN (ANALYZE, BUFFERS)` on slow queries in staging copy, not blindly in prod under load.
- Vacuum/analyze managed according to PostgreSQL/hosting defaults; monitor bloat/slow queries.
## 39.3 Cache
- Cache only derived/read-mostly data with explicit invalidation/TTL.
- Do not use Redis cache as source of truth.
- Permission-sensitive cache key includes scope/user/role context if caching private response.
- Reference masters may cache short TTL.
- Finance balances and final grades should be read from canonical DB or safely derived, not stale generic cache.
## 39.4 Load Scenarios
| Scenario | Target Test |
| --- | --- |
| Morning login | Concurrent staff/student logins |
| Class start | 50–100 teachers opening/recording attendance within short window |
| CAU input | Teachers bulk-saving score sheets |
| Report publication | Students/guardians reading published reports |
| SPP generation | All active students monthly via worker |
| Result/PDF | Bulk report generation in worker without starving API |
# 40. Observability
## 40.1 Structured Log Fields
```text
timestamp
level
service
environment
request_id
trace_id (if enabled)
user_id (nullable)
role
route
method
status_code
duration_ms
school_context = single-school constant/id
job_id/task_id (background)
event_code
message
```
- Never log password, session cookie, CSRF token, payment proof bytes, full sensitive document, or counseling narrative.
- Mask phone/email when logs do not need full values.
- Use stable event/error codes to search incidents.
- JSON logs preferred production.
## 40.2 Error Monitoring
- Sentry or equivalent for Django and Next.js.
- Environment/release tag.
- PII scrubbing configured.
- Frontend source maps uploaded privately during build if used.
- Critical finance/grade exceptions alert developer/operator.
- Expected validation 400 does not generate noisy high-severity alert.
## 40.3 Health Endpoints
| Endpoint | Purpose |
| --- | --- |
| /health/live | Process alive; no heavy dependency |
| /health/ready | DB and required dependencies reachable |
| /health/details | Admin/internal only; component status without secrets |
## 40.4 Operational Metrics
- HTTP request count, latency p50/p95/p99, 5xx rate.
- DB connection pool/use and slow query count.
- Celery queue depth, task runtime, retry/failure.
- Report/import job failure counts.
- Notification failure rate.
- Offline sync conflicts/rejections.
- Payment verification/reversal counts for operational anomaly review.
- Storage errors.
- Backup success age.
# 41. Backup and Disaster Recovery
## 41.1 Backup Scope
- PostgreSQL database.
- Private object storage.
- Deployment/configuration manifests excluding plaintext secrets.
- Encryption keys/secret recovery procedure through secure secret manager backup process.
- Generated files do not replace need to backup canonical DB/original documents.
## 41.2 Target Policy
| Item | Baseline |
| --- | --- |
| DB automated backup | Daily minimum |
| PITR/WAL | Enable when hosting supports and budget permits; recommended production |
| Object version/backup | Daily/versioned strategy |
| Retention | At least rolling retention defined by operator policy |
| Restore drill | Quarterly minimum + after major infra changes |
| RPO target | <=24h baseline; <=15–60 min when PITR available |
| RTO target | <=4h baseline; engineering target <=2h with managed infra |
## 41.3 Restore Drill
```text
1. Select known backup point.
2. Restore into isolated environment.
3. Run migrations only if required for target release.
4. Run integrity checks.
5. Verify sample student enrollment, attendance, grade, report, invoice, payment, file.
6. Record restore duration and issues.
7. Destroy isolated sensitive environment securely after evidence captured.
```
A backup is not considered proven until restore has been tested.
# 42. Environments and Deployment
## 42.1 Environments
| Environment | Data | Purpose |
| --- | --- | --- |
| local | Synthetic/dev | Developer |
| test | Ephemeral synthetic | Automated tests |
| staging | Synthetic/anonymized | Production-like validation |
| production | Real | Live school |
## 42.2 Production Topology
```text
Internet
  ↓ HTTPS
Reverse Proxy / CDN / WAF where available
  ├── Next.js web process
  └── Django Gunicorn/ASGI process
         ├── PostgreSQL
         ├── Redis
         ├── S3-compatible private storage
         └── Celery workers + Celery Beat

Monitoring/Error Tracking/Backup external to request path
```
## 42.3 Django Deployment Checklist
- [ ] `DEBUG=False`.
- [ ] Unique strong `SECRET_KEY`.
- [ ] `ALLOWED_HOSTS` explicit.
- [ ] Correct `CSRF_TRUSTED_ORIGINS`.
- [ ] Secure proxy SSL header only when reverse proxy is trusted/configured.
- [ ] SESSION_COOKIE_SECURE and CSRF_COOKIE_SECURE under HTTPS.
- [ ] HSTS configured after validation.
- [ ] Run `python manage.py check --deploy`.
- [ ] Use production WSGI/ASGI server, never `runserver`.
- [ ] Static files collected/served through production strategy.
- [ ] Media private storage configured.
- [ ] DB connection credentials least privilege.
- [ ] Email/web-push optional providers validated.
- [ ] Health endpoints checked after deploy.
## 42.4 Release Strategy
- Build immutable version/release identifier.
- Run migrations before/with app version according to backward-compatible migration plan.
- Smoke test login + core read + health.
- Workers run compatible code version.
- Rollback application only if schema remains compatible; destructive migration requires explicit recovery plan.
- Announce planned maintenance for risky data migration.
# 43. CI/CD
## 43.1 Pull Request Pipeline
```text
lint
  ↓
frontend typecheck
  ↓
backend static/lint checks
  ↓
unit tests
  ↓
integration tests (PostgreSQL)
  ↓
migration consistency check
  ↓
build Next.js
  ↓
Django check --deploy with safe CI config
  ↓
security/dependency scan
  ↓
artifact/image build
```
## 43.2 Main/Staging Pipeline
- Deploy staging automatically or by protected action.
- Run DB migration staging.
- Run seed/smoke fixture.
- Run Playwright critical E2E.
- Run API smoke.
- Publish release candidate metadata.
## 43.3 Production Pipeline
- Protected branch/tag.
- Human approval for production deploy.
- Backup freshness check before risky migrations.
- Apply migrations once.
- Deploy web/api/workers.
- Smoke test.
- Monitor error rate/latency after release.
- Record release version and migration list.
# 44. Database Migration Policy
## 44.1 General Rules
- Every model change has committed Django migration.
- No manual production schema mutation outside emergency runbook.
- Migration is reviewed for table locks/data rewrite risk.
- Data migration uses deterministic `RunPython` or explicit management command for large batches.
- Large backfill is resumable and observable.
- Never assume old app and new schema switch atomically across processes.
## 44.2 Expand → Backfill → Switch → Contract
```text
Release A: add nullable/new field/table (backward compatible)
Release B: dual-write/backfill + verify
Release C: switch reads and enforce new constraint
Release D: remove obsolete field only after evidence
```
## 44.3 Dangerous Changes
- Dropping used columns.
- Renaming columns used by running code.
- Adding NOT NULL without default/backfill on large table.
- Changing enum meaning.
- Recomputing historical grades/finance silently.
- Changing money precision.
- Rewriting object storage keys without migration/rollback plan.
# 45. Testing Strategy
## 45.1 Test Pyramid
| Layer | Tool | Purpose |
| --- | --- | --- |
| Python unit | pytest | Pure rules/calculations/utilities |
| Django model/service | pytest-django | Constraints/services/transactions |
| DRF API | APIClient/APIRequestFactory | HTTP validation/auth/permission |
| Frontend unit | Vitest | Utilities/components with meaningful logic |
| Frontend integration | Testing Library | Forms/page behavior |
| E2E | Playwright | Critical user workflows |
| Load | k6 or equivalent | Attendance/result/finance burst |
| Security | Automated permission matrix + manual review | BOLA/privilege/data leakage |
## 45.2 Mandatory Test Classes per Backend Module
- [ ] Model constraints.
- [ ] Service happy path.
- [ ] Service invalid state transition.
- [ ] Permission allow.
- [ ] Permission deny.
- [ ] Object-scope deny.
- [ ] Validation boundaries.
- [ ] Concurrency/idempotency where domain is sensitive.
- [ ] Audit event existence for required actions.
- [ ] API response contract.
- [ ] Filter/pagination scope.
- [ ] Background task retry/idempotency if module has task.
## 45.3 Critical E2E Scenarios
| ID | Scenario |
| --- | --- |
| E2E-01 | Admin creates academic year with exactly three trimestres and valid dates. |
| E2E-02 | Admissions officer opens admission period; applicant submits; document verified; accepted applicant re-registers and becomes student. |
| E2E-03 | TU assigns student to X IPA 1; next year promotion creates XI IPA enrollment while preserving history. |
| E2E-04 | Curriculum assigns subject offering and teacher; scheduler rejects teacher/classroom collision. |
| E2E-05 | Teacher records lesson attendance online; guardian sees child attendance only. |
| E2E-06 | Teacher records attendance offline and later syncs exactly once. |
| E2E-07 | Offline attendance encounters server correction and exposes conflict resolution. |
| E2E-08 | Teacher creates CAU 1 only in Trimestre 1; system rejects CAU/trimestre mismatch. |
| E2E-09 | Teacher enters scores; finalizes term grade; direct change blocked; authorized reopen allows revision with reason. |
| E2E-10 | Homeroom reviews report; publish makes immutable revision visible to student/guardian. |
| E2E-11 | Promotion X IPA → XI IPA creates new enrollment; major change IPA→IPS requires reason/approval. |
| E2E-12 | Grade XII graduation preserves history and national exam record. |
| E2E-13 | Monthly SPP generation twice creates one invoice per student/month. |
| E2E-14 | Cash payment partially allocates invoice; second payment closes invoice. |
| E2E-15 | Bank transfer remains pending until Finance verifies. |
| E2E-16 | Payment reversal restores invoice balance and preserves original receipt/history. |
| E2E-17 | Guardian cannot access another child by changing UUID. |
| E2E-18 | Teacher cannot access score sheet for unassigned class. |
| E2E-19 | BK case notes inaccessible to normal teacher. |
| E2E-20 | Library copy cannot be checked out twice concurrently. |
| E2E-21 | Import invalid rows shows preview/errors and writes nothing before confirm. |
| E2E-22 | Large report executes background and provides signed/authorized download. |
| E2E-23 | Disabled account loses access immediately on new request/session policy. |
| E2E-24 | Production-like restore fixture passes integrity check command. |
## 45.4 Money Tests
- [ ] Always Decimal; test 0.01 precision.
- [ ] Negative invoice/payment rejected unless explicit reversal record.
- [ ] Partial allocation sum exactly updates balances.
- [ ] Allocation cannot exceed payment unallocated amount.
- [ ] Allocation cannot exceed invoice outstanding.
- [ ] Concurrent verify/payment cannot overpay.
- [ ] Reversal exactly negates original allocations.
- [ ] Report totals equal canonical transactions for fixture.
## 45.5 Academic Tests
- [ ] AcademicYear can contain exactly Trimestre number 1,2,3 before activation/close policy.
- [ ] Trimester dates inside AcademicYear and non-overlapping.
- [ ] CAU number must equal trimester number.
- [ ] Student score belongs to student enrolled in assignment classroom/year.
- [ ] Score cannot exceed max_score.
- [ ] Grading scheme component sum must be 100 before ACTIVE.
- [ ] Final grade calculation deterministic and rounded by one documented rule.
- [ ] Finalized TermGrade immutable except reopen workflow.
- [ ] Published ReportCard snapshot does not change when later source record changes until explicit revision.
- [ ] Promotion cannot create two active enrollments same year.
# 46. API Contract Standards
## 46.1 Base
```text
Base URL: /api/v1/
Content-Type: application/json
Dates: YYYY-MM-DD
Datetimes: ISO-8601 UTC with offset/Z
Money/decimal: JSON string, e.g. "25.00"
IDs: UUID strings
```
## 46.2 Success Shapes
```json
// detail
{
  "data": { ... }
}

// list
{
  "data": [ ... ],
  "meta": {
    "next_cursor": null,
    "previous_cursor": null,
    "count": 120
  }
}

// async job
{
  "data": {
    "job_id": "...",
    "status": "QUEUED"
  }
}
```
## 46.3 Error Shape
```json
{
  "error": {
    "code": "ATTENDANCE_VERSION_CONFLICT",
    "message": "Data absensi telah berubah di server.",
    "fields": {
      "status": ["..."]
    },
    "request_id": "...",
    "details": {}
  }
}
```
## 46.4 HTTP Status Policy
| Status | Use |
| --- | --- |
| 200 | Read/update/action success |
| 201 | Resource created |
| 202 | Background job accepted |
| 204 | No-content action |
| 400 | Malformed/business validation |
| 401 | Not authenticated |
| 403 | Authenticated but forbidden |
| 404 | Not found/inaccessible according to object policy |
| 409 | Version/state/idempotency conflict |
| 422 | Optional semantic validation only if consistently adopted; default project may use 400 |
| 429 | Rate limited |
| 500 | Unexpected server error |
| 503 | Dependency unavailable/readiness failure |
## 46.5 Filtering
- Canonical query parameters use snake_case.
- Unknown filter can be rejected rather than silently ignored for critical endpoints.
- Date range uses `date_from`, `date_to`.
- Academic filters use `academic_year_id`, `trimester_id`, `grade_level_id`, `major_id`, `classroom_id`.
- Search is bounded and indexed appropriately.
- Ordering fields allowlist; never arbitrary raw DB expression.
## 46.6 Optimistic Concurrency
- Resources prone to offline/concurrent edit expose `version`.
- Write request supplies expected_version/body or `If-Match` if implemented consistently.
- Server updates with version guard.
- Mismatch returns 409 with safe latest representation metadata.
- Finance uses transactional locks/idempotency rather than relying only on optimistic version.
## 46.7 Idempotency
- Client supplies `Idempotency-Key` for payment creation and other retryable commands where specified.
- Server persists key + actor + endpoint + normalized request hash + result reference.
- Same key + same payload returns original logical result.
- Same key + different payload returns 409.
- Keys have retention long enough to cover realistic retries; finance keys retained according to transaction audit policy.
- Offline attendance separately uses mutation_id receipt semantics.
# 47. Canonical API Endpoint Catalog
| Domain | Method | Endpoint | Permission | Purpose |
| --- | --- | --- | --- | --- |
| Auth | POST | /auth/login/ | Public | Login + CSRF/session flow |
| Auth | POST | /auth/logout/ | Authenticated | Logout |
| Auth | POST | /auth/password-reset/request/ | Public throttled | Request reset |
| Auth | POST | /auth/password-reset/confirm/ | Public token | Reset |
| Auth | GET | /auth/me/ | Authenticated | Current user/roles/capabilities |
| School | GET | /school/profile/ | Authenticated | School profile |
| School | PATCH | /school/profile/ | school.manage | Update config |
| Academic | GET | /academic-years/ | academic.read | List years |
| Academic | POST | /academic-years/ | academic.manage | Create year |
| Academic | POST | /academic-years/{id}/activate/ | academic.manage | Activate |
| Academic | POST | /academic-years/{id}/close/ | academic.manage | Close |
| Academic | GET | /trimestres/ | academic.read | List/filter |
| Academic | POST | /trimestres/ | academic.manage | Create |
| Academic | GET | /majors/ | academic.read | IPA/IPS |
| Academic | GET | /grade-levels/ | academic.read | X/XI/XII |
| Academic | GET | /subjects/ | academic.read | Subjects |
| Academic | POST | /subjects/ | academic.manage | Create subject |
| Academic | GET | /subject-offerings/ | academic.read | Offerings |
| Academic | POST | /subject-offerings/ | academic.manage | Create offering |
| Academic | GET | /classrooms/ | class.read | Class list |
| Academic | POST | /classrooms/ | class.manage | Create rombel |
| Academic | POST | /teaching-assignments/ | teaching.manage | Assign teacher |
| Admissions | GET | /admissions/periods/ | admission.read | Periods |
| Admissions | POST | /admissions/periods/ | admission.manage | Create period |
| Admissions | POST | /admissions/applicants/ | Public/admission create | Applicant registration |
| Admissions | GET | /admissions/applicants/{id}/ | admission.read or applicant token | Detail |
| Admissions | POST | /admissions/applicants/{id}/submit/ | Applicant | Submit |
| Admissions | POST | /admissions/applicants/{id}/verify/ | admission.verify | Verify |
| Admissions | POST | /admissions/applicants/{id}/decision/ | admission.decide | Decision |
| Admissions | POST | /admissions/applicants/{id}/re-register/ | admission.enroll | Daftar ulang |
| Admissions | POST | /admissions/applicants/{id}/enroll/ | admission.enroll | Create Student transactionally |
| Students | GET | /students/ | student.read | Scoped list |
| Students | POST | /students/ | student.create | Manual create |
| Students | GET | /students/{id}/ | student.read scoped | Detail |
| Students | PATCH | /students/{id}/ | student.update scoped | Update profile |
| Students | GET | /students/{id}/enrollments/ | student.read scoped | History |
| Students | POST | /students/{id}/transfer/ | student.transfer | Transfer |
| Students | POST | /students/{id}/guardians/ | student.guardian.manage | Link guardian |
| Students | GET | /guardians/{id}/children/ | guardian self/admin | Linked children |
| Schedules | GET | /schedules/ | schedule.read | Filtered schedule |
| Schedules | POST | /schedules/ | schedule.manage | Create entry |
| Schedules | PATCH | /schedules/{id}/ | schedule.manage | Update collision checked |
| Schedules | POST | /schedules/{id}/exceptions/ | schedule.manage | Exception/substitution |
| Schedules | POST | /schedules/validate/ | schedule.manage | Dry-run collision |
| Attendance | POST | /attendance/sessions/ | attendance.record scoped | Open session |
| Attendance | GET | /attendance/sessions/{id}/ | attendance.read scoped | Session |
| Attendance | PUT | /attendance/sessions/{id}/records/ | attendance.record scoped | Bulk upsert |
| Attendance | POST | /attendance/sessions/{id}/submit/ | attendance.record scoped | Submit |
| Attendance | POST | /attendance/records/{id}/correct/ | attendance.correct | Correction |
| Attendance | POST | /attendance/offline/sync/ | attendance.record scoped | Idempotent offline sync |
| Attendance | GET | /attendance/student/{student_id}/summary/ | attendance.read scoped | Summary |
| Attendance | POST | /leave-requests/ | student/guardian or staff | Request leave |
| Attendance | POST | /leave-requests/{id}/review/ | attendance.leave.review | Approve/reject |
| Grades | GET | /assessments/ | grade.read | Assessments |
| Grades | POST | /assessments/ | grade.write scoped | Create assessment |
| Grades | PUT | /assessments/{id}/scores/ | grade.write scoped | Bulk scores |
| Grades | POST | /assessments/{id}/lock/ | grade.finalize scoped | Lock assessment |
| Grades | GET | /gradebook/ | grade.read scoped | Gradebook |
| Grades | POST | /term-grades/calculate/ | grade.write scoped | Calculate preview |
| Grades | POST | /term-grades/finalize/ | grade.finalize scoped | Finalize |
| Grades | POST | /term-grades/{id}/reopen/ | grade.reopen | Reopen |
| Report | POST | /report-cards/generate/ | report.generate | Generate draft/job |
| Report | POST | /report-cards/{id}/review/ | report.review | Review |
| Report | POST | /report-cards/{id}/publish/ | report.publish | Publish |
| Report | POST | /report-cards/{id}/reopen/ | report.reopen | Revision |
| Report | GET | /report-cards/{id}/download/ | report.read scoped | PDF |
| Report | GET | /students/{id}/transcript/ | report.read scoped | Transcript |
| Report | POST | /promotions/preview/ | promotion.manage | Preview |
| Report | POST | /promotions/execute/ | promotion.manage | Transactional execute |
| NationalExam | GET | /national-exams/ | national_exam.read | List |
| NationalExam | POST | /national-exams/ | national_exam.manage | Create/update record |
| NationalExam | POST | /national-exams/import/ | national_exam.manage | Validated import |
| Finance | GET | /finance/fee-types/ | finance.read | Fee type |
| Finance | POST | /finance/fee-plans/ | finance.manage | Fee plan |
| Finance | POST | /finance/invoices/generate-preview/ | finance.invoice.generate | Dry run |
| Finance | POST | /finance/invoices/generate/ | finance.invoice.generate | Async generation |
| Finance | GET | /finance/invoices/ | finance.read scoped | Invoices |
| Finance | GET | /finance/invoices/{id}/ | finance.read scoped | Detail |
| Finance | POST | /finance/invoices/{id}/void/ | finance.invoice.void | Void eligible |
| Finance | POST | /finance/payments/ | finance.payment.create | Payment idempotent |
| Finance | POST | /finance/payments/{id}/verify/ | finance.payment.verify | Verify bank |
| Finance | POST | /finance/payments/{id}/reverse/ | finance.payment.reverse | Reverse |
| Finance | GET | /finance/receipts/{id}/ | finance.read scoped | Receipt |
| Counseling | GET | /counseling/cases/ | counseling.read restricted | Cases |
| Counseling | POST | /counseling/cases/ | counseling.write | Create |
| Counseling | POST | /counseling/cases/{id}/follow-ups/ | counseling.write scoped | Follow-up |
| Discipline | POST | /discipline/incidents/ | discipline.create | Report |
| Discipline | GET | /discipline/incidents/ | discipline.read scoped | List |
| Extracurricular | GET | /extracurricular/activities/ | extracurricular.read | List |
| Extracurricular | POST | /extracurricular/activities/ | extracurricular.manage | Create |
| Extracurricular | POST | /extracurricular/activities/{id}/members/ | extracurricular.manage scoped | Membership |
| Extracurricular | POST | /extracurricular/activities/{id}/attendance/ | extracurricular.attendance | Attendance |
| Library | GET | /library/books/ | library.read | Catalog |
| Library | POST | /library/books/ | library.manage | Create book |
| Library | POST | /library/copies/ | library.manage | Register copy |
| Library | POST | /library/loans/ | library.checkout | Checkout |
| Library | POST | /library/loans/{id}/return/ | library.return | Return |
| Library | POST | /library/loans/{id}/renew/ | library.renew | Renew |
| Assets | GET | /assets/ | asset.read | Register |
| Assets | POST | /assets/ | asset.manage | Create asset |
| Assets | POST | /assets/{id}/assign/ | asset.manage | Assign |
| Assets | POST | /assets/{id}/maintenance/ | asset.manage | Maintenance |
| Assets | POST | /assets/{id}/retire/ | asset.manage | Retire |
| Communication | GET | /announcements/ | announcement.read | Scoped list |
| Communication | POST | /announcements/ | announcement.manage | Create |
| Communication | POST | /announcements/{id}/publish/ | announcement.publish | Publish |
| Communication | GET | /notifications/ | notification.self | Inbox |
| Communication | POST | /notifications/{id}/read/ | notification.self | Mark read |
| Communication | POST | /push-subscriptions/ | notification.self | Register device |
| Communication | DELETE | /push-subscriptions/{id}/ | notification.self | Revoke |
| Files | POST | /files/upload-init/ | file.upload scoped | Presign/init |
| Files | POST | /files/upload-complete/ | file.upload scoped | Finalize |
| Files | GET | /files/{id}/download/ | file.read scoped | Authorized download |
| Import | POST | /imports/ | import.manage | Upload/parse |
| Import | GET | /imports/{id}/preview/ | import.manage | Preview |
| Import | POST | /imports/{id}/confirm/ | import.manage | Execute |
| Import | GET | /imports/{id}/result/ | import.manage | Result |
| Reports | POST | /reports/{code}/jobs/ | report.run scoped | Create job |
| Reports | GET | /report-jobs/{id}/ | report.run scoped | Status |
| Reports | GET | /report-jobs/{id}/download/ | report.run scoped | Artifact |
| Audit | GET | /audit-logs/ | audit.read restricted | Read-only |
| System | GET | /health/live | Public/internal | Liveness |
| System | GET | /health/ready | Infra | Readiness |
# 48. Stable Error Code Catalog
| Code | Meaning |
| --- | --- |
| AUTH_INVALID_CREDENTIALS | Login rejected |
| AUTH_ACCOUNT_INACTIVE | Inactive account |
| AUTH_CSRF_FAILED | CSRF validation |
| AUTH_RATE_LIMITED | Too many attempts |
| PERMISSION_DENIED | Global permission denied |
| OBJECT_SCOPE_DENIED | Object outside actor scope |
| RESOURCE_NOT_FOUND | Not found |
| VALIDATION_ERROR | Generic field validation |
| ACADEMIC_YEAR_INVALID_RANGE | Invalid year dates |
| TRIMESTER_INVALID_RANGE | Invalid period |
| TRIMESTER_COUNT_INVALID | Not exactly required periods |
| CAU_TRIMESTER_MISMATCH | CAU number != trimestre number |
| ENROLLMENT_DUPLICATE_ACTIVE | Active enrollment collision |
| ENROLLMENT_CLASS_MISMATCH | Grade/major/year mismatch |
| MAJOR_CHANGE_REASON_REQUIRED | IPA/IPS change needs reason |
| SCHEDULE_TEACHER_CONFLICT | Teacher double-booked |
| SCHEDULE_CLASS_CONFLICT | Class double-booked |
| SCHEDULE_ROOM_CONFLICT | Room double-booked |
| ATTENDANCE_STUDENT_NOT_ENROLLED | Student not valid in class |
| ATTENDANCE_SESSION_LOCKED | Locked session |
| ATTENDANCE_VERSION_CONFLICT | Optimistic conflict |
| OFFLINE_MUTATION_REPLAY_MISMATCH | Mutation ID payload mismatch |
| ASSESSMENT_SCORE_OUT_OF_RANGE | Invalid score |
| ASSESSMENT_LOCKED | Locked |
| GRADING_WEIGHT_INVALID | Weights not 100 |
| TERM_GRADE_FINALIZED | Final grade immutable |
| TERM_GRADE_REOPEN_REASON_REQUIRED | Reason missing |
| REPORT_NOT_READY | Missing final grades/data |
| REPORT_ALREADY_PUBLISHED | Published immutable |
| PROMOTION_INVALID_STATE | Cannot promote |
| INVOICE_DUPLICATE_GENERATION | Generation key exists |
| INVOICE_ALREADY_SETTLED | No outstanding |
| INVOICE_VOID_NOT_ALLOWED | Cannot void |
| PAYMENT_AMOUNT_INVALID | Invalid amount |
| PAYMENT_OVERALLOCATION | Allocation exceeds bounds |
| PAYMENT_IDEMPOTENCY_CONFLICT | Key reused with different payload |
| PAYMENT_ALREADY_REVERSED | Duplicate reversal |
| FILE_TYPE_NOT_ALLOWED | Upload type |
| FILE_TOO_LARGE | Upload size |
| FILE_NOT_AUTHORIZED | File scope |
| IMPORT_TEMPLATE_INVALID | Wrong columns/version |
| IMPORT_HAS_ERRORS | Preview contains errors |
| IMPORT_ALREADY_CONFIRMED | Cannot confirm twice |
| LIBRARY_COPY_UNAVAILABLE | Cannot checkout |
| LIBRARY_LOAN_ALREADY_CLOSED | Already returned/lost |
| ASSET_NOT_AVAILABLE | Cannot assign |
| JOB_ALREADY_RUNNING | Duplicate user job |
| JOB_FAILED | Async job failed |
| DEPENDENCY_UNAVAILABLE | External infra unavailable |
# 49. Domain Event Catalog
| Event | Meaning |
| --- | --- |
| admission.applicant_submitted | Applicant submitted |
| admission.applicant_verified | Verification complete |
| admission.decision_published | Result publish |
| admission.student_enrolled | Applicant converted |
| student.created | Student created |
| student.status_changed | Lifecycle status |
| student.transferred | Transfer/major/class event |
| student.promoted | Year promotion |
| student.graduated | Graduation |
| schedule.changed | Published schedule affected |
| attendance.session_submitted | Session submitted |
| attendance.record_corrected | Correction |
| attendance.absent | Absent notification candidate |
| attendance.late | Late notification candidate |
| assessment.created | Assessment |
| score.revised | Score revision |
| term_grade.finalized | Final grade |
| term_grade.reopened | Grade reopen |
| report_card.published | Report available |
| report_card.reopened | Revision |
| national_exam.updated | Official record updated |
| finance.invoice.created | Student charge |
| finance.invoice.overdue | Due |
| finance.payment.created | Payment intake |
| finance.payment.verified | Payment canonical |
| finance.payment.reversed | Reversal |
| finance.receipt.generated | Receipt ready |
| counseling.case_opened | Restricted case |
| discipline.incident_created | Incident |
| library.loan_overdue | Overdue |
| asset.status_changed | Asset lifecycle |
| announcement.published | Communication |
Events inside the modular monolith are explicit service-level events or after-commit hooks. They are not a promise of Kafka/event sourcing. Critical state remains PostgreSQL source of truth.
# 50. Technical Challenges — Failure Modes and Exact Solutions
| Challenge | Failure Mode | Required Solution |
| --- | --- | --- |
| Historical enrollment overwritten | Student moves X→XI→XII and old class disappears | Model yearly StudentEnrollment; close old enrollment; never update old row into next grade; promotion creates new row; unique active/year constraint; history E2E. |
| IPA/IPS transfer corrupts history | Major field edited in-place | Major belongs to each enrollment; internal major transfer creates audited transfer + enrollment update only for effective current placement according to rule; previous-year enrollment immutable. |
| Three-trimestre inconsistency | Developer assumes a different academic-period model or creates 4 terms | Seed/validation allows number 1,2,3 only; activation checks exactly three periods and non-overlap; terminology tests forbid alternate academic-period code. |
| CAU mismatch | CAU 2 recorded in Trimestre 1 | Assessment CAU requires cau_number and DB/service validation `cau_number == trimester.number`; UI derives label from trimester. |
| Schedule race/conflict | Two admins create overlapping entries concurrently | Service validates overlaps inside transaction; add exclusion/unique constraint where representation permits; recheck on commit path; conflict returns stable code. |
| Unauthorized student access (BOLA) | User changes UUID in URL | Scoped queryset + object permission + serializer relationship validation; automated cross-user tests for every sensitive detail endpoint. |
| Teacher edits another class | Frontend hides menu but API accepts | TeachingAssignment-derived scope on server; write service receives actor and verifies active assignment/year/class. |
| Guardian sees wrong child | Relationship not checked | StudentGuardian active relationship required for every guardian student/attendance/grade/finance query; child-switcher data comes from same scoped selector. |
| Counseling privacy leak | Generic student serializer embeds notes | Never embed counseling relation in generic Student serializer; dedicated restricted endpoints; PII/error/log scrubbing; access audit. |
| Score changed after finalization | Direct PATCH remains open | No generic update endpoint for finalized TermGrade; command `reopen(reason)` then recalculate/finalize; ScoreRevision + AuditLog. |
| Published report changes retroactively | Report renders live TermGrade | ReportCardSubject and attendance summary snapshot at generation/publish; revision creates new report revision/PDF. |
| Rounding differs frontend/backend | JS computes grade | Only backend calculates authoritative grade using Decimal and one rounding policy; frontend only previews with server response. |
| Monthly SPP duplicates | Celery retries generation | Deterministic generation_key + unique constraint + idempotent get/create transaction; task reports skipped existing. |
| Payment duplicates on retry | User double-click/network retry | Required Idempotency-Key + request hash + unique persistence; payment transaction locks invoice/allocations. |
| Payment overallocates | Concurrent cashiers pay same invoice | `select_for_update` invoice/payment rows + recompute outstanding within atomic transaction + constraints; reject excess. |
| Payment incorrectly deleted | Admin removes bad transaction | No hard delete; reversal references original, mandatory reason, inverse allocations, audit. |
| Bank proof treated as payment | Upload automatically closes invoice | Uploaded proof creates PENDING payment only; Finance verify action is authority. |
| Money precision | float 0.1 artifacts | Django DecimalField + Python Decimal + decimal strings over JSON + DB precision tests. |
| Offline attendance duplicate | Mutation retries after unknown response | Client UUID mutation_id + server OfflineMutationReceipt unique user+mutation; duplicate returns previous result. |
| Offline overwrites correction | Last-write-wins | Version/base_version conflict; 409 CONFLICT; UI resolves explicitly; privileged correction is preserved until resolved. |
| Service worker serves stale finance | Broad API cache | Allowlisted caching only; finance/grade publish/auth/file routes Network Only; service worker tests. |
| PWA browser background sync unsupported | Reliance on Background Sync | Primary sync on app open/focus/online + manual retry; Background Sync enhancement only. |
| IndexedDB leaks previous user data | Shared device login | Namespace by authenticated user/device; clear scoped stores on logout/account switch; no auth token in IndexedDB. |
| Bulk import corrupts DB | Upload directly inserts | Parse→validate→preview→confirm→queued chunks; stable identity rule; errors recorded; no write before confirm. |
| Excel formula injection | Export data starts =,+,-,@ | Escape/prefix risky text cells in CSV/XLSX according to export helper policy; tests. |
| N+1 query | Student list serializes guardians/enrollments lazily | Selectors with select_related/prefetch; profiling/query-count tests on critical lists. |
| Report generation times out | PDF built in API request | Create ReportJob; Celery reports queue; store result; API 202; worker resource limits. |
| Celery sees uncommitted row | Task sent inside atomic block | Enqueue with transaction.on_commit / delay_on_commit; task re-reads by ID. |
| Notification duplicates | Worker crashes after provider accepted | Notification dedup_key + delivery state/provider message ID when possible; idempotent retry. |
| External provider outage | Core waits on email/storage optional integration | After-commit async for notifications; bounded timeouts; circuit/backoff; core transaction not dependent except required file storage operation. |
| Scraper breaks after HTML change | Core importer calls CSS selector directly | Provider adapter under integrations; normalized internal DTO; fixture parser tests; failure disables integration not core SIS. |
| Production migration downtime | Large schema rewrite | Expand/backfill/switch/contract; staging data-volume rehearsal; lock-risk review; maintenance window if unavoidable. |
| Backup exists but unusable | No restore test | Quarterly restore drill to isolated env + integrity checks + record RTO. |
| Secrets leak | `.env` committed/logged | Gitignore + secret scanning + secret manager/env + rotate runbook + log redaction. |
| Audit table contains too much PII | Full before/after dumps | Per-event safe field whitelist/masking; sensitive narrative excluded unless required; retention controls. |
| Soft-delete everywhere causes uniqueness/query bugs | Generic deleted_at applied universally | Use lifecycle states by domain; hard delete only draft/unreferenced data; reversal/void for finance; append history for academic. |
| Timezone bug around day boundary | Naive datetime/local DB values | USE_TZ True; store UTC timestamp; school-local date calculation using Asia/Dili; date-specific tests. |
| Academic close occurs too early | Trimestre closed with missing grades | Readiness check shows missing CAU/term grades/report states; close requires explicit override permission+reason if policy allows. |
| Promotion executed twice | Double click/retry | Promotion batch idempotency + one decision per student/year + target enrollment unique constraint + preview/execute. |
| Library copy double loan | Two librarian checkouts | Atomic select_for_update copy + single open-loan invariant. |
| Asset assigned twice | Open assignments overlap | One active assignment constraint/service lock. |
| Disabled user has long-lived portal state | Frontend assumes cached permissions | Backend checks active session user on every request; auth/me refresh on focus/reload; sensitive pages fail closed. |
| PDF mismatch with data | Async report reads changed records | For finalized report, worker renders from ReportCard snapshot/revision, not live mutable grade source. |
| Noisy logs hide incident | Unstructured console prints | Structured event codes/request IDs; alert on 5xx/finance job failures; PII scrub. |
| Cheap AI agent invents schema/status | No execution guardrail | This PRD provides canonical models/enums/API; agent instruction requires search PRD before adding status/table; schema diff review and ADR for deviations. |
# 51. External Integrations and Scraping
## 51.1 Integration Policy
```text
Official authenticated API
  ↓ preferred
Official file export/import
  ↓
School-provided CSV/XLSX
  ↓
Public institutional webpage adapter
  ↓ last resort
Scraping
```
- No unofficial write-back to government systems.
- No scraping private/authenticated student government data without explicit authorization and legal/technical contract.
- External data is imported through staging/validation and never blindly overwrites canonical student finance/grades.
- Every provider has timeout, retry policy, normalization and provenance fields.
- Integration is optional: failure must not prevent normal local academic operation.
## 51.2 Adapter Contract
```python
class ExternalProvider:
    def fetch(...): ...
    def normalize(raw) -> InternalDTO: ...
    def validate(dto) -> ValidationResult: ...
    def provenance() -> ProviderMetadata: ...
```
## 51.3 Scraper Requirements
- Respect robots/terms/access policy where applicable.
- Use conservative rate limits and caching.
- Identify data source and fetched_at.
- Parser test uses saved legal fixture/sample to detect HTML changes.
- Selector failure produces explicit integration error, not empty-success import.
- Do not scrape student/guardian/financial/health/grade personal data.
- Never require scraper availability for login, attendance, grades or finance.
# 52. Local Development — Lightweight Laptop Profile
## 52.1 Always Running
```text
Terminal 1: PostgreSQL local/service
Terminal 2: python manage.py runserver
Terminal 3: pnpm dev
```
## 52.2 Optional When Needed
```text
Redis
Celery worker
Celery beat
```
- When Redis/Celery off locally, synchronous dev fallbacks may be permitted only behind `DEV_SYNC_TASKS=true`, never production.
- PDF/email/push provider can use local console/mock backend.
- Object storage uses local filesystem dev backend behind storage abstraction.
- No Kubernetes, Kafka, Elasticsearch, MinIO, Prometheus/Grafana required on developer laptop.
- Use Docker only if developer prefers; project must not require running a large compose stack for normal CRUD work.
## 52.3 Recommended Commands
```bash
# backend
python -m venv .venv
pip install -r requirements/dev.txt
python manage.py migrate
python manage.py seed_reference_data
python manage.py seed_demo_school
python manage.py runserver

# frontend
corepack enable
pnpm install
pnpm dev

# tests
pytest
pnpm test
pnpm exec playwright test
```
# 53. Seed Data and Management Commands
## 53.1 Immutable/Reference Seeds
- GradeLevel: X, XI, XII.
- Major: IPA, IPS.
- Trimester number logic 1–3 is code/business invariant; actual date rows created per year.
- AssessmentType canonical codes.
- Attendance status choices.
- Default roles and permissions.
- Document type defaults.
- Fee types are school-configurable; do not seed dollar amount.
## 53.2 Required Management Commands
| Command | Purpose |
| --- | --- |
| seed_reference_data | Idempotently seed enums/reference rows |
| seed_demo_school | Synthetic demo users/classes/data for local only |
| create_academic_year | Wizard/validated CLI optional |
| check_data_integrity | Run invariants and exit nonzero on critical |
| rebuild_report_artifact | Re-render specific finalized snapshot |
| requeue_failed_job | Controlled retry |
| expire_sessions | Operational cleanup if needed |
| cleanup_temp_uploads | Remove unattached expired objects |
| generate_spp | Privileged/manual monthly generation with dry-run |
| backup_metadata_check | Check backup freshness integration |
| anonymize_database | Create staging/dev-safe copy when authorized |
# 54. Automated Data Integrity Checks
- [ ] `INT-001` Exactly one current SchoolProfile.
- [ ] `INT-002` At most one current AcademicYear.
- [ ] `INT-003` Active AcademicYear has exactly Trimestre numbers 1,2,3.
- [ ] `INT-004` Each Trimestre cau_number equals number and date inside year.
- [ ] `INT-005` No student has >1 ACTIVE enrollment in same year.
- [ ] `INT-006` Enrollment classroom grade/major/year matches enrollment fields.
- [ ] `INT-007` No classroom has duplicate code in same year.
- [ ] `INT-008` No active schedule teacher/class/room collisions.
- [ ] `INT-009` Attendance student belongs to session classroom enrollment for applicable date/year.
- [ ] `INT-010` No duplicate attendance record session+student.
- [ ] `INT-011` No CAU assessment with mismatched trimester/cau_number.
- [ ] `INT-012` Active grading scheme component weights total exactly 100.
- [ ] `INT-013` No score outside 0..max_score.
- [ ] `INT-014` No finalized TermGrade missing final_score.
- [ ] `INT-015` Published ReportCard has all expected subject snapshot rows and publish metadata.
- [ ] `INT-016` Promotion decision target enrollment does not duplicate active enrollment.
- [ ] `INT-017` Invoice amount = sum items adjusted by documented discount logic.
- [ ] `INT-018` Invoice paid amount = valid non-reversed allocations.
- [ ] `INT-019` No invoice balance below zero.
- [ ] `INT-020` Payment allocations do not exceed payment amount.
- [ ] `INT-021` Reversed payment not counted in collection totals.
- [ ] `INT-022` One open library loan per copy maximum.
- [ ] `INT-023` One active asset assignment maximum.
- [ ] `INT-024` StoredFile domain references point to existing storage object for sampled/critical verification.
- [ ] `INT-025` No active user role references inactive/deleted user.
- [ ] `INT-026` No orphan generated report job marked completed without file.
# 55. Role Capability Matrix
## 55.1 SUPER_ADMIN
- school.manage_settings
- user.create/update/disable
- role.manage
- audit.view
- system.import/export/jobs
- emergency operational administration
## 55.2 SCHOOL_ADMIN
- school.view
- user/staff/student/guardian administration
- academic master operational data
- schedule view
- attendance view/correction per policy
- document
- reports/import/export
## 55.3 PRINCIPAL
- school.view
- dashboard/report all operational domains
- report.publish/reopen where policy
- promotion approval
- finance.view aggregate
- audit.view selected
- no routine payment mutation by default
## 55.4 CURRICULUM_ADMIN
- academic year/trimestre/subject/class
- teaching assignments
- schedule
- assessment configuration
- grade completion
- grade reopen/finalization approval
- report readiness/publish according to school policy
- promotion workflow
## 55.5 FINANCE_ADMIN
- fee plan
- invoice generation/void
- receive/verify/reverse payment
- receipt
- finance reports/export
- read minimal student identity needed for billing
## 55.6 ADMISSION_OFFICER
- admission period
- applicant/document verify
- decision according to delegation
- re-registration/enrollment
- no grades/finance except admission fee if separately granted
## 55.7 TEACHER
- own schedule
- assigned students
- assigned attendance
- own assessment/score
- announcements own class if allowed
- student basic profile limited
## 55.8 HOMEROOM_TEACHER
- TEACHER + homeroom class overview
- attendance summary
- report review/note
- guardian contact allowed fields
- promotion recommendation if configured
## 55.9 COUNSELOR
- student identity required for counseling
- counseling cases/follow-ups
- discipline scoped
- restricted reports
## 55.10 LIBRARIAN
- catalog/copies/loans/returns/overdue
- minimal borrower identity
## 55.11 ASSET_OFFICER
- asset register/assignment/maintenance
- minimal assignee identity
## 55.12 STAFF
- explicit delegated operational permissions only
## 55.13 STUDENT
- self profile
- self schedule
- self attendance
- published grades/report
- self finance
- library own loans
- announcements/notifications
## 55.14 GUARDIAN
- linked children profile summary
- child schedule/attendance
- published report
- child invoices/payments
- announcements/notifications
**Deny by default.** A capability not explicitly granted by role/permission configuration is forbidden. Multi-role users receive union of global permissions, but object-scope filters still apply.
# 56. Model-by-Model Implementation Contract
Bagian ini wajib digunakan ketika membuat migration/model/API. Untuk setiap model dalam catalog, implementor harus menyelesaikan checklist berikut, bukan hanya membuat tabel.
## school.SchoolProfile
**Purpose:** Singleton profil dan konfigurasi identitas sekolah
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK; one active singleton |
| name | varchar(200) | yes | official school name |
| code | varchar(50) | no | internal code |
| address | text | no | school address |
| municipality | varchar(100) | no | Timor-Leste municipality |
| phone | varchar(50) | no | official contact |
| email | email | no | official contact |
| timezone | varchar(64) | yes | default Asia/Dili |
| currency | char(3) | yes | default USD |
| default_locale | varchar(10) | yes | tet/pt/id |
| logo_file_id | FK StoredFile | no | school logo |
### Database invariants
- Aplikasi memastikan satu profile
- Timezone must be valid IANA zone
- Currency default USD
### Index plan
- Evaluate/implement index for `name` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/school/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## academics.AcademicYear
**Purpose:** Tahun ajaran
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| name | varchar(30) | yes | human label |
| start_date | date | yes | start |
| end_date | date | yes | end |
| status | enum | yes | DRAFT/ACTIVE/CLOSED |
| is_current | bool | yes | at most one true |
### Database invariants
- start_date < end_date
- Only one current/active year unless transition explicitly managed
### Index plan
- Evaluate/implement index for `status` based on actual Django field names and query plan.
- Evaluate/implement index for `start_date` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/academics/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## academics.Trimester
**Purpose:** Exactly three academic periods per year
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes | parent |
| number | smallint | yes | 1,2,3 |
| name | varchar(50) | yes | Trimestre 1/2/3 |
| start_date | date | yes | inside academic year |
| end_date | date | yes | inside academic year |
| grade_entry_start | datetime | no | input window |
| grade_entry_end | datetime | no | input window |
| status | enum | yes | DRAFT/ACTIVE/GRADING/CLOSED |
| cau_number | smallint | yes | must equal number |
### Database invariants
- Unique academic_year+number
- number in 1..3
- cau_number = number
- date ranges do not overlap
- dates within academic year
### Index plan
- Evaluate/implement index for `academic_year_id,number` based on actual Django field names and query plan.
- Evaluate/implement index for `status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/academics/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## academics.GradeLevel
**Purpose:** Class grade master
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| code | varchar(4) | yes | X/XI/XII |
| sequence | smallint | yes | 10/11/12 |
| active | bool | yes | default true |
### Database invariants
- Unique code
- Seed only X, XI, XII for this product
### Index plan
- Evaluate/implement index for `sequence` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/academics/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## academics.Major
**Purpose:** Jurusan master
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| code | varchar(10) | yes | IPA/IPS |
| name | varchar(100) | yes | display label |
| active | bool | yes | default true |
### Database invariants
- Unique code
- Seed IPA and IPS
### Index plan
- Evaluate/implement index for `code` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/academics/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## academics.Room
**Purpose:** Physical room
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| code | varchar(50) | yes | unique |
| name | varchar(100) | yes | display |
| capacity | integer | no | nonnegative |
| room_type | enum | yes | CLASSROOM/LAB/LIBRARY/HALL/OTHER |
| active | bool | yes | default true |
### Database invariants
- Unique code
- capacity >= 0
### Index plan
- Evaluate/implement index for `active` based on actual Django field names and query plan.
- Evaluate/implement index for `room_type` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/academics/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## academics.BellPeriod
**Purpose:** School lesson time slot
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| name | varchar(50) | yes | Jam 1 etc |
| sequence | smallint | yes | ordering |
| start_time | time | yes | local school time |
| end_time | time | yes | local school time |
| active | bool | yes | default true |
### Database invariants
- start_time < end_time
- Unique active sequence
### Index plan
- Evaluate/implement index for `sequence` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/academics/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## academics.SchoolCalendarEvent
**Purpose:** Holiday/event/exam/deadline calendar record
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes | year |
| trimester_id | FK Trimester | no | term if relevant |
| event_type | enum | yes | HOLIDAY/EXAM/EVENT/DEADLINE/OTHER |
| title | varchar(200) | yes | display |
| start_at | datetime/date | yes | start |
| end_at | datetime/date | yes | end |
| affects_classes | bool | yes | schedule impact |
| notes | text | no | internal |
### Database invariants
- end >= start
### Index plan
- Evaluate/implement index for `academic_year_id,event_type` based on actual Django field names and query plan.
- Evaluate/implement index for `start_at` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/academics/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## accounts.User
**Purpose:** Authentication principal
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK; custom user from first migration |
| username | varchar | yes | normalized unique |
| email | email | no | unique when provided if policy says |
| is_active | bool | yes | auth status |
| is_staff | bool | yes | Django admin only |
| preferred_locale | varchar(10) | no | tet/pt/id |
| last_login | datetime | no | auth metadata |
| password | hash | yes | Django password hasher |
### Database invariants
- Unique username
### Index plan
- Evaluate/implement index for `is_active` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/accounts/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## accounts.Role
**Purpose:** Role catalog
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| code | varchar(50) | yes | stable machine code |
| name | varchar(100) | yes | display |
| active | bool | yes | default true |
### Database invariants
- Unique code
### Index plan
- Evaluate/implement index for `code` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/accounts/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## accounts.UserRole
**Purpose:** User-to-role assignment
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| user_id | FK User | yes | user |
| role_id | FK Role | yes | role |
| valid_from | datetime | no | optional |
| valid_until | datetime | no | optional |
| assigned_by_id | FK User | no | actor |
### Database invariants
- No duplicate active user+role
### Index plan
- Evaluate/implement index for `user_id` based on actual Django field names and query plan.
- Evaluate/implement index for `role_id` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/accounts/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## staff.Teacher
**Purpose:** Teacher profile
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| user_id | OneToOne User | no | portal account |
| employee_no | varchar(50) | no | unique when present |
| full_name | varchar(200) | yes | official name |
| gender | enum | no | configured |
| phone | varchar(50) | no | contact |
| email | email | no | contact |
| employment_status | enum | yes | ACTIVE/INACTIVE/LEAVE/ENDED |
| join_date | date | no | history |
| leave_date | date | no | when ended |
### Database invariants
- Unique employee_no when non-null
### Index plan
- Evaluate/implement index for `employment_status` based on actual Django field names and query plan.
- Evaluate/implement index for `full_name` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/staff/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## staff.StaffProfile
**Purpose:** Non-teacher staff profile
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| user_id | OneToOne User | no | portal account |
| employee_no | varchar(50) | no | unique when present |
| full_name | varchar(200) | yes | official |
| position | varchar(100) | yes | job title |
| department | varchar(100) | no | unit |
| employment_status | enum | yes | ACTIVE/INACTIVE/LEAVE/ENDED |
| phone | varchar(50) | no | contact |
### Database invariants
- Unique employee_no when non-null
### Index plan
- Evaluate/implement index for `employment_status` based on actual Django field names and query plan.
- Evaluate/implement index for `department` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/staff/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## academics.Subject
**Purpose:** Master subject
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| code | varchar(30) | yes | stable unique |
| name | varchar(150) | yes | display |
| short_name | varchar(30) | no | report UI |
| category | enum | yes | CORE/MAJOR/ELECTIVE/OTHER |
| active | bool | yes | default true |
### Database invariants
- Unique code
### Index plan
- Evaluate/implement index for `category` based on actual Django field names and query plan.
- Evaluate/implement index for `active` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/academics/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## academics.SubjectOffering
**Purpose:** Subject applicability by year/grade/major
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes | year |
| grade_level_id | FK GradeLevel | yes | X/XI/XII |
| major_id | FK Major | no | null means all majors |
| subject_id | FK Subject | yes | subject |
| weekly_periods | smallint | yes | >0 |
| is_required | bool | yes | required/elective |
| active | bool | yes | operational |
### Database invariants
- Unique year+grade+major+subject
- weekly_periods > 0
### Index plan
- Evaluate/implement index for `academic_year_id,grade_level_id,major_id` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/academics/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## academics.ClassRoom
**Purpose:** Rombel per academic year
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes | year |
| grade_level_id | FK GradeLevel | yes | X/XI/XII |
| major_id | FK Major | yes | IPA/IPS |
| name | varchar(100) | yes | e.g. X IPA 1 |
| code | varchar(50) | yes | unique in year |
| homeroom_teacher_id | FK Teacher | no | wali kelas |
| default_room_id | FK Room | no | room |
| capacity | integer | no | nonnegative |
| active | bool | yes | operational |
### Database invariants
- Unique academic_year+code
- capacity >= 0
### Index plan
- Evaluate/implement index for `academic_year_id,grade_level_id,major_id` based on actual Django field names and query plan.
- Evaluate/implement index for `homeroom_teacher_id` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/academics/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## academics.TeachingAssignment
**Purpose:** Teacher assigned to subject/class
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes | year |
| teacher_id | FK Teacher | yes | teacher |
| classroom_id | FK ClassRoom | yes | class |
| subject_offering_id | FK SubjectOffering | yes | offering |
| valid_from | date | no | start |
| valid_until | date | no | end |
| active | bool | yes | current |
### Database invariants
- Classroom year matches assignment
- Offering compatible with class grade/major
### Index plan
- Evaluate/implement index for `teacher_id,active` based on actual Django field names and query plan.
- Evaluate/implement index for `classroom_id,active` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/academics/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## admissions.AdmissionPeriod
**Purpose:** Enrollment intake window
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes | target year |
| name | varchar(150) | yes | display |
| registration_start | datetime | yes | open start |
| registration_end | datetime | yes | close |
| capacity_total | integer | no | optional |
| status | enum | yes | DRAFT/OPEN/CLOSED/DECISION/COMPLETED |
### Database invariants
- registration_start < registration_end
### Index plan
- Evaluate/implement index for `academic_year_id,status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/admissions/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## admissions.Applicant
**Purpose:** Prospective student
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| admission_period_id | FK AdmissionPeriod | yes | period |
| registration_no | varchar(50) | yes | server-generated unique |
| full_name | varchar(200) | yes | official |
| birth_place | varchar(100) | no |  |
| birth_date | date | yes | not future |
| gender | enum | no |  |
| previous_school | varchar(200) | no | previous institution |
| phone | varchar(50) | no |  |
| email | email | no |  |
| address | text | no |  |
| desired_major_id | FK Major | no | preference only |
| status | enum | yes | workflow |
| submitted_at | datetime | no | set once |
### Database invariants
- Unique registration_no
- No invalid backwards state without reopen
### Index plan
- Evaluate/implement index for `admission_period_id,status` based on actual Django field names and query plan.
- Evaluate/implement index for `full_name` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/admissions/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## admissions.ApplicantGuardian
**Purpose:** Guardian captured before enrollment
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| applicant_id | FK Applicant | yes | parent |
| full_name | varchar(200) | yes |  |
| relationship | varchar/enum | yes | FATHER/MOTHER/GUARDIAN/OTHER |
| phone | varchar(50) | no |  |
| email | email | no |  |
| occupation | varchar(150) | no |  |
| address | text | no |  |
| is_primary | bool | yes | primary contact |
### Database invariants
- Max one primary per applicant
### Index plan
- Evaluate/implement index for `applicant_id,is_primary` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/admissions/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## admissions.ApplicantDocument
**Purpose:** Applicant document verification
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| applicant_id | FK Applicant | yes |  |
| document_type | varchar(50) | yes | configured type |
| file_id | FK StoredFile | yes | private |
| verification_status | enum | yes | PENDING/VALID/INVALID |
| verified_by_id | FK User | no | actor |
| verified_at | datetime | no |  |
| note | text | no | reason |
### Database invariants
- One active document per required type if policy requires
### Index plan
- Evaluate/implement index for `applicant_id,document_type` based on actual Django field names and query plan.
- Evaluate/implement index for `verification_status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/admissions/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## admissions.AdmissionDecision
**Purpose:** Selection decision
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| applicant_id | OneToOne Applicant | yes |  |
| decision | enum | yes | ACCEPTED/WAITING_LIST/REJECTED |
| score | decimal | no | optional |
| rank | integer | no | optional |
| decided_by_id | FK User | yes | actor |
| decided_at | datetime | yes |  |
| note | text | no |  |
### Database invariants
- One current decision per applicant
### Index plan
- Evaluate/implement index for `decision` based on actual Django field names and query plan.
- Evaluate/implement index for `rank` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/admissions/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## students.Student
**Purpose:** Student master identity
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| user_id | OneToOne User | no | portal account |
| student_no | varchar(50) | yes | internal unique |
| national_student_no | varchar(80) | no | external ID if school uses |
| full_name | varchar(200) | yes | official |
| birth_place | varchar(100) | no |  |
| birth_date | date | yes |  |
| gender | enum | no |  |
| address | text | no |  |
| phone | varchar(50) | no |  |
| email | email | no |  |
| photo_file_id | FK StoredFile | no | private |
| admission_date | date | yes |  |
| status | enum | yes | ACTIVE/GRADUATED/TRANSFERRED/LEFT/INACTIVE |
### Database invariants
- Unique student_no
- Unique national_student_no when non-null
### Index plan
- Evaluate/implement index for `status` based on actual Django field names and query plan.
- Evaluate/implement index for `student_no` based on actual Django field names and query plan.
- Evaluate/implement index for `full_name` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/students/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## students.Guardian
**Purpose:** Parent/guardian master
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| user_id | OneToOne User | no | portal account |
| full_name | varchar(200) | yes |  |
| phone | varchar(50) | no |  |
| email | email | no |  |
| address | text | no |  |
| occupation | varchar(150) | no |  |
| active | bool | yes |  |
### Database invariants
- No automatic merge solely by same name
### Index plan
- Evaluate/implement index for `full_name` based on actual Django field names and query plan.
- Evaluate/implement index for `phone` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/students/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## students.StudentGuardian
**Purpose:** Many-to-many student guardian relationship
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| guardian_id | FK Guardian | yes |  |
| relationship | varchar/enum | yes |  |
| is_primary | bool | yes |  |
| receives_notifications | bool | yes | default true |
| financial_contact | bool | yes | default false |
| active | bool | yes |  |
### Database invariants
- Unique active student+guardian
- Max one primary active guardian per student
### Index plan
- Evaluate/implement index for `student_id,active` based on actual Django field names and query plan.
- Evaluate/implement index for `guardian_id,active` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/students/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## students.StudentEnrollment
**Purpose:** Historical yearly placement
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| academic_year_id | FK AcademicYear | yes |  |
| grade_level_id | FK GradeLevel | yes |  |
| major_id | FK Major | yes | IPA/IPS |
| classroom_id | FK ClassRoom | yes |  |
| status | enum | yes | ACTIVE/PROMOTED/REPEATED/TRANSFERRED/COMPLETED/CANCELLED |
| start_date | date | yes |  |
| end_date | date | no |  |
| source | enum | yes | ADMISSION/PROMOTION/TRANSFER/MANUAL |
### Database invariants
- One ACTIVE enrollment per student+academic year
- Classroom year/grade/major matches enrollment
### Index plan
- Evaluate/implement index for `student_id,academic_year_id` based on actual Django field names and query plan.
- Evaluate/implement index for `classroom_id,status` based on actual Django field names and query plan.
- Evaluate/implement index for `major_id` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/students/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## students.StudentStatusHistory
**Purpose:** Status history
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| from_status | enum | no |  |
| to_status | enum | yes |  |
| effective_date | date | yes |  |
| reason | text | no |  |
| changed_by_id | FK User | yes |  |
### Database invariants
- Append-only through services
### Index plan
- Evaluate/implement index for `student_id,effective_date` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/students/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## students.StudentTransfer
**Purpose:** Transfer/mutation record
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| transfer_type | enum | yes | IN/OUT/INTERNAL_MAJOR/INTERNAL_CLASS |
| effective_date | date | yes |  |
| from_detail | json/text | no | snapshot |
| to_detail | json/text | no | snapshot |
| reason | text | yes | mandatory for major/out changes |
| document_file_id | FK StoredFile | no |  |
| approved_by_id | FK User | no |  |
### Database invariants
- History preserved
### Index plan
- Evaluate/implement index for `student_id,effective_date` based on actual Django field names and query plan.
- Evaluate/implement index for `transfer_type` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/students/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## schedules.ScheduleEntry
**Purpose:** Recurring class timetable
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes |  |
| trimester_id | FK Trimester | no | if term-specific |
| classroom_id | FK ClassRoom | yes |  |
| teaching_assignment_id | FK TeachingAssignment | yes |  |
| weekday | smallint | yes | 1..7 |
| bell_period_id | FK BellPeriod | yes |  |
| room_id | FK Room | no |  |
| valid_from | date | yes |  |
| valid_until | date | no |  |
| active | bool | yes |  |
### Database invariants
- No overlapping teacher
- No overlapping classroom
- No overlapping room
- Assignment matches classroom
### Index plan
- Evaluate/implement index for `classroom_id,weekday,bell_period_id` based on actual Django field names and query plan.
- Evaluate/implement index for `teaching_assignment_id,weekday` based on actual Django field names and query plan.
- Evaluate/implement index for `room_id,weekday` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/schedules/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## schedules.ScheduleException
**Purpose:** One-date schedule override
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| schedule_entry_id | FK ScheduleEntry | yes |  |
| date | date | yes |  |
| exception_type | enum | yes | CANCELLED/MOVED/SUBSTITUTED |
| new_bell_period_id | FK BellPeriod | no |  |
| new_room_id | FK Room | no |  |
| substitute_teacher_id | FK Teacher | no |  |
| reason | text | yes |  |
### Database invariants
- Unique schedule_entry+date
- Replacement must pass collision checks
### Index plan
- Evaluate/implement index for `date` based on actual Django field names and query plan.
- Evaluate/implement index for `exception_type` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/schedules/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## attendance.AttendanceSession
**Purpose:** Attendance-taking session
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes |  |
| trimester_id | FK Trimester | yes |  |
| classroom_id | FK ClassRoom | yes |  |
| date | date | yes |  |
| session_type | enum | yes | DAILY/LESSON |
| schedule_entry_id | FK ScheduleEntry | no | required for LESSON |
| teaching_assignment_id | FK TeachingAssignment | no | required for LESSON |
| opened_by_id | FK User | yes |  |
| status | enum | yes | OPEN/SUBMITTED/LOCKED |
| version | integer | yes | optimistic concurrency |
| submitted_at | datetime | no |  |
| locked_at | datetime | no |  |
### Database invariants
- Unique daily class+date for DAILY
- Unique schedule+date for LESSON
- version >= 1
### Index plan
- Evaluate/implement index for `classroom_id,date` based on actual Django field names and query plan.
- Evaluate/implement index for `status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/attendance/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## attendance.AttendanceRecord
**Purpose:** One student attendance state inside a session
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| session_id | FK AttendanceSession | yes |  |
| student_id | FK Student | yes | must be enrolled |
| status | enum | yes | PRESENT/SICK/PERMITTED/ABSENT/LATE |
| minutes_late | smallint | no | only LATE |
| note | text | no |  |
| recorded_by_id | FK User | yes |  |
| version | integer | yes |  |
### Database invariants
- Unique session+student
- minutes_late >= 0
- LATE minutes validation
### Index plan
- Evaluate/implement index for `student_id` based on actual Django field names and query plan.
- Evaluate/implement index for `session_id` based on actual Django field names and query plan.
- Evaluate/implement index for `status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/attendance/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## attendance.AttendanceCorrection
**Purpose:** Immutable correction history
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| attendance_record_id | FK AttendanceRecord | yes |  |
| from_status | enum | yes |  |
| to_status | enum | yes |  |
| reason | text | yes | mandatory |
| requested_by_id | FK User | yes |  |
| approved_by_id | FK User | no | if approval policy |
| created_at | datetime | yes |  |
### Database invariants
- Append-only
### Index plan
- Evaluate/implement index for `attendance_record_id,created_at` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/attendance/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## attendance.StudentLeaveRequest
**Purpose:** Student leave/permission request
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| start_date | date | yes |  |
| end_date | date | yes |  |
| leave_type | enum | yes | SICK/PERMITTED/OTHER |
| reason | text | yes |  |
| supporting_file_id | FK StoredFile | no |  |
| status | enum | yes | PENDING/APPROVED/REJECTED/CANCELLED |
| reviewed_by_id | FK User | no |  |
### Database invariants
- start_date <= end_date
### Index plan
- Evaluate/implement index for `student_id,start_date` based on actual Django field names and query plan.
- Evaluate/implement index for `status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/attendance/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## attendance.StaffAttendance
**Purpose:** Simple teacher/staff daily attendance
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| person_type | enum | yes | TEACHER/STAFF |
| teacher_id | FK Teacher | no | conditional |
| staff_id | FK StaffProfile | no | conditional |
| date | date | yes |  |
| status | enum | yes | PRESENT/SICK/PERMITTED/ABSENT/LATE |
| check_in_at | datetime | no |  |
| check_out_at | datetime | no |  |
| note | text | no |  |
### Database invariants
- Exactly one teacher/staff
- Unique person+date
### Index plan
- Evaluate/implement index for `date` based on actual Django field names and query plan.
- Evaluate/implement index for `status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/attendance/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## attendance.OfflineMutationReceipt
**Purpose:** Server-side replay protection for offline writes
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| mutation_id | UUID | yes | client-generated |
| user_id | FK User | yes |  |
| device_id | varchar(100) | yes | opaque local id |
| mutation_type | varchar(80) | yes |  |
| resource_id | UUID | no | result |
| result_status | enum | yes | APPLIED/DUPLICATE/CONFLICT/REJECTED |
| processed_at | datetime | yes |  |
| response_snapshot | jsonb | no | small safe response |
### Database invariants
- Unique user+mutation_id
### Index plan
- Evaluate/implement index for `user_id,processed_at` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/attendance/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## assessments.AssessmentType
**Purpose:** Assessment type master
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| code | varchar(30) | yes | ASSIGNMENT/QUIZ/PRACTICAL/PROJECT/CAU/OTHER |
| name | varchar(100) | yes | display |
| active | bool | yes |  |
### Database invariants
- Unique code
### Index plan
- Evaluate/implement index for `active` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/assessments/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## assessments.GradingScheme
**Purpose:** Weighted grading rule per offering/trimester
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes |  |
| trimester_id | FK Trimester | yes |  |
| subject_offering_id | FK SubjectOffering | yes |  |
| name | varchar(100) | yes |  |
| status | enum | yes | DRAFT/ACTIVE/LOCKED |
| passing_score | decimal | no | school configurable |
### Database invariants
- Unique active scheme per trimester+offering
- Cannot activate unless component weights total 100
### Index plan
- Evaluate/implement index for `trimester_id,subject_offering_id,status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/assessments/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## assessments.GradingComponent
**Purpose:** Weighted scheme component
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| grading_scheme_id | FK GradingScheme | yes |  |
| assessment_type_id | FK AssessmentType | yes |  |
| name | varchar(100) | yes |  |
| weight_percent | decimal | yes | >0 and <=100 |
| sequence | smallint | yes |  |
| is_cau_component | bool | yes | true for CAU component |
### Database invariants
- weight > 0
- Sum =100 checked at scheme activation
### Index plan
- Evaluate/implement index for `grading_scheme_id,sequence` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/assessments/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## assessments.Assessment
**Purpose:** Concrete graded activity
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| teaching_assignment_id | FK TeachingAssignment | yes |  |
| trimester_id | FK Trimester | yes |  |
| assessment_type_id | FK AssessmentType | yes |  |
| grading_component_id | FK GradingComponent | yes |  |
| title | varchar(200) | yes |  |
| assessment_date | date | yes |  |
| max_score | decimal | yes | >0 |
| cau_number | smallint | no | required for CAU; equals trimester |
| status | enum | yes | DRAFT/OPEN/CLOSED/LOCKED |
| version | integer | yes |  |
### Database invariants
- If CAU then cau_number = trimester.number
- max_score > 0
- Assignment term/year compatible
### Index plan
- Evaluate/implement index for `teaching_assignment_id,trimester_id` based on actual Django field names and query plan.
- Evaluate/implement index for `assessment_type_id` based on actual Django field names and query plan.
- Evaluate/implement index for `assessment_date` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/assessments/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## assessments.StudentScore
**Purpose:** Raw assessment score
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| assessment_id | FK Assessment | yes |  |
| student_id | FK Student | yes | must be in assigned class |
| score | decimal | no | null means ungraded |
| status | enum | yes | PENDING/GRADED/ABSENT/EXCUSED |
| is_remedial | bool | yes |  |
| recorded_by_id | FK User | yes |  |
| version | integer | yes |  |
### Database invariants
- Unique assessment+student
- 0 <= score <= assessment.max_score
### Index plan
- Evaluate/implement index for `assessment_id` based on actual Django field names and query plan.
- Evaluate/implement index for `student_id` based on actual Django field names and query plan.
- Evaluate/implement index for `status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/assessments/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## assessments.ScoreRevision
**Purpose:** Score revision audit record
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_score_id | FK StudentScore | yes |  |
| old_score | decimal | no |  |
| new_score | decimal | no |  |
| reason | text | yes | mandatory |
| changed_by_id | FK User | yes |  |
| changed_at | datetime | yes |  |
### Database invariants
- Append-only
### Index plan
- Evaluate/implement index for `student_score_id,changed_at` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/assessments/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## assessments.TermGrade
**Purpose:** Final subject grade per student per trimester
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| trimester_id | FK Trimester | yes |  |
| teaching_assignment_id | FK TeachingAssignment | yes |  |
| calculated_score | decimal | no | server calculated |
| final_score | decimal | no | authoritative when finalized |
| grade_label | varchar(20) | no | optional |
| status | enum | yes | DRAFT/FINALIZED/REOPENED |
| finalized_by_id | FK User | no |  |
| finalized_at | datetime | no |  |
| version | integer | yes |  |
### Database invariants
- Unique student+trimester+teaching_assignment
- Finalized direct edit forbidden
### Index plan
- Evaluate/implement index for `student_id,trimester_id` based on actual Django field names and query plan.
- Evaluate/implement index for `status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/assessments/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## report_cards.ReportCard
**Purpose:** Published trimester report snapshot
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| enrollment_id | FK StudentEnrollment | yes |  |
| trimester_id | FK Trimester | yes |  |
| status | enum | yes | DRAFT/REVIEWED/PUBLISHED/REOPENED |
| homeroom_note | text | no |  |
| attendance_summary | jsonb | yes | snapshot |
| published_at | datetime | no |  |
| published_by_id | FK User | no |  |
| revision_no | integer | yes | starts at 1 |
| pdf_file_id | FK StoredFile | no | generated snapshot |
### Database invariants
- Unique student+trimester+revision_no
- Only one current published revision
### Index plan
- Evaluate/implement index for `student_id,trimester_id` based on actual Django field names and query plan.
- Evaluate/implement index for `status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/report_cards/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## report_cards.ReportCardSubject
**Purpose:** Subject row snapshot in report
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| report_card_id | FK ReportCard | yes |  |
| subject_id | FK Subject | yes |  |
| term_grade_id | FK TermGrade | yes |  |
| final_score | decimal | yes | snapshot |
| grade_label | varchar(20) | no | snapshot |
| teacher_note | text | no |  |
### Database invariants
- Unique report_card+subject
### Index plan
- Evaluate/implement index for `report_card_id` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/report_cards/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## report_cards.PromotionDecision
**Purpose:** Promotion/repeat/graduation decision
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| academic_year_id | FK AcademicYear | yes |  |
| decision | enum | yes | PROMOTED/REPEATED/GRADUATED/TRANSFERRED |
| from_enrollment_id | FK StudentEnrollment | yes |  |
| target_grade_level_id | FK GradeLevel | no | for promotion/repeat |
| target_major_id | FK Major | no | default same |
| target_classroom_id | FK ClassRoom | no | if assigned |
| reason | text | no | mandatory for repeat/major change |
| approved_by_id | FK User | yes |  |
### Database invariants
- One final decision student+year
- Major change requires reason
### Index plan
- Evaluate/implement index for `academic_year_id,decision` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/report_cards/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## national_exams.NationalExamRecord
**Purpose:** Official national exam record for grade XII
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes | must have grade XII enrollment |
| academic_year_id | FK AcademicYear | yes |  |
| exam_name | varchar(150) | yes | configurable official label |
| candidate_no | varchar(100) | no |  |
| status | enum | yes | REGISTERED/ATTENDED/ABSENT/PASSED/FAILED/PENDING |
| overall_score | decimal | no | if applicable |
| result_date | date | no |  |
| certificate_no | varchar(100) | no |  |
| document_file_id | FK StoredFile | no | restricted |
### Database invariants
- Unique student+year+exam_name
### Index plan
- Evaluate/implement index for `academic_year_id,status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/national_exams/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## finance.FeeType
**Purpose:** Student fee category
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| code | varchar(30) | yes | SPP/REGISTRATION/ACTIVITY/EXAM/OTHER |
| name | varchar(100) | yes | display |
| recurrence | enum | yes | MONTHLY/ONE_TIME/TRIMESTER/YEARLY/MANUAL |
| active | bool | yes |  |
### Database invariants
- Unique code
### Index plan
- Evaluate/implement index for `active` based on actual Django field names and query plan.
- Evaluate/implement index for `recurrence` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/finance/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## finance.FeePlan
**Purpose:** Fee tariff/structure
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes |  |
| fee_type_id | FK FeeType | yes |  |
| grade_level_id | FK GradeLevel | no | null all grades |
| major_id | FK Major | no | null all majors |
| amount | decimal(12,2) | yes | USD >=0 |
| due_day | smallint | no | 1..28 recommended for monthly |
| status | enum | yes | DRAFT/ACTIVE/INACTIVE |
### Database invariants
- Unique active relevant combination
- amount >= 0
### Index plan
- Evaluate/implement index for `academic_year_id,fee_type_id,status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/finance/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## finance.StudentFeeAssignment
**Purpose:** Per-student fee assignment/override
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| fee_plan_id | FK FeePlan | yes |  |
| effective_from | date | yes |  |
| effective_until | date | no |  |
| amount_override | decimal(12,2) | no |  |
| status | enum | yes | ACTIVE/INACTIVE |
### Database invariants
- Effective range valid
### Index plan
- Evaluate/implement index for `student_id,status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/finance/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## finance.Discount
**Purpose:** Approved fee discount
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| academic_year_id | FK AcademicYear | yes |  |
| fee_type_id | FK FeeType | no | null broader policy |
| discount_type | enum | yes | FIXED/PERCENT |
| value | decimal | yes | nonnegative |
| start_date | date | yes |  |
| end_date | date | no |  |
| reason | text | yes |  |
| approved_by_id | FK User | yes |  |
| status | enum | yes | ACTIVE/EXPIRED/REVOKED |
### Database invariants
- Percent <=100
- date range valid
### Index plan
- Evaluate/implement index for `student_id,status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/finance/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## finance.Scholarship
**Purpose:** Scholarship/fee waiver
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| name | varchar(150) | yes |  |
| coverage_type | enum | yes | FULL/PERCENT/FIXED |
| value | decimal | no | required except FULL |
| valid_from | date | yes |  |
| valid_until | date | no |  |
| status | enum | yes | ACTIVE/ENDED/REVOKED |
| note | text | no |  |
### Database invariants
- Coverage value valid for type
### Index plan
- Evaluate/implement index for `student_id,status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/finance/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## finance.Invoice
**Purpose:** Student bill
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| invoice_no | varchar(50) | yes | human unique |
| student_id | FK Student | yes |  |
| academic_year_id | FK AcademicYear | yes |  |
| trimester_id | FK Trimester | no | if term-linked |
| billing_period | varchar/date | no | month for SPP |
| issue_date | date | yes |  |
| due_date | date | yes |  |
| subtotal | decimal(12,2) | yes | server calculated |
| discount_total | decimal(12,2) | yes | server calculated |
| total | decimal(12,2) | yes | server calculated |
| paid_amount | decimal(12,2) | yes | server maintained |
| balance | decimal(12,2) | yes | server maintained |
| status | enum | yes | UNPAID/PARTIALLY_PAID/PAID/VOID |
| generation_key | varchar(180) | no | deterministic idempotency key |
### Database invariants
- Unique invoice_no
- Unique generation_key when non-null
- total/balance >=0
### Index plan
- Evaluate/implement index for `student_id,status` based on actual Django field names and query plan.
- Evaluate/implement index for `due_date,status` based on actual Django field names and query plan.
- Evaluate/implement index for `billing_period` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/finance/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## finance.InvoiceItem
**Purpose:** Invoice component
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| invoice_id | FK Invoice | yes |  |
| fee_type_id | FK FeeType | yes |  |
| description | varchar(200) | yes |  |
| quantity | decimal | yes | default 1 |
| unit_amount | decimal | yes |  |
| discount_amount | decimal | yes | default 0 |
| line_total | decimal | yes | server calculated |
### Database invariants
- line_total >= 0
### Index plan
- Evaluate/implement index for `invoice_id` based on actual Django field names and query plan.
- Evaluate/implement index for `fee_type_id` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/finance/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## finance.Payment
**Purpose:** Received student payment
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| payment_no | varchar(50) | yes | human unique |
| student_id | FK Student | yes |  |
| payment_date | datetime | yes |  |
| amount | decimal(12,2) | yes | >0 |
| method | enum | yes | CASH/BANK_TRANSFER/OTHER |
| reference_no | varchar(100) | no | bank reference |
| status | enum | yes | PENDING/VERIFIED/REVERSED |
| proof_file_id | FK StoredFile | no | private |
| received_by_id | FK User | no | cash actor |
| verified_by_id | FK User | no |  |
| verified_at | datetime | no |  |
| idempotency_key | varchar(100) | no | unique when present |
### Database invariants
- Unique payment_no
- Unique idempotency_key when non-null
- amount > 0
### Index plan
- Evaluate/implement index for `student_id,status` based on actual Django field names and query plan.
- Evaluate/implement index for `payment_date` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/finance/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## finance.PaymentAllocation
**Purpose:** Payment-to-invoice allocation
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| payment_id | FK Payment | yes |  |
| invoice_id | FK Invoice | yes |  |
| amount | decimal(12,2) | yes | >0 |
### Database invariants
- Unique payment+invoice
- Sum allocations <= payment amount
- Allocation <= invoice outstanding inside locked transaction
### Index plan
- Evaluate/implement index for `payment_id` based on actual Django field names and query plan.
- Evaluate/implement index for `invoice_id` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/finance/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## finance.PaymentReversal
**Purpose:** Verified payment reversal
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| payment_id | OneToOne Payment | yes |  |
| reason | text | yes | mandatory |
| reversed_by_id | FK User | yes |  |
| reversed_at | datetime | yes |  |
| approval_note | text | no |  |
### Database invariants
- One reversal per payment
- Only VERIFIED payment can reverse
### Index plan
- Evaluate/implement index for `reversed_at` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/finance/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## finance.Receipt
**Purpose:** Immutable payment receipt snapshot
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| receipt_no | varchar(50) | yes | unique |
| payment_id | FK Payment | yes |  |
| issued_at | datetime | yes |  |
| issued_by_id | FK User | yes |  |
| pdf_file_id | FK StoredFile | no | generated |
| snapshot | jsonb | yes | student/payment/allocation display snapshot |
### Database invariants
- Unique receipt_no
### Index plan
- Evaluate/implement index for `payment_id` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/finance/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## counseling.CounselingCase
**Purpose:** Confidential BK case
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| case_no | varchar(50) | yes | unique |
| category | varchar(100) | yes | configurable |
| severity | enum | yes | LOW/MEDIUM/HIGH/CRITICAL |
| summary | varchar(250) | yes | minimal |
| details | text | no | restricted |
| status | enum | yes | OPEN/IN_PROGRESS/RESOLVED/CLOSED |
| assigned_counselor_id | FK User/Teacher | no |  |
| opened_at | datetime | yes |  |
| closed_at | datetime | no |  |
### Database invariants
- Unique case_no
### Index plan
- Evaluate/implement index for `student_id,status` based on actual Django field names and query plan.
- Evaluate/implement index for `assigned_counselor_id` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/counseling/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## counseling.CounselingFollowUp
**Purpose:** Confidential follow-up note
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| case_id | FK CounselingCase | yes |  |
| follow_up_at | datetime | yes |  |
| note | text | yes | restricted |
| created_by_id | FK User | yes |  |
| next_action_at | datetime | no |  |
### Database invariants
- Append-only policy preferred
### Index plan
- Evaluate/implement index for `case_id,follow_up_at` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/counseling/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## counseling.DisciplineIncident
**Purpose:** Student discipline incident
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| student_id | FK Student | yes |  |
| occurred_at | datetime | yes |  |
| category | varchar(100) | yes |  |
| severity | enum | yes | LOW/MEDIUM/HIGH |
| description | text | yes |  |
| reported_by_id | FK User | yes |  |
| action_taken | text | no |  |
| status | enum | yes | OPEN/RESOLVED |
### Database invariants
- Incident remains historical after resolution
### Index plan
- Evaluate/implement index for `student_id,occurred_at` based on actual Django field names and query plan.
- Evaluate/implement index for `status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/counseling/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## extracurricular.ExtracurricularActivity
**Purpose:** School extracurricular activity
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| academic_year_id | FK AcademicYear | yes |  |
| name | varchar(150) | yes |  |
| advisor_teacher_id | FK Teacher | no |  |
| capacity | integer | no |  |
| active | bool | yes |  |
### Database invariants
- Unique academic_year+name
### Index plan
- Evaluate/implement index for `academic_year_id,active` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/extracurricular/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## extracurricular.ExtracurricularMembership
**Purpose:** Student membership
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| activity_id | FK ExtracurricularActivity | yes |  |
| student_id | FK Student | yes |  |
| joined_at | date | yes |  |
| left_at | date | no |  |
| status | enum | yes | ACTIVE/INACTIVE |
### Database invariants
- Unique active activity+student
### Index plan
- Evaluate/implement index for `student_id,status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/extracurricular/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## extracurricular.ExtracurricularAttendance
**Purpose:** Optional but implemented basic activity attendance
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| activity_id | FK ExtracurricularActivity | yes |  |
| student_id | FK Student | yes |  |
| date | date | yes |  |
| status | enum | yes | PRESENT/ABSENT/PERMITTED |
| note | text | no |  |
### Database invariants
- Unique activity+student+date
### Index plan
- Evaluate/implement index for `activity_id,date` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/extracurricular/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## library.LibraryBook
**Purpose:** Bibliographic title
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| isbn | varchar(30) | no |  |
| title | varchar(250) | yes |  |
| author | varchar(200) | no |  |
| publisher | varchar(200) | no |  |
| publication_year | smallint | no |  |
| category | varchar(100) | no |  |
| active | bool | yes |  |
### Database invariants
- No forced uniqueness on title alone
### Index plan
- Evaluate/implement index for `title` based on actual Django field names and query plan.
- Evaluate/implement index for `isbn` based on actual Django field names and query plan.
- Evaluate/implement index for `category` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/library/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## library.LibraryCopy
**Purpose:** Physical copy
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| book_id | FK LibraryBook | yes |  |
| barcode | varchar(80) | yes | unique |
| acquisition_date | date | no |  |
| condition | enum | yes | GOOD/DAMAGED/LOST/REPAIR |
| status | enum | yes | AVAILABLE/ON_LOAN/LOST/REPAIR/RETIRED |
### Database invariants
- Unique barcode
### Index plan
- Evaluate/implement index for `book_id,status` based on actual Django field names and query plan.
- Evaluate/implement index for `barcode` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/library/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## library.LibraryLoan
**Purpose:** Checkout transaction
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| copy_id | FK LibraryCopy | yes |  |
| student_id | FK Student | no | one borrower type |
| teacher_id | FK Teacher | no | one borrower type |
| borrowed_at | datetime | yes |  |
| due_at | datetime | yes |  |
| returned_at | datetime | no |  |
| status | enum | yes | OPEN/RETURNED/OVERDUE/LOST |
| fine_amount | decimal(12,2) | yes | informational default 0 |
### Database invariants
- Exactly one borrower
- One open loan per copy
### Index plan
- Evaluate/implement index for `status,due_at` based on actual Django field names and query plan.
- Evaluate/implement index for `student_id,status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/library/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## assets.Asset
**Purpose:** School asset master
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| asset_no | varchar(80) | yes | unique |
| name | varchar(200) | yes |  |
| category | varchar(100) | yes |  |
| serial_no | varchar(100) | no |  |
| purchase_date | date | no |  |
| purchase_cost | decimal(12,2) | no | USD metadata only |
| location_room_id | FK Room | no |  |
| condition | enum | yes | GOOD/FAIR/DAMAGED/REPAIR/LOST |
| status | enum | yes | AVAILABLE/ASSIGNED/REPAIR/RETIRED/LOST |
### Database invariants
- Unique asset_no
### Index plan
- Evaluate/implement index for `category,status` based on actual Django field names and query plan.
- Evaluate/implement index for `location_room_id` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/assets/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## assets.AssetAssignment
**Purpose:** Asset assignment history
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| asset_id | FK Asset | yes |  |
| assigned_to_type | enum | yes | TEACHER/STAFF/ROOM |
| teacher_id | FK Teacher | no | conditional |
| staff_id | FK StaffProfile | no | conditional |
| room_id | FK Room | no | conditional |
| assigned_at | datetime | yes |  |
| returned_at | datetime | no |  |
| note | text | no |  |
### Database invariants
- Exactly one target
- Only one active assignment per asset
### Index plan
- Evaluate/implement index for `asset_id,returned_at` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/assets/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## assets.AssetMaintenance
**Purpose:** Asset maintenance history
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| asset_id | FK Asset | yes |  |
| started_at | date | yes |  |
| completed_at | date | no |  |
| description | text | yes |  |
| cost | decimal(12,2) | no |  |
| vendor | varchar(150) | no |  |
| status | enum | yes | OPEN/COMPLETED/CANCELLED |
### Database invariants
- Completion date not before start
### Index plan
- Evaluate/implement index for `asset_id,status` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/assets/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## communications.Announcement
**Purpose:** School announcement
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| title | varchar(200) | yes |  |
| body | text | yes | sanitized render |
| audience_type | enum | yes | ALL/ROLE/GRADE/MAJOR/CLASS/STUDENT/GUARDIAN/STAFF |
| publish_at | datetime | yes |  |
| expire_at | datetime | no |  |
| status | enum | yes | DRAFT/SCHEDULED/PUBLISHED/ARCHIVED |
| created_by_id | FK User | yes |  |
### Database invariants
- expire > publish when set
### Index plan
- Evaluate/implement index for `status,publish_at` based on actual Django field names and query plan.
- Evaluate/implement index for `audience_type` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/communications/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## communications.AnnouncementAudience
**Purpose:** Resolved/explicit audience selector metadata
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| announcement_id | FK Announcement | yes |  |
| role_code | varchar(50) | no |  |
| grade_level_id | FK GradeLevel | no |  |
| major_id | FK Major | no |  |
| classroom_id | FK ClassRoom | no |  |
| student_id | FK Student | no |  |
### Database invariants
- At least one selector field must match announcement audience type
### Index plan
- Evaluate/implement index for `announcement_id` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/communications/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## communications.Notification
**Purpose:** Logical notification to one user
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| recipient_user_id | FK User | yes |  |
| type | varchar(80) | yes |  |
| title | varchar(200) | yes |  |
| body | text | yes | non-sensitive summary |
| target_url | varchar(300) | no | safe internal URL |
| dedup_key | varchar(180) | no | deterministic |
| read_at | datetime | no |  |
| created_at | datetime | yes |  |
### Database invariants
- Unique recipient+dedup_key when non-null
### Index plan
- Evaluate/implement index for `recipient_user_id,read_at` based on actual Django field names and query plan.
- Evaluate/implement index for `created_at` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/communications/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## communications.NotificationDelivery
**Purpose:** Channel delivery state
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| notification_id | FK Notification | yes |  |
| channel | enum | yes | IN_APP/PUSH/EMAIL |
| status | enum | yes | PENDING/SENT/FAILED/SKIPPED |
| attempt_count | smallint | yes |  |
| last_error_code | varchar(100) | no | safe code |
| sent_at | datetime | no |  |
### Database invariants
- Unique notification+channel
### Index plan
- Evaluate/implement index for `status` based on actual Django field names and query plan.
- Evaluate/implement index for `channel` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/communications/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## communications.PushSubscription
**Purpose:** Encrypted Web Push subscription
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| user_id | FK User | yes |  |
| endpoint_hash | varchar | yes | unique hash |
| endpoint_encrypted | text | yes | secret-ish |
| p256dh_encrypted | text | yes |  |
| auth_encrypted | text | yes |  |
| user_agent | varchar(300) | no |  |
| active | bool | yes |  |
| last_success_at | datetime | no |  |
### Database invariants
- Unique endpoint_hash
### Index plan
- Evaluate/implement index for `user_id,active` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/communications/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## documents.StoredFile
**Purpose:** Private object metadata
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| object_key | varchar(500) | yes | random unique |
| original_name | varchar(255) | yes | sanitized display |
| mime_type | varchar(150) | yes | validated |
| size_bytes | bigint | yes | within configured limit |
| sha256 | char(64) | yes | integrity |
| classification | enum | yes | PUBLIC/INTERNAL/CONFIDENTIAL/RESTRICTED |
| uploaded_by_id | FK User | no | system allowed |
| created_at | datetime | yes |  |
### Database invariants
- Unique object_key
- size >= 0
### Index plan
- Evaluate/implement index for `classification` based on actual Django field names and query plan.
- Evaluate/implement index for `sha256` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/documents/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## documents.GeneratedDocument
**Purpose:** Generated document revision
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| document_type | varchar(80) | yes | REPORT_CARD/RECEIPT/LETTER/TRANSCRIPT/etc |
| resource_type | varchar(80) | yes |  |
| resource_id | UUID/string | yes |  |
| revision | integer | yes |  |
| file_id | FK StoredFile | yes |  |
| generated_by_id | FK User | no | system job allowed |
| generated_at | datetime | yes |  |
### Database invariants
- Unique document_type+resource+revision
### Index plan
- Evaluate/implement index for `resource_type,resource_id` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/documents/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## reports.ReportJob
**Purpose:** Asynchronous report/export job
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| requested_by_id | FK User | yes |  |
| report_type | varchar(80) | yes |  |
| parameters | jsonb | yes | validated schema |
| status | enum | yes | QUEUED/RUNNING/SUCCEEDED/FAILED/EXPIRED |
| progress_percent | smallint | yes | 0..100 |
| result_file_id | FK StoredFile | no |  |
| error_code | varchar(100) | no | safe |
| created_at | datetime | yes |  |
| finished_at | datetime | no |  |
### Database invariants
- progress between 0 and 100
### Index plan
- Evaluate/implement index for `requested_by_id,status` based on actual Django field names and query plan.
- Evaluate/implement index for `created_at` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/reports/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## integrations.ImportJob
**Purpose:** Bulk import lifecycle
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| import_type | varchar(80) | yes | STUDENTS/TEACHERS/SCORES/etc |
| source_file_id | FK StoredFile | yes |  |
| requested_by_id | FK User | yes |  |
| status | enum | yes | UPLOADED/VALIDATING/READY/IMPORTING/SUCCEEDED/FAILED |
| total_rows | integer | yes |  |
| valid_rows | integer | yes |  |
| invalid_rows | integer | yes |  |
| result_file_id | FK StoredFile | no |  |
| idempotency_key | varchar(100) | yes | unique |
### Database invariants
- Unique idempotency_key
### Index plan
- Evaluate/implement index for `status` based on actual Django field names and query plan.
- Evaluate/implement index for `created_at` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/integrations/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## integrations.ImportRowError
**Purpose:** Per-row import error
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| import_job_id | FK ImportJob | yes |  |
| row_number | integer | yes | 1-based |
| field_name | varchar(100) | no |  |
| error_code | varchar(100) | yes |  |
| message | text | yes | human safe |
| raw_value | text | no | mask sensitive |
### Database invariants
- Row number >0
### Index plan
- Evaluate/implement index for `import_job_id,row_number` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/integrations/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
## audit.AuditLog
**Purpose:** Append-only security/business audit
### Fields
| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| id | UUID | yes | PK |
| actor_id | FK User | no | null system job |
| event_type | varchar(100) | yes | stable code |
| resource_type | varchar(100) | no |  |
| resource_id | varchar/UUID | no |  |
| request_id | UUID | no |  |
| ip_address | inet | no |  |
| user_agent | varchar/text | no | truncated |
| before | jsonb | no | minimize PII |
| after | jsonb | no | minimize PII |
| metadata | jsonb | yes | safe |
| created_at | datetime | yes | immutable |
### Database invariants
- Append-only application behavior
### Index plan
- Evaluate/implement index for `event_type,created_at` based on actual Django field names and query plan.
- Evaluate/implement index for `resource_type,resource_id` based on actual Django field names and query plan.
- Evaluate/implement index for `actor_id,created_at` based on actual Django field names and query plan.
### Implementation checklist
- [ ] Create Django model in `apps/audit/models.py` or split models package.
- [ ] Use UUID primary key unless a reference/sequencing table has documented reason otherwise.
- [ ] Use explicit `related_name`; avoid ambiguous reverse names.
- [ ] Add `created_at`/`updated_at` where lifecycle auditing benefits; do not substitute these for AuditLog.
- [ ] Encode hard invariants as CheckConstraint/UniqueConstraint when DB can enforce safely.
- [ ] Create reversible migration and review generated SQL for risky changes.
- [ ] Register minimal Django Admin with search/list_filter/read-only controls appropriate to sensitivity.
- [ ] Create serializer/DTO for read and separate write/action serializers where mutability differs.
- [ ] Do not expose all model fields using unreviewed `fields="__all__"` on sensitive APIs.
- [ ] Create selector/query helper for common scoped read path.
- [ ] Create service/use-case for non-trivial write; no multi-row rule hidden only in serializer.
- [ ] Apply global permission and object scope before service mutation.
- [ ] Emit required AuditLog/domain event for sensitive state changes.
- [ ] Test valid create/read/update path if resource is mutable.
- [ ] Test each documented constraint.
- [ ] Test unauthorized role denial.
- [ ] Test cross-object scope denial where model contains student/class/user relationship.
- [ ] Test query/pagination behavior if model is listable.
- [ ] Add fixture/factory with synthetic values; never copy production PII into test fixtures.
# 57. Validation Standards
## 57.1 Names and Text
- Trim surrounding whitespace.
- Preserve human capitalization unless field has canonical code.
- Do not reject legitimate Timor-Leste/Portuguese/Tetun characters.
- Length limits exist at serializer and DB.
- Required reasons cannot be whitespace-only.
- User-entered narrative stored as plain text unless rich text is an explicit feature.
## 57.2 Dates
- Birth date cannot be future.
- Academic/year/trimestre ranges validate ordering.
- Effective dates respect parent period when domain requires.
- Datetime input must be timezone aware or converted explicitly.
- Date-only academic records use school-local calendar date.
## 57.3 Enumerations
- Use Django TextChoices/IntegerChoices or reference table when admin-configurable.
- Enum machine values are stable after production release.
- Labels translated separately.
- Do not reuse one status enum across unrelated domains merely because labels look similar.
## 57.4 Relationships
- FK existence is not enough; service validates compatible academic year/grade/major/class.
- Incoming related IDs are resolved through actor-scoped querysets when necessary.
- Inactive/closed rows cannot be selected for new operations unless rule explicitly allows historical reference.
- Circular relationships avoided; snapshots used for immutable published documents where needed.
## 57.5 Money
- Decimal, positive domain amounts unless explicit credit/reversal type.
- Currency fixed USD at current product scope but store currency code on immutable transaction snapshot if future-proofing is inexpensive.
- Round only at documented calculation boundary, not repeatedly between components.
- Never trust client-calculated invoice balance.
## 57.6 Score
- Raw score 0..max_score unless ABSENT/EXCUSED semantics allow null.
- No negative score.
- Final score precision fixed in settings/DecimalField.
- Grade label derived/configured, not authoritative numeric replacement.
- CAU type demands cau_number matching trimester.
# 58. Data Retention and Deletion
| Data | Policy |
| --- | --- |
| Draft applicant never submitted | May purge after configured retention and notice policy |
| Submitted admission record | Retain according to school/legal policy; archive rather than casual delete |
| Student identity/enrollment | Retain as official school history |
| Attendance/grades/report cards | Retain academic history |
| Finance invoice/payment/reversal/receipt | Retain transaction history; never hard-delete verified transaction |
| Counseling notes | Restricted retention defined by school policy; purge only authorized process |
| Audit logs | Retain minimum operational/legal period; immutable to product users |
| Temp uploads | Short retention; auto-clean unattached objects |
| Generated exports | Short configurable retention; regenerate from canonical data |
| Push subscriptions | Delete/revoke when invalid or user revokes |
| Sessions | Expire according to auth policy |
| Library loans | Retain history; borrower PII exposure follows role scope |
Before go-live, school management must approve concrete retention durations where Timor-Leste law/school regulation requires a value. Code must keep these durations configurable and must not invent a legal retention period.
# 59. Browser and Device Support
- Primary: current supported Chrome/Edge/Firefox desktop and Chrome-based Android browsers used by school.
- Safari/iOS receives responsive portal and supported PWA features, but offline/background capabilities are capability-detected.
- No browser-specific feature may be sole path for attendance sync.
- Minimum screen width supports common low/mid-range Android.
- Public admissions page works without PWA installation.
- Admin-heavy tables optimized desktop but remain usable tablet.
- Feature detection over user-agent branching whenever possible.
# 60. Configuration and Feature Flags
## 60.1 School Settings
- School identity/contact/logo.
- Current academic year.
- Default locale.
- Timezone fixed/default Asia/Dili.
- Currency USD.
- Attendance statuses/late threshold policy.
- Grade precision/rounding policy.
- Report-card labels/templates.
- SPP due day/reminder windows.
- Admission required document types.
- Notification channel enable flags.
- Library loan duration/fine optional policy.
- File size limits.
## 60.2 Feature Flags
- Flags may disable UI/module before school starts using it, but included modules remain implemented/tested as part of final system.
- Flags examples: `ENABLE_LIBRARY`, `ENABLE_ASSETS`, `ENABLE_EXTRACURRICULAR`, `ENABLE_STAFF_ATTENDANCE`, `ENABLE_WEB_PUSH`, `ENABLE_EMAIL`.
- Do not use flags to maintain two incompatible database schemas.
- Flag changes are audited if operationally significant.
# 61. Roadmap Implementasi Final — Dependency Ordered
Roadmap ini adalah urutan implementasi. Jangan melompat ke fase berikutnya jika exit criteria dependency belum terpenuhi, kecuali task benar-benar independen dan tidak mengubah contract.
## F0 — Repository & Engineering Foundation
**Implementation tasks**
- [ ] `F0-01` Create monorepo folders `apps/web`, `apps/api` or documented equivalent, shared docs/scripts.
- [ ] `F0-02` Pin Node/Python/package-manager versions.
- [ ] `F0-03` Initialize Next.js App Router TypeScript.
- [ ] `F0-04` Initialize Django 5.2 project with settings split.
- [ ] `F0-05` Add DRF, drf-spectacular, django-filter, pytest/pytest-django.
- [ ] `F0-06` Configure PostgreSQL dev/test.
- [ ] `F0-07` Add lint/format/typecheck configs.
- [ ] `F0-08` Add `.env.example`, secret ignore, pre-commit optional.
- [ ] `F0-09` Create standard API envelope/error handler/request_id middleware.
- [ ] `F0-10` Create OpenAPI endpoint and generated/typed client workflow.
- [ ] `F0-11` Create base timestamp/UUID model utilities without forcing inheritance where inappropriate.
- [ ] `F0-12` Create audit/event helper skeleton.
- [ ] `F0-13` Create CI lint/unit/build pipeline.
- [ ] `F0-14` Create README local setup and architecture ADR-001 modular monolith.
- [ ] `F0-15` Create synthetic factories/seeding framework.
**Exit criteria**
- [ ] Fresh clone can install, migrate, run web+api, run tests.
- [ ] No production secret in repo.
- [ ] CI green.
- [ ] OpenAPI schema generated.
## F1 — Identity, Roles, School Configuration, Audit
**Implementation tasks**
- [ ] `F1-01` Implement custom Django User from first migration; do not swap later.
- [ ] `F1-02` Implement Role/UserRole and permission mapping strategy.
- [ ] `F1-03` Seed canonical roles/permissions idempotently.
- [ ] `F1-04` Implement login/logout/me/password reset.
- [ ] `F1-05` Implement CSRF/session cross-origin/same-origin deployment contract.
- [ ] `F1-06` Implement account active/disable.
- [ ] `F1-07` Implement SchoolProfile singleton.
- [ ] `F1-08` Implement request/correlation ID.
- [ ] `F1-09` Implement AuditLog append service and read-only admin/API.
- [ ] `F1-10` Add login success/failure/security audit events.
- [ ] `F1-11` Create frontend auth bootstrap and protected route layout.
- [ ] `F1-12` Create permission-aware navigation.
- [ ] `F1-13` Create school settings page.
- [ ] `F1-14` Add authorization test helpers for role/object matrix.
- [ ] `F1-15` Add rate limiting for login/reset at selected layer.
**Exit criteria**
- [ ] Disabled account blocked.
- [ ] CSRF unsafe request test passes.
- [ ] Role allow/deny tests pass.
- [ ] Audit row written for sensitive changes.
- [ ] Frontend cannot make unauthorized route usable even if URL manually entered; backend denies.
## F2 — Academic Master Data
**Implementation tasks**
- [ ] `F2-01` Implement AcademicYear.
- [ ] `F2-02` Implement exactly three Trimestre rules and CAU number mapping.
- [ ] `F2-03` Seed GradeLevel X/XI/XII and Major IPA/IPS.
- [ ] `F2-04` Implement Room and BellPeriod.
- [ ] `F2-05` Implement Subject.
- [ ] `F2-06` Implement SubjectOffering per year/grade/major.
- [ ] `F2-07` Implement ClassRoom/rombel.
- [ ] `F2-08` Implement Teacher/StaffProfile.
- [ ] `F2-09` Implement TeachingAssignment.
- [ ] `F2-10` Implement SchoolCalendarEvent.
- [ ] `F2-11` Create academic-year activation/close readiness service.
- [ ] `F2-12` Create CRUD UI with dependency-safe delete/archive rules.
- [ ] `F2-13` Implement academic filters reused across modules.
- [ ] `F2-14` Add integrity tests for year/trimestre/grade/major/class compatibility.
**Exit criteria**
- [ ] Active year has Trimestre 1/2/3 only.
- [ ] CAU mapping invariant test passes.
- [ ] Class X IPA/IPS, XI IPA/IPS, XII IPA/IPS can be configured with multiple rombels.
- [ ] Subject offering rejects incompatible references.
## F3 — Admissions / Pendaftaran Siswa Baru
**Implementation tasks**
- [ ] `F3-01` Implement AdmissionPeriod.
- [ ] `F3-02` Implement Applicant + ApplicantGuardian.
- [ ] `F3-03` Implement StoredFile minimal dependency if not already completed.
- [ ] `F3-04` Implement ApplicantDocument required-document configuration and verification.
- [ ] `F3-05` Implement public admissions form with autosave/draft optional.
- [ ] `F3-06` Implement server registration number generation.
- [ ] `F3-07` Implement submit state transition and post-submit edit restrictions.
- [ ] `F3-08` Implement officer applicant queue/filter.
- [ ] `F3-09` Implement verification workflow.
- [ ] `F3-10` Implement decision ACCEPTED/WAITING_LIST/REJECTED.
- [ ] `F3-11` Implement result publication/public lookup with non-enumerable token/identifier strategy.
- [ ] `F3-12` Implement re-registration.
- [ ] `F3-13` Implement transactional applicant→Student conversion service.
- [ ] `F3-14` Convert/link guardian records with safe duplicate review; never merge by name only.
- [ ] `F3-15` Create admission statistics and export.
- [ ] `F3-16` Create admissions E2E from public submit to enrolled student.
**Exit criteria**
- [ ] Applicant cannot skip required state transition.
- [ ] Rejected applicant cannot be enrolled without authorized decision change.
- [ ] Enrollment conversion is idempotent.
- [ ] Documents remain private.
## F4 — Student, Guardian, Enrollment, Transfer
**Implementation tasks**
- [ ] `F4-01` Implement Student, Guardian, StudentGuardian.
- [ ] `F4-02` Implement StudentEnrollment.
- [ ] `F4-03` Implement StudentStatusHistory.
- [ ] `F4-04` Implement StudentTransfer.
- [ ] `F4-05` Create student profile tabs: identity, guardian, enrollment, documents, attendance summary, grades, finance summary depending permission.
- [ ] `F4-06` Create guardian child-switcher portal selector.
- [ ] `F4-07` Create active enrollment selector as canonical utility.
- [ ] `F4-08` Create internal classroom transfer action.
- [ ] `F4-09` Create IPA↔IPS transfer action requiring reason/approval.
- [ ] `F4-10` Create transfer-out workflow and status history.
- [ ] `F4-11` Create manual enrollment only for authorized TU with validation.
- [ ] `F4-12` Create bulk class assignment/import with preview.
- [ ] `F4-13` Create student search indexes/filters.
- [ ] `F4-14` Create cross-student object authorization tests.
**Exit criteria**
- [ ] No two active enrollments same student/year.
- [ ] Historical enrollment retained.
- [ ] Guardian only sees linked children.
- [ ] Major transfer auditable.
## F5 — Scheduling
**Implementation tasks**
- [ ] `F5-01` Implement ScheduleEntry.
- [ ] `F5-02` Implement ScheduleException.
- [ ] `F5-03` Implement teacher/classroom/room overlap selector.
- [ ] `F5-04` Create validate/dry-run endpoint.
- [ ] `F5-05` Create create/update transaction with collision recheck.
- [ ] `F5-06` Create substitute teacher action.
- [ ] `F5-07` Create cancelled/moved session exception.
- [ ] `F5-08` Create class schedule view.
- [ ] `F5-09` Create teacher schedule view.
- [ ] `F5-10` Create student/guardian schedule read view.
- [ ] `F5-11` Handle SchoolCalendarEvent holidays.
- [ ] `F5-12` Add printable schedule report.
- [ ] `F5-13` Add concurrency/conflict tests.
**Exit criteria**
- [ ] Teacher/class/room cannot be double-booked.
- [ ] Exception keeps original schedule history.
- [ ] Teacher sees only own operational schedule; admin can filter all.
## F6 — Attendance + Offline PWA
**Implementation tasks**
- [ ] `F6-01` Implement AttendanceSession/Record/Correction.
- [ ] `F6-02` Implement StudentLeaveRequest.
- [ ] `F6-03` Implement StaffAttendance simple domain.
- [ ] `F6-04` Implement session open/list/submit/lock workflow.
- [ ] `F6-05` Implement roster derived from valid enrollment.
- [ ] `F6-06` Implement bulk attendance write.
- [ ] `F6-07` Implement correction reason and approval policy.
- [ ] `F6-08` Implement attendance summaries/report.
- [ ] `F6-09` Implement absence/late event after commit.
- [ ] `F6-10` Implement IndexedDB schema.
- [ ] `F6-11` Implement scoped roster prefetch/download.
- [ ] `F6-12` Implement mutation queue and UUIDs.
- [ ] `F6-13` Implement OfflineMutationReceipt.
- [ ] `F6-14` Implement sync endpoint with replay protection and version conflict.
- [ ] `F6-15` Implement manual + online/focus startup retry.
- [ ] `F6-16` Implement logout/account-switch cache clear.
- [ ] `F6-17` Implement service worker cache allowlist.
- [ ] `F6-18` Implement offline indicator/sync status/conflict UI.
- [ ] `F6-19` Run offline reload/reconnect E2E.
- [ ] `F6-20` Run burst attendance load test.
**Exit criteria**
- [ ] Offline attendance survives reload.
- [ ] Sync is exactly-once logically.
- [ ] Conflict never silently overwrites newer server record.
- [ ] Finance/grade publish unavailable offline.
## F7 — Assessment, CAU 1–3, Gradebook
**Implementation tasks**
- [ ] `F7-01` Implement AssessmentType.
- [ ] `F7-02` Implement GradingScheme/Component.
- [ ] `F7-03` Implement scheme activation sum=100 validation.
- [ ] `F7-04` Implement Assessment.
- [ ] `F7-05` Implement CAU number rule.
- [ ] `F7-06` Implement StudentScore and ScoreRevision.
- [ ] `F7-07` Create score grid/bulk save.
- [ ] `F7-08` Implement absent/excused score semantics.
- [ ] `F7-09` Implement remedial policy fields/service according to school settings.
- [ ] `F7-10` Implement authoritative Decimal grade calculator.
- [ ] `F7-11` Implement TermGrade.
- [ ] `F7-12` Implement finalize/reopen workflows.
- [ ] `F7-13` Implement grade-entry window and closed-trimestre restrictions.
- [ ] `F7-14` Create gradebook filters and completion status.
- [ ] `F7-15` Create score import preview.
- [ ] `F7-16` Add rounding regression tests.
- [ ] `F7-17` Add teacher object-scope tests.
**Exit criteria**
- [ ] CAU1 cannot be attached to Trimestre2/3.
- [ ] Weights exact before active.
- [ ] Finalized grade immutable.
- [ ] All authoritative calculations server-side.
## F8 — Report Card, Promotion, Graduation, National Exam
**Implementation tasks**
- [ ] `F8-01` Implement ReportCard/ReportCardSubject snapshots.
- [ ] `F8-02` Implement readiness check for missing finalized TermGrades.
- [ ] `F8-03` Implement homeroom note and attendance summary snapshot.
- [ ] `F8-04` Implement generate/review/publish/reopen revision workflow.
- [ ] `F8-05` Build deterministic print HTML/PDF template.
- [ ] `F8-06` Queue bulk PDF generation.
- [ ] `F8-07` Implement transcript view/report.
- [ ] `F8-08` Implement PromotionDecision.
- [ ] `F8-09` Build promotion preview grouped by class.
- [ ] `F8-10` Implement idempotent promotion execute transaction.
- [ ] `F8-11` Default retain same major; require reason for change.
- [ ] `F8-12` Implement repeat workflow.
- [ ] `F8-13` Implement graduation for XII.
- [ ] `F8-14` Implement NationalExamRecord and restricted document.
- [ ] `F8-15` Implement national exam import preview.
- [ ] `F8-16` Create alumni/archive status views.
- [ ] `F8-17` Run report snapshot immutability E2E.
**Exit criteria**
- [ ] Published report remains historically stable.
- [ ] Promotion cannot duplicate next-year enrollment.
- [ ] XII graduation closes active cycle without deleting records.
- [ ] National exam distinct from CAU.
## F9 — Finance — SPP and Student Fees
**Implementation tasks**
- [ ] `F9-01` Implement FeeType/FeePlan/StudentFeeAssignment.
- [ ] `F9-02` Implement Discount/Scholarship.
- [ ] `F9-03` Implement Invoice/InvoiceItem.
- [ ] `F9-04` Define deterministic monthly SPP generation_key.
- [ ] `F9-05` Implement dry-run generation preview.
- [ ] `F9-06` Implement Celery generation with unique/idempotent behavior.
- [ ] `F9-07` Implement invoice list/detail/student statement.
- [ ] `F9-08` Implement Payment/PaymentAllocation.
- [ ] `F9-09` Implement cash payment atomic flow.
- [ ] `F9-10` Implement bank-proof upload and PENDING state.
- [ ] `F9-11` Implement Finance verify/reject action.
- [ ] `F9-12` Implement Idempotency-Key store/service.
- [ ] `F9-13` Implement partial payments.
- [ ] `F9-14` Implement Receipt snapshot/PDF.
- [ ] `F9-15` Implement PaymentReversal.
- [ ] `F9-16` Implement invoice void eligibility.
- [ ] `F9-17` Implement overdue calculation/reminders.
- [ ] `F9-18` Implement finance reports.
- [ ] `F9-19` Implement guardian/student finance read scope.
- [ ] `F9-20` Run concurrent payment test.
- [ ] `F9-21` Run duplicate generation/retry test.
- [ ] `F9-22` Run reversal arithmetic test.
**Exit criteria**
- [ ] Zero duplicate SPP invoices on retry.
- [ ] Zero overpayment under concurrent test.
- [ ] No hard-delete verified payments.
- [ ] Student/guardian cannot see others finance.
## F10 — BK, Discipline, Extracurricular
**Implementation tasks**
- [ ] `F10-01` Implement CounselingCase/FollowUp.
- [ ] `F10-02` Implement restricted counseling permissions and access audit.
- [ ] `F10-03` Implement case status/reopen.
- [ ] `F10-04` Implement DisciplineIncident and VOID correction semantics.
- [ ] `F10-05` Implement guardian-notice metadata without internal note leakage.
- [ ] `F10-06` Implement ExtracurricularActivity/Membership/Attendance.
- [ ] `F10-07` Implement capacity and one-active-membership constraints.
- [ ] `F10-08` Create role dashboards/reports.
- [ ] `F10-09` Add privacy tests.
**Exit criteria**
- [ ] Normal teacher cannot read counseling narrative.
- [ ] Incident history cannot disappear.
- [ ] Extracurricular capacity/membership constraints enforced.
## F11 — Library and Assets
**Implementation tasks**
- [ ] `F11-01` Implement LibraryBook/Copy/Loan.
- [ ] `F11-02` Implement barcode/copy-code uniqueness.
- [ ] `F11-03` Implement checkout with copy lock.
- [ ] `F11-04` Implement return/renew/overdue/lost/damaged.
- [ ] `F11-05` Implement student/staff borrower scope.
- [ ] `F11-06` Implement Asset/Assignment/Maintenance.
- [ ] `F11-07` Implement one-active-assignment rule.
- [ ] `F11-08` Implement asset transfer/location/status/retire.
- [ ] `F11-09` Create reports and audit-sensitive changes.
- [ ] `F11-10` Run concurrency tests for copy/asset.
**Exit criteria**
- [ ] Copy cannot be loaned twice.
- [ ] Asset cannot be actively assigned twice.
- [ ] History retained.
## F12 — Communications, Files, Documents
**Implementation tasks**
- [ ] `F12-01` Finish StoredFile production storage adapter.
- [ ] `F12-02` Implement authorized download/signed URL.
- [ ] `F12-03` Implement file MIME/size rules.
- [ ] `F12-04` Implement GeneratedDocument.
- [ ] `F12-05` Implement Announcement/Audience.
- [ ] `F12-06` Implement scheduled publish.
- [ ] `F12-07` Implement Notification/Delivery.
- [ ] `F12-08` Implement PushSubscription and service worker push.
- [ ] `F12-09` Implement email optional adapter.
- [ ] `F12-10` Implement dedup/retry.
- [ ] `F12-11` Implement generated receipt/report document retention.
- [ ] `F12-12` Create notification center and preferences where applicable.
- [ ] `F12-13` Add PII scrubbing and file authorization tests.
**Exit criteria**
- [ ] Private file cannot be fetched by guessed ID.
- [ ] Push contains no sensitive detail.
- [ ] Provider retry does not create uncontrolled duplicates.
## F13 — Import, Export, Dashboards, Reports
**Implementation tasks**
- [ ] `F13-01` Implement ImportJob/ImportRowError.
- [ ] `F13-02` Create versioned templates.
- [ ] `F13-03` Implement parser/normalizer/validator per supported import.
- [ ] `F13-04` Implement preview/confirm/background import.
- [ ] `F13-05` Implement duplicate identity rules.
- [ ] `F13-06` Implement ReportJob.
- [ ] `F13-07` Implement canonical reports ADM/STU/ATT/ACA/GRD/RPT/FIN/LIB/AST/BK/EXT.
- [ ] `F13-08` Implement authorized CSV/XLSX/PDF exports.
- [ ] `F13-09` Implement role dashboards and cached safe aggregates.
- [ ] `F13-10` Implement integrity check command.
- [ ] `F13-11` Implement generated-file retention cleanup.
- [ ] `F13-12` Load test large report/import jobs.
**Exit criteria**
- [ ] No import writes before confirm.
- [ ] Export respects object scope.
- [ ] Dashboard totals reconcile to canonical report fixtures.
## F14 — Production Hardening
**Implementation tasks**
- [ ] `F14-01` Configure staging/production settings.
- [ ] `F14-02` Configure reverse proxy/TLS.
- [ ] `F14-03` Configure PostgreSQL backup/PITR if available.
- [ ] `F14-04` Configure Redis/Celery queues and worker limits.
- [ ] `F14-05` Configure private object storage.
- [ ] `F14-06` Configure Sentry/structured logs.
- [ ] `F14-07` Implement health/live/ready.
- [ ] `F14-08` Configure rate limits/security headers.
- [ ] `F14-09` Run `check --deploy`.
- [ ] `F14-10` Run dependency/security scan.
- [ ] `F14-11` Run full permission matrix tests.
- [ ] `F14-12` Run Playwright critical E2E.
- [ ] `F14-13` Run k6 load scenarios.
- [ ] `F14-14` Run backup restore drill.
- [ ] `F14-15` Run migration rehearsal on production-like data volume.
- [ ] `F14-16` Run accessibility/mobile smoke.
- [ ] `F14-17` Finalize runbooks and contact/escalation ownership.
**Exit criteria**
- [ ] No critical/high unresolved security finding.
- [ ] Restore drill evidence exists.
- [ ] Monitoring alerts verified.
- [ ] Performance targets acceptable.
- [ ] All go-live gates complete except data migration/user training.
## F15 — Go-Live & Stabilization
**Implementation tasks**
- [ ] `F15-01` Freeze/clean master data.
- [ ] `F15-02` Import production student/guardian/staff data through validated import.
- [ ] `F15-03` Configure current AcademicYear/three Trimestres.
- [ ] `F15-04` Configure IPA/IPS rombels, subjects, assignments, schedules.
- [ ] `F15-05` Configure SPP plans and opening balances if needed.
- [ ] `F15-06` Create/verify production accounts and least-privilege roles.
- [ ] `F15-07` Run pre-go-live reconciliation reports.
- [ ] `F15-08` Take/verify pre-launch backup.
- [ ] `F15-09` Deploy release tag.
- [ ] `F15-10` Run smoke test with representative Admin/Teacher/Student/Guardian/Finance accounts.
- [ ] `F15-11` Monitor errors/queue/DB during first operational days.
- [ ] `F15-12` Reconcile first attendance day.
- [ ] `F15-13` Reconcile first payment batch.
- [ ] `F15-14` Collect bugs; fix through normal release pipeline, not production hot-edit.
- [ ] `F15-15` After stabilization, mark baseline release and preserve PRD/ADR version.
**Exit criteria**
- [ ] School operators sign off core workflows.
- [ ] First attendance and finance reconciliation correct.
- [ ] No data-loss/authorization incident.
- [ ] Production support/runbook ownership transferred.
# 62. Definition of Done — Every Ticket
- [ ] Requirement/acceptance criteria mapped to PRD section.
- [ ] No undocumented schema/status/permission introduced.
- [ ] Migration included if schema changed.
- [ ] Server-side validation implemented.
- [ ] Global + object authorization implemented.
- [ ] Happy-path automated test.
- [ ] Deny-path automated test for sensitive endpoint.
- [ ] Constraint/edge test.
- [ ] Audit event when required.
- [ ] OpenAPI updated.
- [ ] Frontend handles loading/empty/error/permission states.
- [ ] i18n string keys added; no unexplained hardcoded user-facing status.
- [ ] No sensitive data logged.
- [ ] Performance query reviewed for list/report.
- [ ] PR description includes migration/rollback impact.
- [ ] Documentation/ADR updated only if contract changed.
- [ ] CI green.
# 63. Production Acceptance / Go-Live Gate
- [ ] `GO-01` All F0–F14 exit criteria complete.
- [ ] `GO-02` Current AcademicYear configured with exactly three non-overlapping Trimestres.
- [ ] `GO-03` CAU 1/2/3 mapping verified.
- [ ] `GO-04` All active students have one valid enrollment with X/XI/XII + IPA/IPS + rombel.
- [ ] `GO-05` All teaching assignments/schedules validated without unresolved collision.
- [ ] `GO-06` Cross-user/cross-student permission suite passes.
- [ ] `GO-07` Guardian-child relationship audit/review complete.
- [ ] `GO-08` Finance fee plan reviewed; SPP dry-run count/amount reconciled before execute.
- [ ] `GO-09` No duplicate invoice/payment constraint anomaly.
- [ ] `GO-10` Grade calculation fixture signed off by school academic owner.
- [ ] `GO-11` Report-card PDF sample approved.
- [ ] `GO-12` Offline attendance tested on actual representative teacher device/browser.
- [ ] `GO-13` HTTPS and security cookies active.
- [ ] `GO-14` `manage.py check --deploy` passes accepted findings.
- [ ] `GO-15` DEBUG false and no secret in client bundle.
- [ ] `GO-16` Private files verified inaccessible anonymously.
- [ ] `GO-17` Automated backup successful and restore drill successful.
- [ ] `GO-18` Production health/readiness monitored.
- [ ] `GO-19` Celery queue retry/dead failure handling tested.
- [ ] `GO-20` Error tracking receives test event with PII scrubbing.
- [ ] `GO-21` Load test does not breach critical latency/error threshold.
- [ ] `GO-22` Migration rollback/recovery plan exists for release.
- [ ] `GO-23` Operator/admin training complete for admissions, academic, attendance, grades, finance.
- [ ] `GO-24` Incident contacts/runbooks available.
- [ ] `GO-25` Production release tagged and reproducible.
# 64. Frontend Page / Route Catalog
| Route | Audience | Purpose |
| --- | --- | --- |
| /login | Public | Login |
| /forgot-password | Public | Password reset request |
| /reset-password | Public token | Set new password |
| /admissions | Public | Admission landing/current period |
| /admissions/apply | Public | Applicant form |
| /admissions/status | Applicant | Status/result lookup |
| /dashboard | All authenticated | Role-aware dashboard |
| /profile | All authenticated | Own profile/basic settings |
| /notifications | All authenticated | Notification inbox |
| /announcements | All authenticated | Scoped announcements |
| /admin/users | Admin | Users/accounts |
| /admin/roles | Super/Admin | Role assignments |
| /admin/school | Admin | School config |
| /admin/audit | Restricted | Audit search |
| /admin/jobs | Admin | Import/report/background jobs |
| /academic/years | Curriculum/Admin | Academic years |
| /academic/trimestres | Curriculum/Admin | Trimestre dates/states |
| /academic/subjects | Curriculum/Admin | Subject master |
| /academic/offerings | Curriculum/Admin | Subject offering |
| /academic/classes | Curriculum/Admin | Rombel |
| /academic/teaching-assignments | Curriculum/Admin | Teacher assignment |
| /academic/calendar | Staff | Calendar |
| /admissions/periods | Admissions | Periods |
| /admissions/applicants | Admissions | Applicant queue |
| /admissions/applicants/[id] | Admissions | Applicant detail/verification/decision |
| /students | Scoped staff | Student directory |
| /students/[id] | Scoped staff | Student overview |
| /students/[id]/enrollment | Scoped staff | Enrollment history |
| /students/[id]/guardians | Scoped staff | Guardians |
| /students/[id]/documents | Scoped staff | Documents |
| /students/[id]/attendance | Scoped staff | Attendance |
| /students/[id]/grades | Scoped staff | Grades |
| /students/[id]/finance | Finance/scoped | Finance summary |
| /staff/teachers | Admin | Teachers |
| /staff/staff | Admin | Staff |
| /schedules | Staff/Student/Guardian | Schedule view |
| /schedules/manage | Curriculum | Schedule editor/validation |
| /attendance/today | Teacher | Today attendance |
| /attendance/classes/[assignmentId] | Teacher scoped | Class attendance |
| /attendance/review | Admin/Homeroom | Review/corrections |
| /attendance/reports | Authorized | Reports |
| /attendance/staff | Admin | Staff attendance |
| /grades/gradebook | Teacher scoped | Gradebook |
| /grades/assessments | Teacher scoped | Assessments |
| /grades/assessments/[id] | Teacher scoped | Score entry |
| /grades/completion | Curriculum | Completion monitor |
| /grades/finalization | Curriculum/Teacher | Term grades |
| /reports/report-cards | Homeroom/Curriculum | Generate/review/publish |
| /reports/report-cards/[id] | Scoped | Report detail |
| /reports/transcripts | Authorized | Transcript |
| /promotion | Curriculum/Admin | Promotion preview/execute |
| /national-exams | Authorized | National exam records |
| /finance | Finance | Finance dashboard |
| /finance/fee-plans | Finance | Plans |
| /finance/invoices | Finance | Invoices |
| /finance/invoices/[id] | Finance/scoped owner | Invoice detail |
| /finance/payments | Finance | Payments |
| /finance/payments/pending | Finance | Bank verification |
| /finance/arrears | Finance | Arrears |
| /finance/reports | Finance | Reports |
| /counseling | BK restricted | Case queue |
| /counseling/[id] | BK restricted | Case detail |
| /discipline | Authorized | Incidents |
| /extracurricular | Authenticated | Activity list |
| /extracurricular/manage | Authorized | Manage activity/members |
| /library | Authenticated | Catalog/self loans |
| /library/circulation | Librarian | Checkout/return |
| /library/manage | Librarian | Catalog/copies |
| /assets | Asset officer | Asset register |
| /assets/[id] | Asset officer | Asset detail/history |
| /communications/announcements | Authorized | Create/manage |
| /reports | Authorized | Report catalog/jobs |
| /imports | Authorized | Import jobs |
| /student/home | Student | Student dashboard |
| /student/schedule | Student | Own schedule |
| /student/attendance | Student | Own attendance |
| /student/grades | Student | Published grade view |
| /student/report-cards | Student | Published reports |
| /student/finance | Student | Own invoices/payments |
| /student/library | Student | Own loans |
| /guardian/home | Guardian | Child-aware dashboard |
| /guardian/children/[id]/attendance | Guardian scoped | Child attendance |
| /guardian/children/[id]/report-cards | Guardian scoped | Child reports |
| /guardian/children/[id]/finance | Guardian scoped | Child finance |
# 65. Implementation Patterns — Mandatory Examples
## 65.1 Scoped Query Pattern
```python
def students_visible_to(user):
    qs = Student.objects.all()
    if user.has_perm("students.view_all"):
        return qs
    if is_teacher(user):
        classroom_ids = active_teaching_classroom_ids(user)
        return qs.filter(
            enrollments__classroom_id__in=classroom_ids,
            enrollments__status="ACTIVE",
        ).distinct()
    if is_guardian(user):
        return qs.filter(
            guardian_links__guardian__user=user,
            guardian_links__active=True,
        ).distinct()
    if is_student(user):
        return qs.filter(user=user)
    return qs.none()
```
This is illustrative. Actual permission names must match the canonical catalog. Never retrieve arbitrary Student by UUID first and only then decide scope in frontend.
## 65.2 Transaction Pattern — Payment
```python
@transaction.atomic
def verify_payment(*, actor, payment_id, allocations):
    payment = Payment.objects.select_for_update().get(id=payment_id)
    assert_can_verify(actor, payment)
    validate_payment_state(payment)

    invoice_ids = sorted(a.invoice_id for a in allocations)
    invoices = {
        str(i.id): i
        for i in Invoice.objects.select_for_update()
            .filter(id__in=invoice_ids)
            .order_by("id")
    }

    validate_allocations(payment, invoices, allocations)
    create_allocations(...)
    recompute_and_persist_invoice_balances(invoices.values())
    payment.status = Payment.Status.VERIFIED
    payment.verified_by = actor
    payment.save(update_fields=[...])
    audit(...)

    transaction.on_commit(lambda: notify_payment_verified.delay(str(payment.id)))
    return payment
```
- Lock rows in deterministic order to reduce deadlock risk.
- Validate again after locking.
- No provider email/PDF work inside transaction.
- Use idempotency wrapper around externally retryable payment creation command.
## 65.3 Idempotency Pattern
```python
def execute_idempotent(*, actor, key, endpoint, payload, handler):
    request_hash = canonical_hash(payload)
    with transaction.atomic():
        row, created = IdempotencyRecord.objects.select_for_update().get_or_create(
            actor=actor, key=key, endpoint=endpoint,
            defaults={"request_hash": request_hash, "status": "PROCESSING"},
        )
        if not created:
            if row.request_hash != request_hash:
                raise IdempotencyConflict()
            if row.status == "COMPLETED":
                return load_previous_result(row)
        result = handler()
        persist_result(row, result)
        return result
```
Implementation may vary, but semantics may not: same key/same command is not applied twice; same key/different payload conflicts.
## 65.4 Celery After Commit
```python
with transaction.atomic():
    report = publish_report_card(...)
    transaction.on_commit(
        lambda: render_report_pdf.delay(str(report.id), report.revision_no)
    )
```
Do not enqueue a task that expects a newly-created row before transaction commit.
## 65.5 Optimistic Version Update
```python
updated = AttendanceRecord.objects.filter(
    id=record_id,
    version=expected_version,
).update(
    status=new_status,
    version=F("version") + 1,
)
if updated != 1:
    raise AttendanceVersionConflict()
```
For multi-row attendance submission, design service-level transaction/version checks so partial unexpected conflict cannot silently produce mixed state.
## 65.6 Grade Calculation
```python
component_percent = (score / max_score) * Decimal("100")
weighted = component_percent * (weight_percent / Decimal("100"))
final = quantize_once(sum(weighted_components), configured_precision)
```
- Use Decimal end-to-end.
- Define how multiple assessments inside one component aggregate (e.g. arithmetic mean or total-points); store this as grading scheme strategy.
- Quantize at documented final boundary.
- Test exact examples approved by curriculum owner.
## 65.7 Schedule Collision Query
```python
# Pseudocode: an entry conflicts when validity date ranges overlap
# AND weekday/bell-period overlap AND one constrained resource matches.
conflict = ScheduleEntry.objects.active().filter(
    weekday=incoming.weekday,
    bell_period=incoming.bell_period,
).filter(
    Q(teaching_assignment__teacher=incoming.teacher) |
    Q(classroom=incoming.classroom) |
    Q(room=incoming.room)
).exclude(id=incoming.id).exists()
```
If BellPeriod can represent overlapping arbitrary time ranges rather than discrete non-overlapping school periods, compare actual start/end ranges and enforce stronger DB/service logic.
# 66. State Transition Reference
- **AdmissionPeriod:** `DRAFT → OPEN → CLOSED → DECISION → COMPLETED`
- **Applicant:** `DRAFT → SUBMITTED → VERIFIED → ELIGIBLE → ACCEPTED/WAITING_LIST/REJECTED → RE_REGISTERED → ENROLLED`
- **AcademicYear:** `DRAFT → ACTIVE → CLOSED`
- **Trimester:** `DRAFT → ACTIVE → GRADING → CLOSED`
- **Enrollment:** `ACTIVE → PROMOTED/REPEATED/TRANSFERRED/COMPLETED/CANCELLED`
- **AttendanceSession:** `OPEN → SUBMITTED → LOCKED`
- **Assessment:** `DRAFT → OPEN → CLOSED → LOCKED`
- **GradingScheme:** `DRAFT → ACTIVE → LOCKED`
- **TermGrade:** `DRAFT → FINALIZED ↔ REOPENED → FINALIZED`
- **ReportCard:** `DRAFT → REVIEWED → PUBLISHED; PUBLISHED → REOPENED → DRAFT/REVIEWED → PUBLISHED as new revision`
- **Invoice:** `UNPAID → PARTIALLY_PAID → PAID; eligible UNPAID → VOID`
- **Payment:** `PENDING → VERIFIED/REJECTED; VERIFIED → REVERSED`
- **CounselingCase:** `OPEN → IN_PROGRESS → RESOLVED → CLOSED; authorized reopen`
- **LibraryLoan:** `OPEN → RETURNED; OPEN → OVERDUE → RETURNED/LOST`
- **Asset:** `AVAILABLE → ASSIGNED/MAINTENANCE/LOST/RETIRED with validated transitions`
- **ImportJob:** `UPLOADED → VALIDATING → READY/INVALID → QUEUED → PROCESSING → COMPLETED/COMPLETED_WITH_ERRORS/FAILED`
- **ReportJob:** `QUEUED → PROCESSING → COMPLETED/FAILED`
Any backward transition not documented here requires an explicit action (`reopen`, `reverse`, `void`, etc.), permission, reason when required, and audit. Generic PATCH must not bypass transition services.
# 67. Operator Runbooks
## 67.1 Deployment
```text
1. Confirm CI green and release tag.
2. Confirm backup freshness.
3. Read migration plan and expected lock time.
4. Announce maintenance if required.
5. Deploy/migrate staging; run smoke.
6. Apply production migration once.
7. Deploy API/web/workers same compatible release family.
8. Run health/readiness.
9. Login as test operational accounts.
10. Verify attendance read, grade read, finance read.
11. Monitor 5xx, latency, Celery failures for release window.
12. Record release complete.
```
## 67.2 Application Rollback
```text
1. Stop further deployments.
2. Identify last known good release.
3. Check whether schema is backward compatible.
4. If yes, deploy previous app version.
5. If no, follow migration-specific rollback/data restore plan; do NOT blindly reverse.
6. Verify health and data integrity.
7. Preserve incident logs and request IDs.
8. Open post-incident record.
```
## 67.3 PostgreSQL Unavailable
```text
1. Readiness fails; prevent writes/serve controlled error.
2. Check managed DB/service/network status.
3. Do not restart repeatedly without diagnosis.
4. Verify disk/connections/credentials/certificate.
5. Restore service or fail over according to provider.
6. Run integrity checks after recovery.
7. Verify Celery tasks that failed/retried.
8. Reconcile finance/attendance writes around outage.
```
## 67.4 Redis/Celery Unavailable
- Core synchronous reads/writes should remain available if they do not require async completion.
- Mark user background actions QUEUED/failed-to-enqueue clearly; do not claim completed.
- Restore Redis/worker.
- Inspect pending/failed jobs.
- Requeue idempotently.
- Reconcile notification/report/SPP job counts.
## 67.5 Object Storage Unavailable
- Block workflows that require new file persistence with clear 503/retry.
- Do not accept DB metadata claiming upload complete when object missing.
- Academic/attendance operations without files remain operational.
- After recovery, run sampled object existence check and requeue generated documents.
## 67.6 Suspected Payment Discrepancy
```text
1. Freeze manual edits to affected transaction.
2. Capture payment/invoice/allocation IDs and audit logs.
3. Recompute canonical balances using integrity command/report.
4. Check idempotency key and reversal state.
5. Never edit verified amount directly in DB.
6. If correction required, execute approved reversal/new payment.
7. Reconcile daily cashier/student statement.
8. Record incident and root cause.
```
## 67.7 Grade/Report Discrepancy
```text
1. Identify assessment/score/term-grade/report revision.
2. Compare ScoreRevision/AuditLog.
3. Do not edit published PDF/database directly.
4. Authorized curriculum user reopens TermGrade/ReportCard with reason.
5. Correct source score through revision workflow.
6. Recalculate/finalize.
7. Generate and publish new report revision.
8. Keep old revision and audit trail.
```
## 67.8 Offline Attendance Conflict
- User sees server vs local value and timestamps/actor information allowed by privacy policy.
- If server correction is authoritative, keep server and mark mutation resolved.
- If local value should win, require permission and submit new correction against latest version.
- Never delete mutation silently; retain local receipt until resolved/acknowledged.
## 67.9 Lost/Credential Compromise
- Disable/revoke affected user sessions.
- Rotate affected API/provider secret if leaked.
- Invalidate push/device registrations if needed.
- Review login/audit history.
- Force password reset where appropriate.
- Assess data accessed/exported.
- Document incident and remediation.
## 67.10 Disaster Restore
```text
1. Declare incident and stop writes.
2. Determine recovery point/RPO.
3. Provision clean DB/storage environment.
4. Restore DB and object storage according to backup system.
5. Deploy matching compatible application release.
6. Run migrations only according to recovery plan.
7. Execute integrity command.
8. Verify representative student, attendance, grade, report, invoice, payment, file.
9. Reconnect workers after DB consistency confirmed.
10. Reopen service and monitor.
11. Reconcile transactions between incident time and restore point manually if required.
```
# 68. Incident Severity
| Severity | Examples | Response |
| --- | --- | --- |
| SEV-1 | Data loss, finance corruption, broad unauthorized access, service totally unavailable during critical operation | Immediate escalation; freeze risky writes; incident commander; preserve evidence |
| SEV-2 | Major module down, many users blocked, report/queue widespread failure | Urgent same operational window |
| SEV-3 | Limited feature degradation/workaround exists | Prioritized fix |
| SEV-4 | Cosmetic/minor issue | Normal backlog |
Exact staffing/on-call times are school/operator decisions. Do not invent 24/7 SLA unless organization commits resources.
# 69. Endpoint-by-Endpoint Verification Contract
Untuk setiap endpoint canonical di Bagian 47, implementor wajib menyelesaikan verifikasi berikut. Bagian ini sengaja eksplisit agar endpoint tidak dianggap selesai hanya karena mengembalikan HTTP 200.
### POST /auth/login/
- **Domain:** Auth
- **Purpose:** Login + CSRF/session flow
- **Authorization:** `Public`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /auth/logout/
- **Domain:** Auth
- **Purpose:** Logout
- **Authorization:** `Authenticated`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /auth/password-reset/request/
- **Domain:** Auth
- **Purpose:** Request reset
- **Authorization:** `Public throttled`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /auth/password-reset/confirm/
- **Domain:** Auth
- **Purpose:** Reset
- **Authorization:** `Public token`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /auth/me/
- **Domain:** Auth
- **Purpose:** Current user/roles/capabilities
- **Authorization:** `Authenticated`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /school/profile/
- **Domain:** School
- **Purpose:** School profile
- **Authorization:** `Authenticated`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### PATCH /school/profile/
- **Domain:** School
- **Purpose:** Update config
- **Authorization:** `school.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /academic-years/
- **Domain:** Academic
- **Purpose:** List years
- **Authorization:** `academic.read`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /academic-years/
- **Domain:** Academic
- **Purpose:** Create year
- **Authorization:** `academic.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /academic-years/{id}/activate/
- **Domain:** Academic
- **Purpose:** Activate
- **Authorization:** `academic.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /academic-years/{id}/close/
- **Domain:** Academic
- **Purpose:** Close
- **Authorization:** `academic.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /trimestres/
- **Domain:** Academic
- **Purpose:** List/filter
- **Authorization:** `academic.read`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /trimestres/
- **Domain:** Academic
- **Purpose:** Create
- **Authorization:** `academic.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /majors/
- **Domain:** Academic
- **Purpose:** IPA/IPS
- **Authorization:** `academic.read`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /grade-levels/
- **Domain:** Academic
- **Purpose:** X/XI/XII
- **Authorization:** `academic.read`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /subjects/
- **Domain:** Academic
- **Purpose:** Subjects
- **Authorization:** `academic.read`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /subjects/
- **Domain:** Academic
- **Purpose:** Create subject
- **Authorization:** `academic.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /subject-offerings/
- **Domain:** Academic
- **Purpose:** Offerings
- **Authorization:** `academic.read`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /subject-offerings/
- **Domain:** Academic
- **Purpose:** Create offering
- **Authorization:** `academic.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /classrooms/
- **Domain:** Academic
- **Purpose:** Class list
- **Authorization:** `class.read`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /classrooms/
- **Domain:** Academic
- **Purpose:** Create rombel
- **Authorization:** `class.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /teaching-assignments/
- **Domain:** Academic
- **Purpose:** Assign teacher
- **Authorization:** `teaching.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /admissions/periods/
- **Domain:** Admissions
- **Purpose:** Periods
- **Authorization:** `admission.read`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /admissions/periods/
- **Domain:** Admissions
- **Purpose:** Create period
- **Authorization:** `admission.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /admissions/applicants/
- **Domain:** Admissions
- **Purpose:** Applicant registration
- **Authorization:** `Public/admission create`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /admissions/applicants/{id}/
- **Domain:** Admissions
- **Purpose:** Detail
- **Authorization:** `admission.read or applicant token`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /admissions/applicants/{id}/submit/
- **Domain:** Admissions
- **Purpose:** Submit
- **Authorization:** `Applicant`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /admissions/applicants/{id}/verify/
- **Domain:** Admissions
- **Purpose:** Verify
- **Authorization:** `admission.verify`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /admissions/applicants/{id}/decision/
- **Domain:** Admissions
- **Purpose:** Decision
- **Authorization:** `admission.decide`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /admissions/applicants/{id}/re-register/
- **Domain:** Admissions
- **Purpose:** Daftar ulang
- **Authorization:** `admission.enroll`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /admissions/applicants/{id}/enroll/
- **Domain:** Admissions
- **Purpose:** Create Student transactionally
- **Authorization:** `admission.enroll`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /students/
- **Domain:** Students
- **Purpose:** Scoped list
- **Authorization:** `student.read`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /students/
- **Domain:** Students
- **Purpose:** Manual create
- **Authorization:** `student.create`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /students/{id}/
- **Domain:** Students
- **Purpose:** Detail
- **Authorization:** `student.read scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### PATCH /students/{id}/
- **Domain:** Students
- **Purpose:** Update profile
- **Authorization:** `student.update scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /students/{id}/enrollments/
- **Domain:** Students
- **Purpose:** History
- **Authorization:** `student.read scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /students/{id}/transfer/
- **Domain:** Students
- **Purpose:** Transfer
- **Authorization:** `student.transfer`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /students/{id}/guardians/
- **Domain:** Students
- **Purpose:** Link guardian
- **Authorization:** `student.guardian.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /guardians/{id}/children/
- **Domain:** Students
- **Purpose:** Linked children
- **Authorization:** `guardian self/admin`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /schedules/
- **Domain:** Schedules
- **Purpose:** Filtered schedule
- **Authorization:** `schedule.read`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /schedules/
- **Domain:** Schedules
- **Purpose:** Create entry
- **Authorization:** `schedule.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### PATCH /schedules/{id}/
- **Domain:** Schedules
- **Purpose:** Update collision checked
- **Authorization:** `schedule.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /schedules/{id}/exceptions/
- **Domain:** Schedules
- **Purpose:** Exception/substitution
- **Authorization:** `schedule.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /schedules/validate/
- **Domain:** Schedules
- **Purpose:** Dry-run collision
- **Authorization:** `schedule.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /attendance/sessions/
- **Domain:** Attendance
- **Purpose:** Open session
- **Authorization:** `attendance.record scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /attendance/sessions/{id}/
- **Domain:** Attendance
- **Purpose:** Session
- **Authorization:** `attendance.read scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### PUT /attendance/sessions/{id}/records/
- **Domain:** Attendance
- **Purpose:** Bulk upsert
- **Authorization:** `attendance.record scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /attendance/sessions/{id}/submit/
- **Domain:** Attendance
- **Purpose:** Submit
- **Authorization:** `attendance.record scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /attendance/records/{id}/correct/
- **Domain:** Attendance
- **Purpose:** Correction
- **Authorization:** `attendance.correct`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /attendance/offline/sync/
- **Domain:** Attendance
- **Purpose:** Idempotent offline sync
- **Authorization:** `attendance.record scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /attendance/student/{student_id}/summary/
- **Domain:** Attendance
- **Purpose:** Summary
- **Authorization:** `attendance.read scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /leave-requests/
- **Domain:** Attendance
- **Purpose:** Request leave
- **Authorization:** `student/guardian or staff`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /leave-requests/{id}/review/
- **Domain:** Attendance
- **Purpose:** Approve/reject
- **Authorization:** `attendance.leave.review`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /assessments/
- **Domain:** Grades
- **Purpose:** Assessments
- **Authorization:** `grade.read`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /assessments/
- **Domain:** Grades
- **Purpose:** Create assessment
- **Authorization:** `grade.write scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### PUT /assessments/{id}/scores/
- **Domain:** Grades
- **Purpose:** Bulk scores
- **Authorization:** `grade.write scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /assessments/{id}/lock/
- **Domain:** Grades
- **Purpose:** Lock assessment
- **Authorization:** `grade.finalize scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /gradebook/
- **Domain:** Grades
- **Purpose:** Gradebook
- **Authorization:** `grade.read scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /term-grades/calculate/
- **Domain:** Grades
- **Purpose:** Calculate preview
- **Authorization:** `grade.write scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /term-grades/finalize/
- **Domain:** Grades
- **Purpose:** Finalize
- **Authorization:** `grade.finalize scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /term-grades/{id}/reopen/
- **Domain:** Grades
- **Purpose:** Reopen
- **Authorization:** `grade.reopen`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /report-cards/generate/
- **Domain:** Report
- **Purpose:** Generate draft/job
- **Authorization:** `report.generate`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /report-cards/{id}/review/
- **Domain:** Report
- **Purpose:** Review
- **Authorization:** `report.review`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /report-cards/{id}/publish/
- **Domain:** Report
- **Purpose:** Publish
- **Authorization:** `report.publish`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /report-cards/{id}/reopen/
- **Domain:** Report
- **Purpose:** Revision
- **Authorization:** `report.reopen`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /report-cards/{id}/download/
- **Domain:** Report
- **Purpose:** PDF
- **Authorization:** `report.read scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /students/{id}/transcript/
- **Domain:** Report
- **Purpose:** Transcript
- **Authorization:** `report.read scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /promotions/preview/
- **Domain:** Report
- **Purpose:** Preview
- **Authorization:** `promotion.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /promotions/execute/
- **Domain:** Report
- **Purpose:** Transactional execute
- **Authorization:** `promotion.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /national-exams/
- **Domain:** NationalExam
- **Purpose:** List
- **Authorization:** `national_exam.read`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /national-exams/
- **Domain:** NationalExam
- **Purpose:** Create/update record
- **Authorization:** `national_exam.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /national-exams/import/
- **Domain:** NationalExam
- **Purpose:** Validated import
- **Authorization:** `national_exam.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /finance/fee-types/
- **Domain:** Finance
- **Purpose:** Fee type
- **Authorization:** `finance.read`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /finance/fee-plans/
- **Domain:** Finance
- **Purpose:** Fee plan
- **Authorization:** `finance.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /finance/invoices/generate-preview/
- **Domain:** Finance
- **Purpose:** Dry run
- **Authorization:** `finance.invoice.generate`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /finance/invoices/generate/
- **Domain:** Finance
- **Purpose:** Async generation
- **Authorization:** `finance.invoice.generate`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /finance/invoices/
- **Domain:** Finance
- **Purpose:** Invoices
- **Authorization:** `finance.read scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /finance/invoices/{id}/
- **Domain:** Finance
- **Purpose:** Detail
- **Authorization:** `finance.read scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /finance/invoices/{id}/void/
- **Domain:** Finance
- **Purpose:** Void eligible
- **Authorization:** `finance.invoice.void`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /finance/payments/
- **Domain:** Finance
- **Purpose:** Payment idempotent
- **Authorization:** `finance.payment.create`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /finance/payments/{id}/verify/
- **Domain:** Finance
- **Purpose:** Verify bank
- **Authorization:** `finance.payment.verify`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /finance/payments/{id}/reverse/
- **Domain:** Finance
- **Purpose:** Reverse
- **Authorization:** `finance.payment.reverse`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /finance/receipts/{id}/
- **Domain:** Finance
- **Purpose:** Receipt
- **Authorization:** `finance.read scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /counseling/cases/
- **Domain:** Counseling
- **Purpose:** Cases
- **Authorization:** `counseling.read restricted`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /counseling/cases/
- **Domain:** Counseling
- **Purpose:** Create
- **Authorization:** `counseling.write`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /counseling/cases/{id}/follow-ups/
- **Domain:** Counseling
- **Purpose:** Follow-up
- **Authorization:** `counseling.write scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /discipline/incidents/
- **Domain:** Discipline
- **Purpose:** Report
- **Authorization:** `discipline.create`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /discipline/incidents/
- **Domain:** Discipline
- **Purpose:** List
- **Authorization:** `discipline.read scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /extracurricular/activities/
- **Domain:** Extracurricular
- **Purpose:** List
- **Authorization:** `extracurricular.read`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /extracurricular/activities/
- **Domain:** Extracurricular
- **Purpose:** Create
- **Authorization:** `extracurricular.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /extracurricular/activities/{id}/members/
- **Domain:** Extracurricular
- **Purpose:** Membership
- **Authorization:** `extracurricular.manage scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /extracurricular/activities/{id}/attendance/
- **Domain:** Extracurricular
- **Purpose:** Attendance
- **Authorization:** `extracurricular.attendance`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /library/books/
- **Domain:** Library
- **Purpose:** Catalog
- **Authorization:** `library.read`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /library/books/
- **Domain:** Library
- **Purpose:** Create book
- **Authorization:** `library.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /library/copies/
- **Domain:** Library
- **Purpose:** Register copy
- **Authorization:** `library.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /library/loans/
- **Domain:** Library
- **Purpose:** Checkout
- **Authorization:** `library.checkout`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /library/loans/{id}/return/
- **Domain:** Library
- **Purpose:** Return
- **Authorization:** `library.return`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /library/loans/{id}/renew/
- **Domain:** Library
- **Purpose:** Renew
- **Authorization:** `library.renew`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /assets/
- **Domain:** Assets
- **Purpose:** Register
- **Authorization:** `asset.read`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /assets/
- **Domain:** Assets
- **Purpose:** Create asset
- **Authorization:** `asset.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /assets/{id}/assign/
- **Domain:** Assets
- **Purpose:** Assign
- **Authorization:** `asset.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /assets/{id}/maintenance/
- **Domain:** Assets
- **Purpose:** Maintenance
- **Authorization:** `asset.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /assets/{id}/retire/
- **Domain:** Assets
- **Purpose:** Retire
- **Authorization:** `asset.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /announcements/
- **Domain:** Communication
- **Purpose:** Scoped list
- **Authorization:** `announcement.read`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /announcements/
- **Domain:** Communication
- **Purpose:** Create
- **Authorization:** `announcement.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /announcements/{id}/publish/
- **Domain:** Communication
- **Purpose:** Publish
- **Authorization:** `announcement.publish`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /notifications/
- **Domain:** Communication
- **Purpose:** Inbox
- **Authorization:** `notification.self`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /notifications/{id}/read/
- **Domain:** Communication
- **Purpose:** Mark read
- **Authorization:** `notification.self`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /push-subscriptions/
- **Domain:** Communication
- **Purpose:** Register device
- **Authorization:** `notification.self`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### DELETE /push-subscriptions/{id}/
- **Domain:** Communication
- **Purpose:** Revoke
- **Authorization:** `notification.self`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /files/upload-init/
- **Domain:** Files
- **Purpose:** Presign/init
- **Authorization:** `file.upload scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /files/upload-complete/
- **Domain:** Files
- **Purpose:** Finalize
- **Authorization:** `file.upload scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /files/{id}/download/
- **Domain:** Files
- **Purpose:** Authorized download
- **Authorization:** `file.read scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /imports/
- **Domain:** Import
- **Purpose:** Upload/parse
- **Authorization:** `import.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /imports/{id}/preview/
- **Domain:** Import
- **Purpose:** Preview
- **Authorization:** `import.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /imports/{id}/confirm/
- **Domain:** Import
- **Purpose:** Execute
- **Authorization:** `import.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /imports/{id}/result/
- **Domain:** Import
- **Purpose:** Result
- **Authorization:** `import.manage`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### POST /reports/{code}/jobs/
- **Domain:** Reports
- **Purpose:** Create job
- **Authorization:** `report.run scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /report-jobs/{id}/
- **Domain:** Reports
- **Purpose:** Status
- **Authorization:** `report.run scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /report-jobs/{id}/download/
- **Domain:** Reports
- **Purpose:** Artifact
- **Authorization:** `report.run scoped`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /audit-logs/
- **Domain:** Audit
- **Purpose:** Read-only
- **Authorization:** `audit.read restricted`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /health/live
- **Domain:** System
- **Purpose:** Liveness
- **Authorization:** `Public/internal`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
### GET /health/ready
- **Domain:** System
- **Purpose:** Readiness
- **Authorization:** `Infra`
- [ ] Define request serializer/query params with explicit allowlist.
- [ ] Define response serializer; do not expose model fields implicitly.
- [ ] Authentication behavior tested (unless explicitly public).
- [ ] Global permission allow/deny tested.
- [ ] Object scope tested when endpoint touches user/student/class/finance/private data.
- [ ] Invalid UUID/not-found behavior stable.
- [ ] Validation failure returns canonical error envelope/code.
- [ ] Audit event implemented when operation is sensitive.
- [ ] Transaction boundary reviewed for writes.
- [ ] Idempotency/version semantics implemented when applicable.
- [ ] OpenAPI request/response examples generated or documented.
- [ ] Frontend handles loading/error/permission/retry appropriately.
- [ ] No sensitive PII present in logs.
- [ ] Query count/pagination reviewed for list endpoints.
# 70. Security Authorization Test Matrix
Minimal deny tests below are required even when UI does not show the route.
| Actor | Target | Expected |
| --- | --- | --- |
| Student A | Student B profile | DENY |
| Student A | Student B attendance | DENY |
| Student A | Student B grades/report | DENY |
| Student A | Student B invoices/payments | DENY |
| Guardian A | Unlinked Student B profile | DENY |
| Guardian A | Unlinked Student B attendance/report/finance | DENY |
| Teacher A | Class not in active TeachingAssignment | DENY write |
| Teacher A | Assessment owned by Teacher B assignment | DENY score |
| Teacher A | Finance payment endpoints | DENY |
| Teacher A | Counseling notes | DENY |
| Homeroom Teacher A | Other homeroom class report note | DENY |
| Finance Admin | Score/grade finalization | DENY unless separately granted |
| Admission Officer | Existing student grade/finance | DENY |
| Librarian | Grade/finance/counseling | DENY |
| Asset Officer | Grade/finance/counseling | DENY |
| BK Counselor | Finance mutation | DENY |
| Anonymous | Student/private files/API | DENY |
| Anonymous | Admissions public create/status token flow | ALLOW only designed public fields |
| Disabled User | Any authenticated API | DENY |
| Expired session | Any authenticated API | 401/reauth |
| User with guessed file UUID | Private file outside scope | DENY |
| User with export permission only | Mutation endpoint | DENY |
# 71. Data Relationship Map
```text
SchoolProfile (singleton)

AcademicYear
 ├── Trimester [1..3]
 ├── ClassRoom ── GradeLevel(X/XI/XII)
 │      └──────── Major(IPA/IPS)
 ├── SubjectOffering ── Subject
 └── TeachingAssignment ── Teacher + ClassRoom + SubjectOffering
         └── ScheduleEntry ── Room/BellPeriod

Applicant ── ApplicantGuardian
    │       └─ ApplicantDocument
    └─ AdmissionDecision
          └─ enroll → Student

Student ──< StudentGuardian >── Guardian
   ├──< StudentEnrollment >── AcademicYear + GradeLevel + Major + ClassRoom
   ├──< StudentStatusHistory
   ├──< StudentTransfer
   ├──< AttendanceRecord >── AttendanceSession
   ├──< StudentScore >── Assessment
   ├──< TermGrade
   ├──< ReportCard ──< ReportCardSubject
   ├──< NationalExamRecord
   ├──< Invoice ──< InvoiceItem
   │       └──< PaymentAllocation >── Payment ── PaymentReversal
   ├──< CounselingCase
   ├──< DisciplineIncident
   ├──< ExtracurricularMembership
   └──< LibraryLoan

StoredFile ← private attachments from admission/student/leave/payment/report/etc.
AuditLog ← append-only events across sensitive domains
```
# 72. Coding Standards for Junior Developers and AI Agents
## 72.1 Before Editing
- Read this PRD section for target domain.
- Read current models/migrations/services/tests for that domain.
- Identify canonical state transition and permissions.
- Check whether endpoint already exists in catalog.
- Check whether field/model already exists before creating duplicate concept.
- Write a small implementation plan in PR/agent scratchpad before code.
## 72.2 Forbidden Shortcuts
- Do not create `role == "admin"` checks scattered in views.
- Do not use `Model.objects.get(id=user_input)` for sensitive object without scope validation.
- Do not use `fields="__all__"` for sensitive writable serializer.
- Do not calculate final grade or invoice balance only in React.
- Do not hardcode Trimestre/CAU dates.
- Do not replace IPA/IPS with other stream model without approved ADR/change request.
- Do not use alternate two-term academic-period terminology in schema/API/UI.
- Do not hard-delete finalized grades, report cards, verified payments or audit logs.
- Do not call external email/push/PDF rendering inside an open DB transaction.
- Do not enqueue Celery task before commit if it needs just-written rows.
- Do not add microservice/message broker other than defined stack just because task seems complex.
- Do not introduce Kubernetes/Kafka/Elasticsearch for this single-school baseline.
- Do not access production DB manually to “fix” data outside documented service/runbook.
- Do not copy real student PII into tests/screenshots/issue trackers.
- Do not trust frontend hidden button as authorization.
## 72.3 Required PR Description
```text
PRD sections:
What changed:
Schema/migrations:
Permissions/object scope:
State transitions affected:
Background jobs/idempotency:
Audit events:
Tests added:
Deployment/migration risk:
Rollback/recovery notes:
Screenshots (synthetic data only):
```
## 72.4 Naming
- Python modules/functions: snake_case.
- Python classes/models: PascalCase.
- API JSON fields: snake_case.
- TypeScript variables/functions: camelCase; types/components PascalCase.
- DB table names use Django-generated/app-prefixed stable naming unless explicit `db_table` reason.
- Enum codes uppercase stable machine values.
- Use “trimester”/`trimester` consistently in code for the three-period academic model.
- Use `major` for IPA/IPS and `classroom`/`rombel` consistently.
- Use `guardian` rather than separate father/mother columns as core relationship.
## 72.5 Commit Discipline
- One logical change per commit/PR where practical.
- Migration committed with model change.
- Never rewrite an already-applied production migration; add a new migration.
- Data migration has tests or deterministic verification.
- Generated artifacts/dependencies follow repository policy; do not commit secrets/build caches.
# 73. PR Review Checklist
- [ ] PR maps to specific roadmap task and PRD section.
- [ ] No new scope outside final product.
- [ ] No alternate academic-period terminology introduced.
- [ ] Academic references include year/trimestre/grade/major/class context correctly.
- [ ] Object-level authorization exists.
- [ ] Database constraints cover concurrency-critical invariant.
- [ ] Transaction boundary is minimal and correct.
- [ ] External side effects after commit.
- [ ] Idempotency/retry semantics reviewed.
- [ ] Money uses Decimal.
- [ ] Files private/authorized.
- [ ] Logs scrub PII/secrets.
- [ ] List endpoint paginated/scoped.
- [ ] No N+1 obvious query.
- [ ] Audit event exists when required.
- [ ] Error code stable.
- [ ] OpenAPI updated.
- [ ] Frontend handles failure/offline appropriately.
- [ ] Unit/integration/permission tests added.
- [ ] Migration/rollback risk documented.
# 74. Configuration Examples
## 74.1 Academic Year Example
```text
AcademicYear: 2026
  start_date: <configured official/school date>
  end_date: <configured official/school date>

Trimestre 1
  number: 1
  cau_number: 1

Trimestre 2
  number: 2
  cau_number: 2

Trimestre 3
  number: 3
  cau_number: 3
```
Dates are deliberately not invented in this PRD; operator enters dates from the official/school calendar for that year.
## 74.2 Class Example
```text
X IPA 1  -> grade X, major IPA
X IPA 2  -> grade X, major IPA
X IPS 1  -> grade X, major IPS
XI IPA 1 -> grade XI, major IPA
XI IPS 1 -> grade XI, major IPS
XII IPA 1 -> grade XII, major IPA
XII IPS 1 -> grade XII, major IPS
```
## 74.3 SPP Example — Illustrative Only
```text
FeeType: SPP
FeePlan: <school configured amount> USD/month
Applicable: active students according to plan
Generation: one Invoice/period/student using deterministic generation_key
Due date: school configured day
Payment: cash or bank transfer
Partial payment: allowed if school enables
Correction: reversal, never delete verified payment
```
No fee amount is specified because the amount is a school configuration, not a software invariant.
# 75. Source and Benchmark References
The following sources informed architecture/feature benchmarking. They are references, not external runtime dependencies.
| Reference | URL |
| --- | --- |
| Ministry of Education Timor-Leste — official school calendar/download pages | https://www.moe.gov.tl/ |
| Timor-Leste Ministry of Education — Ensino Secundário information | https://www.moe.gov.tl/ |
| Timor-Leste official/government information — language/time context | https://timor-leste.gov.tl/ |
| Banco Central de Timor-Leste — currency information | https://www.bancocentral.tl/ |
| Django 5.2 release notes / LTS | https://docs.djangoproject.com/en/5.2/releases/5.2/ |
| Django deployment checklist | https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/ |
| Django security documentation | https://docs.djangoproject.com/en/5.2/topics/security/ |
| Django database transactions | https://docs.djangoproject.com/en/5.2/topics/db/transactions/ |
| Django REST Framework permissions | https://www.django-rest-framework.org/api-guide/permissions/ |
| Django REST Framework authentication | https://www.django-rest-framework.org/api-guide/authentication/ |
| Django REST Framework throttling | https://www.django-rest-framework.org/api-guide/throttling/ |
| Celery documentation | https://docs.celeryq.dev/ |
| Celery Django integration | https://docs.celeryq.dev/en/stable/django/ |
| PostgreSQL documentation | https://www.postgresql.org/docs/ |
| Next.js Progressive Web App guide | https://nextjs.org/docs/app/guides/progressive-web-apps |
| MDN Progressive Web Apps / Service Workers / IndexedDB | https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps |
| openSIS Classic GitHub | https://github.com/OS4ED/openSIS-Classic |
| Gibbon school platform | https://gibbonedu.org/ |
| Frappe Education | https://github.com/frappe/education |
## 75.1 Benchmark Conclusions Adopted
- SIS core should integrate student/staff, scheduling, attendance, grades, report cards/transcripts and communication rather than treating them as unrelated apps.
- Admissions and fee collection belong in the same lifecycle platform for a complete school-management system.
- Academic periods must be configurable; this project fixes the local structure to three trimestres and CAU 1–3.
- Portal access must be role-aware for staff, students and guardians.
- Bulk import/export is operationally necessary but must be validation-driven.
- Production Django requires explicit deployment/security configuration rather than `runserver` defaults.
- PWA offline behavior must account for inconsistent browser support and must not depend on experimental background capability alone.
# 76. Architecture Decision Records Required
| ADR | Decision |
| --- | --- |
| ADR-001 | Modular monolith instead of microservices |
| ADR-002 | Django/DRF backend |
| ADR-003 | PostgreSQL source of truth |
| ADR-004 | Session/CSRF browser authentication |
| ADR-005 | Three-trimestre + CAU model |
| ADR-006 | Historical StudentEnrollment |
| ADR-007 | IPA/IPS Major model |
| ADR-008 | Offline attendance mutation queue |
| ADR-009 | Finance invoice/allocation/reversal model |
| ADR-010 | Private object storage |
| ADR-011 | Celery async job model |
| ADR-012 | Report snapshot/revision model |
| ADR-013 | No multi-school tenancy |
| ADR-014 | No full LMS/payroll/general-ledger in scope |
Initial ADRs simply document already-final decisions in this PRD. Future ADR may clarify implementation detail but may not silently overturn product scope/business invariant.
# 77. Non-Negotiable Invariants
- **INV-01:** One production instance represents one SMA.
- **INV-02:** Academic period is trimestre; exactly 1,2,3 per active academic year.
- **INV-03:** CAU number matches its trimestre number.
- **INV-04:** Grade levels are X, XI, XII for this product.
- **INV-05:** Majors are IPA and IPS for current final scope.
- **INV-06:** Student academic placement history is never represented only by mutable current-class fields.
- **INV-07:** One student cannot have two active enrollments in the same academic year.
- **INV-08:** Classroom grade/major/year must match enrollment.
- **INV-09:** Teacher cannot record attendance/score for unassigned class without explicit substitution/delegation.
- **INV-10:** Finalized grades require reopen/revision to change.
- **INV-11:** Published report cards are revisioned snapshots.
- **INV-12:** National exam records are separate from CAU.
- **INV-13:** Invoice/payment canonical data lives in PostgreSQL.
- **INV-14:** Verified payment is never hard-deleted; correction uses reversal.
- **INV-15:** Retryable payment/invoice/offline commands are idempotent.
- **INV-16:** Private files cannot be anonymous by default.
- **INV-17:** Guardian access requires active StudentGuardian relationship.
- **INV-18:** Counseling data is restricted beyond generic teacher access.
- **INV-19:** Offline IndexedDB is cache/queue only, never source of truth.
- **INV-20:** Service worker never generic-caches authentication/finance/write APIs.
- **INV-21:** All sensitive writes are authorized server-side.
- **INV-22:** Production must have backup + tested restore process.
- **INV-23:** Database schema changes use migrations.
- **INV-24:** Production incidents are corrected through domain workflow, not silent SQL edits.
# 78. Final Completion Definition
The system described by this PRD is complete when all in-scope modules are implemented to their workflow/model/API/security/testing requirements; roadmap F0–F15 is complete; production go-live gates pass; and the school can execute the following lifecycle without external spreadsheet being required as the canonical source:
```text
Admissions
→ Student creation
→ X IPA/IPS enrollment
→ Schedule
→ Attendance
→ Trimestre 1 / CAU 1 / Report
→ Trimestre 2 / CAU 2 / Report
→ Trimestre 3 / CAU 3 / Report
→ Promotion
→ XI IPA/IPS
→ Three-trimestre cycle
→ Promotion
→ XII IPA/IPS
→ Three-trimestre cycle
→ National exam record
→ Graduation / Alumni archive

in parallel:
SPP invoice → payment → receipt → arrears/reversal when needed
BK/discipline → extracurricular → library → assets → communication → reports
```
This PRD is the final baseline. Configuration values such as exact calendar dates, SPP amounts, report wording, grading weights, and school branding are intentionally runtime configuration because they vary by school/year; they are not missing software features.
