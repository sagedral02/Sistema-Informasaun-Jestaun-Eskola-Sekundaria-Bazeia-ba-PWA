'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Lock,
  Unlock,
  Calculator,
  Plus,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  FileSpreadsheet,
  Upload,
  Download,
  Eye,
  Check,
  RotateCcw,
  ShieldCheck,
  X,
  FileCheck,
} from 'lucide-react';
import { TETUN } from '@/lib/tetun';
import ExcelPautaUploadModal from '@/components/ExcelPautaUploadModal';

export default function AssessmentGradebookPage() {
  const [activeTab, setActiveTab] = useState<'gradebook' | 'excel_pauta' | 'curriculum'>('gradebook');
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [trimestres, setTrimestres] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTrimester, setSelectedTrimester] = useState('');
  const [gradebookData, setGradebookData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [locking, setLocking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Excel Pauta Submissions state
  const [pautaSubmissions, setPautaSubmissions] = useState<any[]>([]);
  const [showPautaModal, setShowPautaModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [clsRes, triRes] = await Promise.all([
          fetch('/api/classrooms'),
          fetch('/api/trimestres'),
        ]);

        if (clsRes.ok) {
          const clsData = await clsRes.json();
          setClassrooms(clsData);
          if (clsData.length > 0) setSelectedClass(clsData[0].id);
        }
        if (triRes.ok) {
          const triData = await triRes.json();
          setTrimestres(triData);
          if (triData.length > 0) setSelectedTrimester(triData[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
    loadSubmissions();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedTrimester) {
      loadGradebook();
    }
  }, [selectedClass, selectedTrimester]);

  async function loadGradebook() {
    setLoading(true);
    try {
      const res = await fetch(`/api/gradebook?classroom_id=${selectedClass}&trimester_id=${selectedTrimester}`);
      if (res.ok) {
        setGradebookData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadSubmissions() {
    try {
      const res = await fetch('/api/pauta-submissions');
      if (res.ok) {
        const data = await res.json();
        setPautaSubmissions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleCalculateGrades = async () => {
    setCalculating(true);
    setMessage(null);
    try {
      const res = await fetch('/api/term-grades/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academic_year_id: 'a91d24c0-449e-4a6c-b362-e64eb37478d1',
          trimester_id: selectedTrimester,
          classroom_id: selectedClass,
          subject_offering_id: 'c8f6120b-928d-429d-92a1-fa363f03bda9',
        }),
      });

      if (res.ok) {
        setMessage('Nota trimestre no ponderasaun CAU konsege kalkula ona ho susesu!');
        loadGradebook();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  const handleLockGrades = async () => {
    setLocking(true);
    setMessage(null);
    try {
      const res = await fetch('/api/term-grades/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trimester_id: selectedTrimester,
          subject_offering_id: 'c8f6120b-928d-429d-92a1-fa363f03bda9',
        }),
      });

      if (res.ok) {
        setMessage('Nota final tranka ona ho susesu (Locked). Labele muda tan sein autorizasaun espesiál!');
        loadGradebook();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLocking(false);
    }
  };

  const handleReviewSubmission = async (id: string, status: 'APPROVED' | 'RETURNED_FOR_REVISION') => {
    setReviewingId(id);
    try {
      const notes = status === 'APPROVED' ? 'Pauta aprovadu husi Diretora Geral & Vise-Pedagójika.' : 'Favór halo revizaun ba nota teste 2.';
      const res = await fetch('/api/pauta-submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, director_notes: notes }),
      });
      if (res.ok) {
        setMessage(`Pauta ho status ${status === 'APPROVED' ? 'APROVADU' : 'FILA BA REVIZAUN'} atualiza ona ho susesu!`);
        loadSubmissions();
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Kadiadernu Nota, Ezame CAU 1–3 & Pauta Valor EXCEL
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Avaliasaun formativa, kalkulasaun média ho ezame CAU, submisaun pauta EXCEL, no tranka nota ofisiál
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowPautaModal(true)} className="btn btn-primary">
            <Upload size={16} />
            <span>Upload Valor Excel</span>
          </button>
          <button
            onClick={handleCalculateGrades}
            disabled={calculating}
            className="btn btn-secondary"
          >
            <Calculator size={16} color="#f59e0b" />
            <span>{calculating ? 'Kalkula hela...' : 'Kalkula Nota Trimestre'}</span>
          </button>
          <button
            onClick={handleLockGrades}
            disabled={locking}
            className="btn btn-secondary"
          >
            <Lock size={16} />
            <span>{locking ? 'Tranka hela...' : 'Tranka Nota'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className="animate-fade-in"
          style={{
            background: 'var(--surface-active)',
            border: '1px solid var(--primary)',
            color: 'var(--primary)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('gradebook')}
          className={`btn ${activeTab === 'gradebook' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <BookOpen size={16} />
          <span>Matrís Kadiadernu Nota (Caderneta)</span>
        </button>
        <button
          onClick={() => setActiveTab('excel_pauta')}
          className={`btn ${activeTab === 'excel_pauta' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <FileSpreadsheet size={16} />
          <span>Submisaun Pauta EXCEL & Protokolu</span>
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`btn ${activeTab === 'curriculum' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Award size={16} />
          <span>Regulamentu Kurríkulu TL (0–20)</span>
        </button>
      </div>

      {/* Tab 1: Gradebook */}
      {activeTab === 'gradebook' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Selectors */}
          <div className="glass-panel" style={{ padding: '18px 24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Klase & Sala Aula
              </label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} style={{ width: '220px' }}>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Trimestre & Mapeamentu CAU
              </label>
              <select value={selectedTrimester} onChange={(e) => setSelectedTrimester(e.target.value)} style={{ width: '220px' }}>
                {trimestres.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (CAU {t.cau_number})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
              <div className="badge badge-gold">Skala Nota: 0 to 20 (Sistema Sekundária Timor-Leste)</div>
            </div>
          </div>

          {/* Gradebook Matrix Table */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
              Matrís Kadiadernu Nota Estudante
            </h3>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nu. Estudante</th>
                    <th>Naran Kompletu</th>
                    <th>Sexo</th>
                    <th>TPC / Trabballu (20%)</th>
                    <th>Teste Parciál (50%)</th>
                    <th>Ezame CAU (30%)</th>
                    <th>Nota Final Trimestre</th>
                    <th>Klasifikasaun</th>
                    <th>Estatutu</th>
                  </tr>
                </thead>
                <tbody>
                  {gradebookData?.students && gradebookData.students.length > 0 ? (
                    gradebookData.students.map((st: any) => {
                      const sScores = gradebookData.scores?.filter((s: any) => s.student_id === st.id) || [];
                      const tpcScore = sScores[0]?.score || '16.0';
                      const partialScore = sScores[1]?.score || '15.5';
                      const cauScore = sScores[2]?.score || '16.5';
                      const termGrade = gradebookData.termGrades?.find((tg: any) => tg.student_id === st.id);
                      const finalScore = termGrade?.final_score || '16.1';
                      const letter = termGrade?.letter_grade || 'B';
                      const isLocked = termGrade?.is_locked ?? true;

                      return (
                        <tr key={st.id}>
                          <td style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{st.student_no}</td>
                          <td style={{ fontWeight: 600 }}>{st.full_name}</td>
                          <td>{st.gender}</td>
                          <td style={{ fontWeight: 600 }}>{tpcScore} / 20</td>
                          <td style={{ fontWeight: 600 }}>{partialScore} / 20</td>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{cauScore} / 20</td>
                          <td style={{ fontWeight: 800, color: '#047857', fontSize: '1rem' }}>
                            {finalScore}
                          </td>
                          <td>
                            <span className="badge badge-success">{letter} (Aprovado)</span>
                          </td>
                          <td>
                            {isLocked ? (
                              <span className="badge badge-gold">
                                <Lock size={12} /> Trankadu
                              </span>
                            ) : (
                              <span className="badge badge-warning">Loke Hela</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        La iha dadus estudante iha klase ne'e.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Excel Pauta Submissions & Review */}
      {activeTab === 'excel_pauta' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Istóriku Submisaun Pauta Valor via EXCEL
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Lembar valor submete husi mestre disiplina no titulár de turma ba Diretora Geral & Vise-Pedagójika
                </p>
              </div>

              <button onClick={() => setShowPautaModal(true)} className="btn btn-primary">
                <Upload size={16} />
                <span>Upload Pauta Excel Foun</span>
              </button>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nu. Protokolu</th>
                    <th>Klase & Turma</th>
                    <th>Disiplina</th>
                    <th>Professór / Mestre</th>
                    <th>Alunu (Totál)</th>
                    <th>Média Klase</th>
                    <th>Estatutu Submisaun</th>
                    <th>Data Submete</th>
                    <th>Aksaun</th>
                  </tr>
                </thead>
                <tbody>
                  {pautaSubmissions.length > 0 ? (
                    pautaSubmissions.map((ps) => (
                      <tr key={ps.id}>
                        <td style={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.02em' }}>
                          {ps.protocol_no}
                        </td>
                        <td style={{ fontWeight: 600 }}>{ps.classroom_name}</td>
                        <td>{ps.subject_name}</td>
                        <td>{ps.teacher_name}</td>
                        <td>
                          {ps.total_students} alunu{' '}
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            ({ps.passed_count} Liu)
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, color: ps.average_score >= 10 ? '#047857' : '#DC2626' }}>
                          {ps.average_score} / 20
                        </td>
                        <td>
                          {ps.status === 'APPROVED' ? (
                            <span className="badge badge-success">
                              <CheckCircle2 size={12} /> Aprovadu
                            </span>
                          ) : ps.status === 'RETURNED_FOR_REVISION' ? (
                            <span className="badge badge-danger">
                              <RotateCcw size={12} /> Revizaun
                            </span>
                          ) : (
                            <span className="badge badge-gold">
                              <ShieldCheck size={12} /> Pending Review
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(ps.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => setSelectedSubmission(ps)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              title="Haree Detallu"
                            >
                              <Eye size={13} />
                              <span>Haree</span>
                            </button>
                            {ps.status === 'PENDING_DIRECTOR_REVIEW' && (
                              <>
                                <button
                                  onClick={() => handleReviewSubmission(ps.id, 'APPROVED')}
                                  disabled={reviewingId === ps.id}
                                  className="btn btn-primary"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#047857', borderColor: '#065F46' }}
                                  title="Aprova Pauta"
                                >
                                  <Check size={13} />
                                  <span>Aprova</span>
                                </button>
                                <button
                                  onClick={() => handleReviewSubmission(ps.id, 'RETURNED_FOR_REVISION')}
                                  disabled={reviewingId === ps.id}
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#DC2626' }}
                                  title="Fila ba Revizaun"
                                >
                                  <RotateCcw size={13} />
                                  <span>Revizaun</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        Seidauk iha submisaun pauta via Excel. Klike "Upload Pauta Excel Foun" ba submisaun dahuluk.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Curriculum Regulations & Weighting Rules */}
      {activeTab === 'curriculum' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
              Regulamentu Avaliasaun Sekundária Geral — Ministério da Educação (MEJD) Timor-Leste
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: '20px' }}>
              Sira ne'e mak kaidah ofisiál ne'ebé uza ba ponderasaun nota trimestrál iha Ensino Secundário Geral NOSSEF Railaco:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '18px', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Komponente 1: TPC / Traballu
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '6px 0', color: 'var(--text-main)' }}>
                  20%
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Traballu de kaza, prátika laboratóriu, no partisipasaun ativu estudante iha sala aula.
                </p>
              </div>

              <div style={{ padding: '18px', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Komponente 2 & 3: Teste Parciál 1 & 2
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '6px 0', color: 'var(--text-main)' }}>
                  50% (25% + 25%)
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Teste formativu periodiku ne'ebé hala'o iha klaran trimestre atu sukat kompreensaun matéria.
                </p>
              </div>

              <div style={{ padding: '18px', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Komponente 4: Ezame CAU Trimestrál
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '6px 0', color: 'var(--text-main)' }}>
                  30%
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Ezame sumativu CAU 1 (Trimestre 1), CAU 2 (Trimestre 2), no CAU 3 (Trimestre 3).
                </p>
              </div>
            </div>

            <div style={{ marginTop: '24px', padding: '18px', background: '#EFF6FF', borderRadius: 'var(--radius-md)', border: '1px solid #BFDBFE' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '8px' }}>
                Kritériu Klasifikasaun & Situasaun Alunu:
              </h4>
              <ul style={{ fontSize: '0.85rem', color: '#1E40AF', lineHeight: 1.6, paddingLeft: '20px' }}>
                <li><strong>Média &ge; 10.0:</strong> Aprovado (Liu ba trimestre tuir mai ka klase tuir mai).</li>
                <li><strong>Média 8.0 – 9.9:</strong> Exame / Rekursu (Presiza halo ezame remedial / segunda chamada).</li>
                <li><strong>Média &lt; 8.0:</strong> Retido (La liu / Retensaun).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="modal-backdrop" onClick={() => setSelectedSubmission(null)}>
          <div
            className="modal-box"
            style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-card)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <div className="badge badge-verified" style={{ marginBottom: '6px' }}>
                  {selectedSubmission.protocol_no}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Detallu Pauta: {selectedSubmission.classroom_name} — {selectedSubmission.subject_name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Submete husi: <strong>{selectedSubmission.teacher_name}</strong> • File: {selectedSubmission.file_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Totál Estudante</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{selectedSubmission.total_students}</div>
              </div>
              <div style={{ padding: '12px', background: '#ECFDF5', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#047857' }}>Aprovado</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#047857' }}>{selectedSubmission.passed_count}</div>
              </div>
              <div style={{ padding: '12px', background: '#FFFBEB', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#D97706' }}>Exame</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#D97706' }}>{selectedSubmission.exam_count}</div>
              </div>
              <div style={{ padding: '12px', background: '#EFF6FF', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#2563EB' }}>Média Klase</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2563EB' }}>{selectedSubmission.average_score}</div>
              </div>
            </div>

            {selectedSubmission.director_notes && (
              <div style={{ padding: '12px 16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '4px', marginBottom: '16px', fontSize: '0.825rem' }}>
                <strong>Nota husi Diretoria:</strong> {selectedSubmission.director_notes}
              </div>
            )}

            <div className="data-table-container" style={{ maxHeight: '280px', overflowY: 'auto' }}>
              <table className="data-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Nu. Estudante</th>
                    <th>Naran Kompletu</th>
                    <th>TPC</th>
                    <th>Teste 1</th>
                    <th>Teste 2</th>
                    <th>Ezame</th>
                    <th>Média</th>
                    <th>Situasaun</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSubmission.scores_data && selectedSubmission.scores_data.length > 0 ? (
                    selectedSubmission.scores_data.map((r: any, idx: number) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{r.student_no}</td>
                        <td style={{ fontWeight: 600 }}>{r.full_name}</td>
                        <td>{r.tpc}</td>
                        <td>{r.teste1}</td>
                        <td>{r.teste2}</td>
                        <td>{r.ezame}</td>
                        <td style={{ fontWeight: 800, color: r.media >= 10 ? '#047857' : '#DC2626' }}>{r.media}</td>
                        <td>
                          <span className={`badge ${r.situasaun === 'Aprovado' ? 'badge-success' : r.situasaun === 'Exame' ? 'badge-warning' : 'badge-danger'}`}>
                            {r.situasaun}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
                        La iha dadus lista alunu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedSubmission(null)}>
                Taka
              </button>
              {selectedSubmission.status === 'PENDING_DIRECTOR_REVIEW' && (
                <>
                  <button
                    className="btn btn-primary"
                    style={{ background: '#047857', borderColor: '#065F46' }}
                    onClick={() => handleReviewSubmission(selectedSubmission.id, 'APPROVED')}
                  >
                    <Check size={16} />
                    <span>Aprova Pauta Ne'e</span>
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ color: '#DC2626' }}
                    onClick={() => handleReviewSubmission(selectedSubmission.id, 'RETURNED_FOR_REVISION')}
                  >
                    <RotateCcw size={16} />
                    <span>Fila ba Revizaun</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Excel Upload */}
      <ExcelPautaUploadModal
        isOpen={showPautaModal}
        onClose={() => setShowPautaModal(false)}
        onSuccess={() => {
          loadSubmissions();
          setActiveTab('excel_pauta');
        }}
      />
    </div>
  );
}
