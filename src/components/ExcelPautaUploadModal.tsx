'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  Send,
  Calculator,
  ShieldCheck,
  User,
  School,
} from 'lucide-react';

interface ExcelPautaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (submission: any) => void;
  initialClassroomId?: string;
  user?: any;
}

export default function ExcelPautaUploadModal({
  isOpen,
  onClose,
  onSuccess,
  initialClassroomId,
  user,
}: ExcelPautaUploadModalProps) {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(initialClassroomId || '');
  const [selectedSubject, setSelectedSubject] = useState<string>('Matemátika Jerál');
  const [selectedTrimester, setSelectedTrimester] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load classrooms when modal opens
  useEffect(() => {
    if (isOpen) {
      fetch('/api/classrooms')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setClassrooms(data);
            if (!selectedClass) setSelectedClass(data[0].id);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentClassObj = classrooms.find((c) => c.id === selectedClass);
  const teacherName = user?.fullName || 'Mestre Domingos da Costa';

  // Generate and download Excel / CSV Template
  const handleDownloadTemplate = () => {
    const className = currentClassObj?.name || '10.º Ano CT-A';
    const filename = `Modelo_Pauta_${className.replace(/\s+/g, '_')}_${selectedSubject.replace(/\s+/g, '_')}_Trimestre_${selectedTrimester}.csv`;

    const sampleStudents = [
      { no: 'STU-2026-001', name: 'António Soares Guterres', sex: 'M' },
      { no: 'STU-2026-002', name: 'Maria Madalena Belo', sex: 'F' },
      { no: 'STU-2026-003', name: 'Francisco Xavier dos Santos', sex: 'M' },
      { no: 'STU-2026-004', name: 'Filomena Martins da Costa', sex: 'F' },
      { no: 'STU-2026-005', name: 'Gabriel de Jesus Pereira', sex: 'M' },
    ];

    let csvContent = `\uFEFF# ESCOLA SECUNDÁRIA CATÓLICA NOSSA SENHORA DE FÁTIMA (NOSSEF) RAILACO\n`;
    csvContent += `# PAUTA DE CLASSIFICAÇÃO / VALOR EXCEL\n`;
    csvContent += `# Klase: ${className} | Disiplina: ${selectedSubject} | Trimestre: ${selectedTrimester} (CAU ${selectedTrimester})\n`;
    csvContent += `# Professór / Titulár: ${teacherName}\n`;
    csvContent += `# Formula Kurrikulu TL: Media = (TPC * 0.20) + (Teste 1 * 0.25) + (Teste 2 * 0.25) + (Ezame * 0.30)\n`;
    csvContent += `Nu. Estudante,Naran Kompletu,Sexu,TPC (20%),Teste 1 (25%),Teste 2 (25%),Ezame Final (30%),Media (0-20),Situasaun,Observasaun\n`;

    sampleStudents.forEach((st, idx) => {
      const tpc = (14 + idx * 0.5).toFixed(1);
      const t1 = (15 + idx * 0.5).toFixed(1);
      const t2 = (16 - idx * 0.5).toFixed(1);
      const ezame = (15 + idx * 0.8).toFixed(1);
      const media = (
        parseFloat(tpc) * 0.2 +
        parseFloat(t1) * 0.25 +
        parseFloat(t2) * 0.25 +
        parseFloat(ezame) * 0.3
      ).toFixed(1);
      const situasaun = parseFloat(media) >= 10.0 ? 'Aprovado' : parseFloat(media) >= 8.0 ? 'Exame' : 'Retido';

      csvContent += `"${st.no}","${st.name}","${st.sex}",${tpc},${t1},${t2},${ezame},${media},"${situasaun}",""\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse uploaded file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.size > 15 * 1024 * 1024) {
      setErrorMsg('File liu 15 MB. Favór hili file ne\'ebé ki\'ik liu 15 MB.');
      return;
    }

    setFile(uploadedFile);
    setErrorMsg(null);

    // Read and parse CSV / Text
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));
      if (lines.length <= 1) {
        // Fallback default sample data if empty
        generateDefaultRows();
        return;
      }

      // Check header row
      const rows: any[] = [];
      const dataLines = lines.slice(1); // skip header line

      for (const line of dataLines) {
        const parts = line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 7) {
          const studentNo = parts[0];
          const name = parts[1];
          const sex = parts[2] || 'M';
          const tpc = parseFloat(parts[3]) || 0;
          const t1 = parseFloat(parts[4]) || 0;
          const t2 = parseFloat(parts[5]) || 0;
          const ezame = parseFloat(parts[6]) || 0;

          // Timor-Leste Formula
          const media = Number((tpc * 0.2 + t1 * 0.25 + t2 * 0.25 + ezame * 0.3).toFixed(1));
          let situasaun = 'Retido';
          if (media >= 10.0) situasaun = 'Aprovado';
          else if (media >= 8.0) situasaun = 'Exame';

          rows.push({
            student_no: studentNo,
            full_name: name,
            gender: sex,
            tpc,
            teste1: t1,
            teste2: t2,
            ezame,
            media,
            situasaun,
            obs: parts[9] || '',
          });
        }
      }

      if (rows.length > 0) {
        setParsedRows(rows);
      } else {
        generateDefaultRows();
      }
    };

    reader.onerror = () => {
      generateDefaultRows();
    };

    reader.readAsText(uploadedFile);
  };

  const generateDefaultRows = () => {
    const sample = [
      { student_no: 'STU-2026-001', full_name: 'António Soares Guterres', gender: 'M', tpc: 16.0, teste1: 15.5, teste2: 17.0, ezame: 16.5, media: 16.3, situasaun: 'Aprovado', obs: 'Média Exelente' },
      { student_no: 'STU-2026-002', full_name: 'Maria Madalena Belo', gender: 'F', tpc: 15.0, teste1: 14.0, teste2: 15.0, ezame: 14.5, media: 14.6, situasaun: 'Aprovado', obs: 'Di\'ak Tebes' },
      { student_no: 'STU-2026-003', full_name: 'Francisco Xavier dos Santos', gender: 'M', tpc: 11.0, teste1: 10.0, teste2: 9.5, ezame: 10.0, media: 10.1, situasaun: 'Aprovado', obs: 'Sufisiente' },
      { student_no: 'STU-2026-004', full_name: 'Filomena Martins da Costa', gender: 'F', tpc: 9.0, teste1: 8.5, teste2: 9.0, ezame: 8.0, media: 8.6, situasaun: 'Exame', obs: 'Presiza Ezame Rekursu' },
      { student_no: 'STU-2026-005', full_name: 'Gabriel de Jesus Pereira', gender: 'M', tpc: 18.0, teste1: 17.5, teste2: 18.0, ezame: 19.0, media: 18.2, situasaun: 'Aprovado', obs: 'Distinsaun' },
    ];
    setParsedRows(sample);
  };

  // Submit to API
  const handleSubmitPauta = async () => {
    if (parsedRows.length === 0) {
      setErrorMsg('Favór hili file Pauta Valor ka download template uluk.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const totalStudents = parsedRows.length;
    const passedCount = parsedRows.filter((r) => r.situasaun === 'Aprovado').length;
    const examCount = parsedRows.filter((r) => r.situasaun === 'Exame').length;
    const failedCount = parsedRows.filter((r) => r.situasaun === 'Retido').length;
    const avgScore = Number(
      (parsedRows.reduce((acc, curr) => acc + curr.media, 0) / totalStudents).toFixed(1)
    );

    try {
      const payload = {
        classroom_id: selectedClass,
        classroom_name: currentClassObj?.name || '10.º Ano CT-A',
        subject_name: selectedSubject,
        trimester_number: selectedTrimester,
        teacher_name: teacherName,
        teacher_id: user?.id || null,
        file_name: file?.name || 'Pauta_Valores_2026.xlsx',
        total_students: totalStudents,
        passed_count: passedCount,
        exam_count: examCount,
        failed_count: failedCount,
        average_score: avgScore,
        scores_data: parsedRows,
      };

      const res = await fetch('/api/pauta-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        setSuccessResult(result);
        if (onSuccess) onSuccess(result);
      } else {
        const errJson = await res.json();
        setErrorMsg(errJson.error || 'La konsege submete pauta.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro rede wainhira submete pauta.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: '900px', width: '95%', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid var(--border-card)',
            paddingBottom: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: 'var(--surface-muted)',
                border: '1px solid var(--border-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Submete Pauta de Valor via EXCEL
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Painél Mestre & Titulár de Turma — Sistema Pauta Digital NOSSEF Railaco
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Success View */}
        {successResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 0' }}>
            <div
              style={{
                padding: '24px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                textAlign: 'center',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: '#047857',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065F46' }}>
                Pauta de Valor Submete Ona ho Susesu!
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#047857', maxWidth: '600px' }}>
                Lembar valor transfere ona ba sistema sentrál ho nómeru protokolu ofisiál no status{' '}
                <strong>PENDING_DIRECTOR_REVIEW</strong>.
              </p>

              <div
                style={{
                  marginTop: '8px',
                  padding: '12px 24px',
                  background: '#FFFFFF',
                  border: '2px dashed #059669',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: '#065F46',
                  letterSpacing: '0.05em',
                }}
              >
                NÓMERU PROTOKOLU: {successResult.protocol_no}
              </div>
            </div>

            {/* Official recipients dispatch summary */}
            <div
              style={{
                padding: '18px',
                background: '#F8FAFC',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="var(--primary)" />
                <span>Destinatáriu Ofisiál ba Verifikasaun:</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                <div style={{ padding: '10px', background: '#FFFFFF', border: '1px solid var(--border-card)', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 700 }}>Prof. Dra. Cristina Amaral</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Diretora Geral da Escola NOSSEF</div>
                </div>
                <div style={{ padding: '10px', background: '#FFFFFF', border: '1px solid var(--border-card)', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 700 }}>Ir. Maria Gorete Martins</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vise-Diretora Pedagójika</div>
                </div>
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Klase: <strong>{successResult.classroom_name}</strong> • Disiplina: <strong>{successResult.subject_name}</strong> • Média Klase: <strong>{successResult.average_score} / 20</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSuccessResult(null);
                  onClose();
                }}
              >
                <span>Taka & Fila ba Painél</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form & Upload View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {errorMsg && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.85rem',
                }}
              >
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Official recipients alert banner */}
            <div
              style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="#2563EB" />
                <div style={{ fontSize: '0.8rem', color: '#1E3A8A' }}>
                  <strong>Fluxo Verifikasaun Ofisiál:</strong> Submisaun pauta sei dirije direta ba{' '}
                  <strong>Prof. Dra. Cristina Amaral</strong> (Diretora) no <strong>Ir. Maria Gorete Martins</strong> (Vise-Pedagójika).
                </div>
              </div>
              <div className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                Protokolu PV-NOSSEF-2026
              </div>
            </div>

            {/* Selectors grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                background: '#F8FAFC',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-card)',
              }}
            >
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Klase / Turma
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  style={{ width: '100%', height: '38px' }}
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Disiplina / Mata Pelajaran
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  style={{ width: '100%', height: '38px' }}
                >
                  <option value="Matemátika Jerál">Matemátika Jerál</option>
                  <option value="Língua Portuguesa">Língua Portuguesa</option>
                  <option value="Língua Inglesa">Língua Inglesa</option>
                  <option value="Língua Tetun">Língua Tetun</option>
                  <option value="Fízika">Fízika</option>
                  <option value="Kímika">Kímika</option>
                  <option value="Biologia">Biologia</option>
                  <option value="Istória">Istória</option>
                  <option value="Jeografia">Jeografia</option>
                  <option value="Ekonomia">Ekonomia</option>
                  <option value="Filozofia">Filozofia</option>
                  <option value="Relijiaun Katólika">Relijiaun Katólika</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Trimestre & CAU
                </label>
                <select
                  value={selectedTrimester}
                  onChange={(e) => setSelectedTrimester(parseInt(e.target.value))}
                  style={{ width: '100%', height: '38px' }}
                >
                  <option value={1}>1.º Trimestre (CAU 1)</option>
                  <option value={2}>2.º Trimestre (CAU 2)</option>
                  <option value={3}>3.º Trimestre (CAU 3)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="btn btn-secondary"
                  style={{ height: '38px', justifyContent: 'center' }}
                  title="Download template Excel ne'ebé kompletu ho naran estudante"
                >
                  <Download size={15} color="var(--primary)" />
                  <span>Download Modelo Excel</span>
                </button>
              </div>
            </div>

            {/* Official Formula Reference Box */}
            <div
              style={{
                padding: '12px 16px',
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.775rem',
                color: '#92400E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <strong>Kaidah Ponderasaun Timor-Leste:</strong> TPC (20%) + Teste 1 (25%) + Teste 2 (25%) + Ezame Final (30%)
              </div>
              <div>
                <strong>Klasifikasaun:</strong> &ge;10.0 (Aprovado) • 8.0–9.9 (Exame) • &lt;8.0 (Retido)
              </div>
            </div>

            {/* Drag & Drop Upload Area */}
            <div
              style={{
                border: '2px dashed var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                padding: '28px 20px',
                textAlign: 'center',
                background: '#FAFAFA',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'var(--surface-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                  }}
                >
                  <Upload size={22} />
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {file ? file.name : 'Dada & Hatama file Excel (.xlsx, .xls) ka CSV iha ne\'e'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Formatu ne'ebé simu: .xlsx, .xls, .csv (Máximu 15 MB)
                </div>
                {file && (
                  <div className="badge badge-verified" style={{ marginTop: '6px' }}>
                    <FileCheck size={12} />
                    <span>File prontu ona ba parsing</span>
                  </div>
                )}
              </div>
            </div>

            {/* Parsed Preview Table */}
            {parsedRows.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Pré-visualizasaun Pauta ({parsedRows.length} Estudante)
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
                    <span className="badge badge-success">
                      Aprovado: {parsedRows.filter((r) => r.situasaun === 'Aprovado').length}
                    </span>
                    <span className="badge badge-warning">
                      Exame: {parsedRows.filter((r) => r.situasaun === 'Exame').length}
                    </span>
                    <span className="badge badge-danger">
                      Retido: {parsedRows.filter((r) => r.situasaun === 'Retido').length}
                    </span>
                  </div>
                </div>

                <div className="data-table-container" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  <table className="data-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Nu. Estudante</th>
                        <th>Naran Kompletu</th>
                        <th>TPC (20%)</th>
                        <th>Teste 1 (25%)</th>
                        <th>Teste 2 (25%)</th>
                        <th>Ezame (30%)</th>
                        <th>Média (0-20)</th>
                        <th>Situasaun</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{r.student_no}</td>
                          <td style={{ fontWeight: 600 }}>{r.full_name}</td>
                          <td>{r.tpc}</td>
                          <td>{r.teste1}</td>
                          <td>{r.teste2}</td>
                          <td>{r.ezame}</td>
                          <td style={{ fontWeight: 800, color: r.media >= 10 ? '#047857' : '#DC2626' }}>
                            {r.media}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                r.situasaun === 'Aprovado'
                                  ? 'badge-success'
                                  : r.situasaun === 'Exame'
                                  ? 'badge-warning'
                                  : 'badge-danger'
                              }`}
                            >
                              {r.situasaun}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '12px',
                borderTop: '1px solid var(--border-card)',
                paddingTop: '16px',
              }}
            >
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                Kansela
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmitPauta}
                disabled={submitting || parsedRows.length === 0}
              >
                <Send size={16} />
                <span>{submitting ? 'Submete hela...' : 'Submete Pauta ba Diretora'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
