# Dokumen Spesifikasi Produk Akhir (PRD) & Ringkasan Sistem Terpadu
## SIMS SMA Timor-Leste — Escola Secundária Católica "Nossa Senhora de Fátima" (NOSSEF) Railaco

---

## 1. Ringkasan Eksekutif (Executive Summary)
**SIMS SMA Timor-Leste (NOSSEF System)** adalah Sistem Informasi Manajemen Sekolah Terpadu (*Integrated School Information Management System*) berbasis Web modern yang dirancang dan disesuaikan secara menyeluruh untuk tata kelola operasional akademik, administratif, keuangan, pastoral, dan kesiswaan di **Escola Secundária Católica Nossa Senhora de Fátima (NOSSEF) Railaco, Kotamadya Ermera, Timor-Leste**.

Sistem ini mengadopsi standar kurikulum nasional Kementerian Pendidikan Timor-Leste (*Ministério da Educação, Juventude e Desporto - MEJD/MEC*) serta tradisi pembinaan nilai-nilai Katolik Ignasian/Misi Jesuita. Platform ini sepenuhnya responsif, siap produksi (*production-ready*), mendukung kemampuan offline (*PWA Offline Capability*), serta menyediakan antarmuka 4 bahasa (*Tetun, Português, Bahasa Indonesia, English*).

---

## 2. Arsitektur & Tumpukan Teknologi (Tech Stack)

### A. Frontend
- **Framework Utama:** React 19 dengan TypeScript dan Vite (Single Page Application super cepat).
- **Styling & Desain UI:** Tailwind CSS v4, Lucide React (ikonografi modern), font Outfit & Plus Jakarta Sans, mikro-animasi transisi halus.
- **Visualisasi & Interaktivitas:** Canvas Confetti, Diagram Alur Kurikulum SVG, Diagram Struktur Organisasi Interaktif, Modal Cetak & Ekspor Dokumen Resmi.

### B. Backend & Integrasi Data
- **Server:** Node.js & Express.js (`server.js`) dengan endpoint terintegrasi.
- **Database & Penyimpanan:** Google Firebase v12 (Firestore Data Persistence, Storage, Rules) dan LocalStorage/IndexedDB state management.
- **AI Engine (Opsional):** Google GenAI SDK (`@google/genai`) terkonfigurasi pada proxy server.

### C. Konteks State Global (State Management Architecture)
1. `DataContext`: Pusat reaktif seluruh entitas sekolah (Siswa, Guru, Staf, Kelas/Turma, Nilai/Grades, Keuangan/SPP, Jadwal, Absensi, Perpustakaan, Aset, Pengumuman, Organisasi Korenossef, Ekipa Pastoral, Ekipa Drum Band).
2. `AuthContext`: Manajemen autentikasi pengguna, multi-peran (RBAC), pembatasan akses data sensitif (*read-only guards*), dan identitas profil pengguna aktif.
3. `I18nContext`: Internasionalisasi terintegrasi 4 bahasa resmi (*Tetun, Portugis, Indonesia, Inggris*).
4. `OfflineContext`: Mesin deteksi jaringan online/offline PWA, antrean mutasi offline (*mutation queue*), dan sinkronisasi otomatis (*auto-sync*).
5. `ZoomContext`: Pengatur skala pembesaran tampilan antarmuka (85% hingga 160%) untuk kenyamanan pengguna di semua layar dan perangkat.

---

## 3. Matriks Peran Pengguna & Hak Akses (RBAC Matrix)

Sistem menerapkan prinsip *Least Privilege Role-Based Access Control* yang ketat:

| Kode Peran | Peran Pengguna | Hak Akses Utama |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Administrator Sistem Pusat | Akses penuh seluruh modul, konfigurasi sistem, database, audit log, dan kontrol pengguna. |
| `PRINCIPAL` | Diretora Geral da Escola | Pengawasan eksekutif, verifikasi keuangan, peninjauan dan persetujuan nilai akhir (*Review Pauta Valor*), penerbitan rapor, struktur organisasi. |
| `CURRICULUM_ADMIN` | Vise-Diretora Pedagójika / Wakasek Kurikulum | Pengelolaan kurikulum, penetapan kalender akademik, penugasan mengajar (*Teaching Assignments*), validasi pauta nilai guru, ujian sekolah. |
| `SECRETARY` | Sekretaria da Escola | Manajemen data pokok siswa, penerimaan siswa baru (PPDB/Admissions), arsip administrasi, surat pengumuman, dan cetak kartu. |
| `FINANCE_ADMIN` | Finansas & Tesoureiro Eskola | Penetapan tabel biaya resmi (*Official Fee Table*), penagihan SPP (Etapa 1 & 2), verifikasi bukti pembayaran, rekapitulasi tunggakan, laporan keuangan. |
| `TEACHER` | Professór / Guru Mata Pelajaran | Akses jadwal mengajar, kehadiran siswa, profil pribadi 360°, dan **Fitur Khusus Upload Nilai Siswa Format EXCEL**. Mode proteksi *read-only* untuk modul non-akademik. |
| `HOMEROOM_TEACHER` | Profesor da Turma / Wali Kelas (*Titulár de Turma*) | Manajemen kelas perwalian (10, 11, 12 CT & CSH), akomodasi ketua kelas (*Chefe de Turma*), pendampingan siswa, dan **Fitur Khusus Upload Nilai Siswa Format EXCEL**. |
| `COUNSELOR` | Konselor Bimbingan Konseling (BK) | Catatan konseling siswa, penanganan pelanggaran disiplin, pembinaan karakter. |
| `LIBRARIAN` | Bibliotekáriu / Pengelola Perpustakaan | Katalog buku, peminjaman, pengembalian, status sirkulasi buku. |
| `ASSET_OFFICER` | Ofisiál Patrimóniu & Logístika | Inventarisasi sarana prasarana, ruang kelas, kondisi fasilitas sekolah. |
| `STUDENT` | Estudante / Siswa NOSSEF | *Strictly Read-Only*: Profil pribadi 360°, kartu pelajar digital, melihat nilai & rapor, jadwal belajar, status beasiswa, dan absensi diri. Dilarang mengubah data apa pun. |
| `GUARDIAN` | Inan-Aman / Orang Tua Siswa | *Strictly Read-Only*: Memantau tagihan SPP, progres belajar anak, presensi harian, dan kontak resmi wali kelas (*Profesor da Turma*). |
| `PUBLIC_GUEST` | Publik / Calon Siswa Baru | Akses portal publik beranda sekolah, pengajuan formulir PPDB online, verifikasi kelulusan seleksi. |

---

## 4. Fitur Khusus Baru: Upload Nilai Siswa Format EXCEL untuk Profesor & Profesor da Turma

Fitur ini dikembangkan secara khusus untuk menjawab kebutuhan efisiensi para guru mata pelajaran (*Professór*) dan wali kelas (*Profesor da Turma / Titulár de Turma*) dalam menyerahkan lembar nilai (*Pauta de Classificação / Valor*) ke pimpinan sekolah.

### A. Alur Kerja & Cara Kerja Fitur:
1. **Aksesibilitas Multi-Titik:**
   - **Tombol Cepat di Navbar:** Guru dan Wali Kelas memiliki tombol cepat *`[Upload Valor Excel / Upload Valor Turma]`* di bagian navigasi atas yang dapat diakses dari halaman mana pun.
   - **Widget Khusus di Dashboard:** Kartu sambutan eksklusif di dashboard guru: *"Painél Professór & Profesor da Turma: Submete Pauta Valor via EXCEL"*, langsung menampilkan nama guru dan kelas perwalian terkait.
   - **Menu Profesor da Turma:** Tombol unggah langsung di kartu masing-masing kelas perwalian (*10º CT-A, 10º CT-B, 10º CSH, 11º CT, 11º CSH, 12º CT, 12º CSH*).
   - **Menu Rekapitulasi Nilai & Caderneta:** Tombol terintegrasi di modul buku nilai (*GradesView*).

2. **Dukungan Format File Fleksibel:**
   - Menerima file **Excel (.xlsx, .xls)** dan **CSV (.csv)** hingga ukuran 15 MB.
   - Dilengkapi *Drag-and-Drop Zone* yang responsif.
   - Deteksi baris header dan parsing cerdas untuk kolom Nomor Siswa, Nama, Nilai TPC, Teste 1, Teste 2, Ezame, dan Observasi.

3. **Generator & Unduh Template Otomatis (*Modelo Excel Pauta Valor*):**
   - Guru dapat mengklik tombol **"Download Modelo Excel"**.
   - Sistem secara otomatis membuat file template siap pakai yang **sudah terisi data seluruh nama dan nomor siswa dari kelas yang dipilih**, mata pelajaran yang diajar, dan rumus bobot nilai resmi Timor-Leste.

4. **Kaidah Komponen Penilaian Resmi Kurikulum Timor-Leste:**
   - **TPC / Trabalho de Casa:** Bobot 20%
   - **Teste Parcial 1:** Bobot 25%
   - **Teste Parcial 2:** Bobot 25%
   - **Ezame Final Trimestral:** Bobot 30%
   - **Média Final (Skala 0 - 20):** 
     $$\text{Média} = (\text{TPC} \times 0.20) + (\text{Teste 1} \times 0.25) + (\text{Teste 2} \times 0.25) + (\text{Ezame} \times 0.30)$$
   - **Klasifikasi Situasi Siswa:**
     - $\ge 10.0$: *Aprovado* (Lulus)
     - $8.0 - 9.9$: *Exame* (Remedial / Ujian Ulang)
     - $< 8.0$: *Retido* (Tidak Lulus / Tinggal Kelas)

5. **Penomoran Protokol Resmi & Workflow Verifikasi:**
   - Setiap submisi langsung mendapatkan **Nomor Protokol Resmi** unik (*contoh: `PV-NOSSEF-2026-8914`*).
   - Pengiriman digital resmi ditujukan langsung ke:
     - **Prof. Dra. Cristina Amaral** (*Diretora Geral da Escola*)
     - **Ir. Maria Gorete Martins** (*Vise-Diretora Pedagójika*)
   - Status submisi terlacak transparan: `PENDING_DIRECTOR_REVIEW` $\rightarrow$ `APPROVED` $\rightarrow$ `RETURNED_FOR_REVISION`.
   - Riwayat submisi dapat ditinjau kembali di tab *"Istóriku Submisaun"* dan tabel rekapitulasi pauta guru (`ValorEstudanteExcelView`).

---

## 5. Rincian Modul & Fungsionalitas Sistem Lengkap

### Modul 1: Dashboard & Analitik Eksekutif (`DashboardView`)
- **Statistik Kunci:** Total siswa aktif, guru aktif, kelas, tingkat presensi harian (%), pendapatan SPP, dan tunggakan.
- **Arsip Historis 2002-2026:** Ringkasan akumulatif data siswa selama 24 tahun berdirinya NOSSEF Railaco.
- **Top 5 Ranking Jeral:** Kartu peringkat nilai siswa tertinggi lintas jurusan CT dan CSH.
- **Organigram Interaktif:** Visualisasi struktur kepemimpinan sekolah NOSSEF (`EstruturaEskolaNossef`).
- **Ringkasan Biaya Cepat:** Tabel tarif SPP Etapa 1 dan Etapa 2 per jenjang kelas 10, 11, dan 12.

### Modul 2: Manajemen Siswa (`StudentsView`)
- **Tabel Siswa Terpadu:** Filter berdasarkan Kelas (10, 11, 12), Jurusan (CT / CSH), Status (Aktif / Lisensa), dan Jenis Kelamin.
- **Siswa Penerima Beasiswa (`BolseiruTableView`):** Kategori beasiswa Mérito, Institusionál Companhia de Jesus, dan Apoio Sosiál Ermera.
- **Ketua Kelas (`ChefeDeTurmaTableView`):** Penetapan dan pelacakan siswa pemimpin kelas perwalian.
- **Arsip Siswa Historis 2002-2026 (`DadusEstudanteNossef2002_2026`):** Rekaman digital data alumni dan siswa per angkatan sejak tahun 2002.
- **Dokumen Siswa Digital:** Pembuatan Kartu Pelajar Digital ber-QR Code, Foto 3x4 formal berlatar belakang merah/biru, serta sertifikat prestasi.

### Modul 3: Manajemen Guru & Profesor da Turma (`TeachersView`)
- **Klasifikasi Guru Timor-Leste:**
  - *Funcionário Público (PNS)*: Guru tetap ber-NIP negara.
  - *Kontratadu*: Guru kontrak Kementerian Pendidikan (*MEC Termo Rezolvativu*).
  - *Part-Time*: Guru honorer/paruh waktu.
- **Profil Guru 360°:** Riwayat pendidikan, spesialisasi ijazah, dokumen SK pengangkatan, beban jam mengajar per minggu (*Teaching Hours/Horas Semana Modal*).
- **Bagian Khusus Profesor da Turma (`ProfesorDaTurmaSection`):** Penugasan wali kelas untuk 9 rombongan belajar utama NOSSEF, informasi kontak resmi darurat, ekspor data wali kelas ke CSV/PDF, dan integrasi pengunggahan nilai siswa.

### Modul 4: Akademik & Kurikulum (`AcademicsView`)
- **Diagram Kurikulum NOSSEF:** Peta alur kurikulum IPA (*Ciências e Tecnologias - CT*) dan IPS (*Ciências Sociais e Humanidades - CSH*).
- **Mata Pelajaran & Ruang Kelas:** Pengaturan kode mata pelajaran, jam kredit pelajaran, ruang kelas fisik (*Rooms*), dan periode bel (*Bell Periods*).
- **Tahun Ajaran & Trimestre:** Pengaturan 3 periode trimester (*1º, 2º, no 3º Trimestre/Periodu*) sesuai kalender pendidikan Timor-Leste.
- **Penugasan Mengajar:** Matriks jadwal guru mata pelajaran per rombel.

### Modul 5: Penilaian, Buku Nilai & Rapor (`GradesView`, `ReportCardsView`)
- **Rekapitulaasaun Valór Format Excel Resmi (`RekapitulacaoValoresExcel`):** Lembar nilai elektronik berformat grid Excel lengkap dengan baris remedial, nilai rata-rata kelas, dan ranking otomatis.
- **Tabel Pauta Guru Excel (`ValorEstudanteExcelView`):** Monitoring penyerahan nilai dari seluruh guru untuk verifikasi kepala sekolah.
- **Caderneta por Disciplina:** Buku nilai per mata pelajaran dengan kalkulasi otomatis komponen CAU/formatif dan ujian.
- **Penerbitan Rapor Digital:** Rapor komprehensif trimesteran dilengkapi catatan wali kelas, rekap kehadiran, nilai huruf, ranking kelas, dan token verifikasi keaslian.

### Modul 6: Keuangan & Pembayaran SPP (`FinanceView`)
- **Tabel Biaya Resmi (`OfficialFeeTableView`):** Standar tarif sekolah:
  - Kelas 10 (Siswa Baru): $148.50/tahun ($85.50 Etapa 1 / $63.00 Etapa 2).
  - Kelas 11 (Lanjutan): $132.00/tahun ($69.00 Etapa 1 / $63.00 Etapa 2).
  - Kelas 12 (Finalis): $137.00/tahun ($74.00 Etapa 1 / $63.00 Etapa 2).
- **Pencatatan Pembayaran:** Pembayaran tunai via kasir/tesoureiro sekolah maupun transfer perbankan (BNU Timor, Mandiri Dili, Telemor Mosan).
- **Lampiran Bukti Digital:** Modal peninjauan bukti transfer bank digital (`FinanceImageModal`).

### Modul 7: Penerimaan Siswa Baru / Admissions (`AdmissionsView`)
- **Portal PPDB Online:** Pendaftaran publik calon siswa baru, unggah berkas ijazah pre-sekundária, nilai rata-rata, dan data orang tua.
- **Verifikasi & Seleksi:** Skoring tes masuk, penentuan ranking otomatis, dan status penerimaan (*Submitted $\rightarrow$ Verified $\rightarrow$ Accepted*).
- **Fitur Batch Masuk Kelas 10:** Fitur pemindahan calon siswa yang diterima langsung ke rombel Kelas 10 CT atau 10 CSH secara masal (*BatchSendToGrade10Modal*).

### Modul 8: Organisasi & Ekstrakurikuler Khas NOSSEF
- **KORENOSSEF (`KorenossefView`):** Organisasi Dewan Kepemimpinan Siswa Katolik NOSSEF Railaco (Geração cohorts, pembagian divisi, sertifikat kepemimpinan, dan dewan kerja siswa).
- **Ekipa Pastoral Eskolár (`PastoralView`):** Tim pelayanan rohani sekolah (Liturgi Misa, Paduan Suara Musik Sakra, Pelayanan Acólitos, Retret Spiritual, dan Bakti Sosial Karitas).
- **Ekipa Drum Band / Fanfarra (`DrumBandView`):** Unit marching band kebanggaan sekolah (Naipe Perkusi, Snare, Bass, Liras & Sinos, Trompet Fanfarra, Mayorettes, dan Pasukan Pengibar Bendera).

### Modul 9: Layanan Pendukung Operasional
- **AttendanceView:** Presensi harian siswa dan guru, rekap sakit, izin, dan alpa.
- **ScheduleView:** Matriks jadwal pelajaran mingguan per kelas dan per guru.
- **LibraryView:** Katalog buku perpustakaan sekolah dan sirkulasi peminjaman.
- **CounselingView:** Layanan bimbingan konseling dan catatan kedisiplinan siswa.
- **AnnouncementsView:** Papan pengumuman elektronik sekolah.
- **AssetsView:** Inventarisasi gedung, laboratorium, dan sarana prasarana sekolah.
- **AuditView:** Catatan log audit forensik seluruh mutasi data penting dalam sistem.
- **UsersControlView:** Tata kelola akun pengguna, reset sandi, penugasan peran RBAC.

---

## 6. Standar Mutu, Integritas Data & Validasi Bisnis (INT-001 s/d INT-026)

Sistem telah dilengkapi dengan mekanisme validasi integritas otomatis:
1. **INT-001 s/d INT-005:** Integritas relasi data siswa, NISN nasional (EMIS-TL), dan rombongan belajar.
2. **INT-006 s/d INT-010:** Validasi konsistensi nilai pauta terhadap skala baku 0 - 20 kurikulum nasional.
3. **INT-011 s/d INT-015:** Validasi penugasan wali kelas tunggal (satu guru hanya dapat menjadi wali kelas pada satu kelas dalam tahun ajaran yang sama).
4. **INT-016 s/d INT-020:** Konsistensi keuangan dan pelunasan tagihan SPP Etapa 1 dan Etapa 2.
5. **INT-021 s/d INT-026:** Verifikasi sinkronisasi offline PWA, token sertifikat, dan kepatuhan peran pengguna (RBAC).

---

## 7. Kesimpulan & Status Kesiapan Produksi (Production Status)

Sistem Informasi Manajemen Sekolah **SIMS SMA Timor-Leste (NOSSEF Railaco)** telah berhasil diimplementasikan secara komprehensif, teruji bebas dari konflik dependensi, dan memiliki arsitektur yang kuat untuk operasional jangka panjang. 

Dengan penambahan **fitur khusus pengunggahan nilai siswa berformat EXCEL untuk Profesor dan Profesor da Turma**, kolaborasi antara dewan guru dan pimpinan sekolah (Direktur dan Wakil Direktur) menjadi jauh lebih cepat, akurat, dan terdokumentasi secara resmi dengan standar protokol digital.

---
*Dokumen ini merupakan catatan spesifikasi resmi produk akhir (PRD) sistem SIMS SMA Timor-Leste (NOSSEF Railaco).*
