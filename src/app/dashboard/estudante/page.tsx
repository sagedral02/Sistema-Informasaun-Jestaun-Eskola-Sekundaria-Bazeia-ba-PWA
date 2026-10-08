'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Search, Plus, GraduationCap, Phone, MapPin, Calendar,
  CheckCircle2, UserCheck, Eye, ArrowRight, Download, RefreshCw,
  Award, AlertCircle, FileSpreadsheet, X
} from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function StudentsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'promotion'>('list');
  const [students, setStudents] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [gradeLevels, setGradeLevels] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal & Selection
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Form states for creating student
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Mane');
  const [birthDate, setBirthDate] = useState('2008-04-12');
  const [birthPlace, setBirthPlace] = useState('Railaco');
  const [address, setAddress] = useState('Aldeia Railaco Craic, Ermera');
  const [phone, setPhone] = useState('+670 7712 0000');
  const [classroomId, setClassroomId] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('Aman');
  const [guardianPhone, setGuardianPhone] = useState('+670 7712 1111');
  const [submitting, setSubmitting] = useState(false);

  // Promotion tab states
  const [promoFromYear, setPromoFromYear] = useState('');
  const [promoToYear, setPromoToYear] = useState('');
  const [promoClassroomId, setPromoClassroomId] = useState('');
  const [promoTargetClassroomId, setPromoTargetClassroomId] = useState('');
  const [promoData, setPromoData] = useState<any | null>(null);
  const [promoRows, setPromoRows] = useState<any[]>([]);
  const [loadingPromo, setLoadingPromo] = useState(false);
  const [submittingPromo, setSubmittingPromo] = useState(false);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    loadAuxData();
  }, [search, selectedClass]);

  async function loadAuxData() {
    try {
      const [ayRes, clsRes, glRes, majRes] = await Promise.all([
        fetch('/api/academic-years'),
        fetch('/api/classrooms'),
        fetch('/api/grade-levels'),
        fetch('/api/majors'),
      ]);
      if (ayRes.ok) {
        const ayData = await ayRes.json();
        setAcademicYears(ayData);
        const activeYear = ayData.find((y: any) => y.is_active) || ayData[0];
        if (activeYear) {
          setPromoFromYear(activeYear.id);
          const otherYear = ayData.find((y: any) => y.id !== activeYear.id) || activeYear;
          setPromoToYear(otherYear.id);
        }
      }
      if (clsRes.ok) {
        const clsData = await clsRes.json();
        setClassrooms(clsData);
        if (clsData.length > 0 && !classroomId) setClassroomId(clsData[0].id);
        if (clsData.length > 0 && !promoClassroomId) setPromoClassroomId(clsData[0].id);
      }
      if (glRes.ok) setGradeLevels(await glRes.json());
      if (majRes.ok) setMajors(await majRes.json());
    } catch (err) {
      console.error(err);
    }
  }

  async function loadData() {
    try {
      let url = '/api/students?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (selectedClass) url += `classroom_id=${encodeURIComponent(selectedClass)}&`;

      const res = await fetch(url);
      if (res.ok) setStudents(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadPromotionData() {
    if (!promoClassroomId || !promoFromYear) return;
    setLoadingPromo(true);
    setPromoSuccessMsg(null);
    try {
      const res = await fetch(`/api/students/promote?classroom_id=${promoClassroomId}&academic_year_id=${promoFromYear}`);
      if (res.ok) {
        const data = await res.json();
        setPromoData(data);
        setPromoRows(
          (data.students || []).map((s: any) => ({
            student_id: s.id,
            student_no: s.student_no,
            full_name: s.full_name,
            gender: s.gender,
            average_score: s.average_score,
            recommendation: s.recommendation,
            action: s.recommendation,
            to_classroom_id: promoTargetClassroomId || '',
            notes: '',
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching promotion preview:', err);
    } finally {
      setLoadingPromo(false);
    }
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const cls = classrooms.find((c) => c.id === classroomId);

      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          gender,
          birth_date: birthDate,
          birth_place: birthPlace,
          address,
          phone,
          entry_year: 2026,
          classroom_id: classroomId,
          grade_level_id: cls?.grade_level_id,
          major_id: cls?.major_id,
          academic_year_id: cls?.academic_year_id,
          guardian_name: guardianName,
          guardian_relationship: guardianRelationship,
          guardian_phone: guardianPhone,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setFullName('');
        setGuardianName('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExecutePromotion = async () => {
    if (promoRows.length === 0) return;
    setSubmittingPromo(true);
    try {
      const payload = {
        from_academic_year_id: promoFromYear,
        to_academic_year_id: promoToYear,
        promotions: promoRows.map((r) => ({
          student_id: r.student_id,
          action: r.action,
          to_classroom_id: r.action === 'GRADUADU' ? null : (r.to_classroom_id || promoTargetClassroomId),
          notes: r.notes || `Promosaun kolektivu (${r.action})`,
        })),
      };

      const res = await fetch('/api/students/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        setPromoSuccessMsg(json.message);
        loadPromotionData();
        loadData();
      } else {
        const errJson = await res.json();
        alert(`Erro: ${errJson.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPromo(false);
    }
  };

  const exportStudentsCSV = () => {
    const headers = ['Nu. Estudante', 'Naran Kompletu', 'Sexo', 'Klase', 'Status', 'Inan-Aman', 'Telefone'];
    const rows = students.map((s) => [
      `"${s.student_no || ''}"`,
      `"${s.full_name || ''}"`,
      `"${s.gender || ''}"`,
      `"${s.classroom_name || ''}"`,
      `"${s.status || ''}"`,
      `"${s.guardian_name || ''}"`,
      `"${s.guardian_phone || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NOSSEF_Estudantes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            Jestaun Estudante sira (Perfil 360)
          </h1>
          <p className="page-header-sub">
            Base de dados ofisiál estudante, promosaun ano letivo, matríkula, no enkaregadu edukasaun
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={exportStudentsCSV} className="btn btn-secondary">
            <Download size={15} />
            <span>Esporta CSV</span>
          </button>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Aumenta Estudante</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-card)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('list')}
          className={`btn ${activeTab === 'list' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
        >
          <Users size={16} />
          <span>Lista Estudante ({students.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('promotion');
            if (!promoData) loadPromotionData();
          }}
          className={`btn ${activeTab === 'promotion' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
        >
          <GraduationCap size={16} />
          <span>Promosaun & Graduasaun</span>
        </button>
      </div>

      {/* TAB 1: LISTA ESTUDANTE */}
      {activeTab === 'list' && (
        <>
          {/* Filter and Search Bar */}
          <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buka tuir naran ka númeru estudante..."
                style={{ paddingLeft: '38px', height: '40px' }}
              />
              <Search size={18} color="var(--text-faint)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            </div>

            <div style={{ width: '220px' }}>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} style={{ height: '40px' }}>
                <option value="">Klase Hotu-Hotu</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nu. Estudante</th>
                    <th>Naran Kompletu</th>
                    <th>Sexo</th>
                    <th>Klase & Sala</th>
                    <th>Área</th>
                    <th>Enkaregadu</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksaun</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 700, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>
                          {s.student_no}
                        </td>
                        <td style={{ fontWeight: 600 }}>{s.full_name}</td>
                        <td>{s.gender}</td>
                        <td>
                          <span className="badge badge-open">
                            <span className="badge-dot" />
                            <span>{s.classroom_name || 'Seidauk iha Klase'}</span>
                          </span>
                        </td>
                        <td>{s.major_code || 'CT'}</td>
                        <td>
                          <div>{s.guardian_name || '-'}</div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-faint)' }}>{s.guardian_phone || ''}</div>
                        </td>
                        <td>
                          <span className={`badge ${s.status === 'GRADUADU' ? 'badge-submitted' : 'badge-verified'}`}>
                            <span className="badge-dot" />
                            <span>{s.status}</span>
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.78rem', minHeight: '32px' }}
                          >
                            <Eye size={13} />
                            <span>Detallu 360</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                        {loading ? 'Hein ruma...' : 'La hetan dadus estudante ruma.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: PROMOSAUN & GRADUASAUN */}
      {activeTab === 'promotion' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Controls Panel */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={18} color="var(--primary)" />
              <span>Konfigurasaun Tranzisaun & Promosaun Ano Letivo</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Ano Letivo Orixinál
                </label>
                <select value={promoFromYear} onChange={(e) => setPromoFromYear(e.target.value)}>
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name} {y.is_active ? '(Ativu)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Klase atu Avalia
                </label>
                <select value={promoClassroomId} onChange={(e) => setPromoClassroomId(e.target.value)}>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Ano Letivo Destinu
                </label>
                <select value={promoToYear} onChange={(e) => setPromoToYear(e.target.value)}>
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Sala/Klase Destinu Padraun
                </label>
                <select value={promoTargetClassroomId} onChange={(e) => setPromoTargetClassroomId(e.target.value)}>
                  <option value="">Hili Klase Destinu...</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  onClick={loadPromotionData}
                  disabled={loadingPromo}
                  className="btn btn-secondary"
                  style={{ width: '100%', height: '40px' }}
                >
                  <RefreshCw size={14} className={loadingPromo ? 'spin' : ''} />
                  <span>Kalkula Promosaun</span>
                </button>
              </div>
            </div>
          </div>

          {promoSuccessMsg && (
            <div className="glass-panel" style={{ padding: '14px 20px', background: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#047857" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#047857' }}>{promoSuccessMsg}</span>
            </div>
          )}

          {/* Promotion Preview Table */}
          {promoData && (
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Rezultadu Avaliasaun: {promoData.currentClass?.name} ({promoRows.length} Estudante)
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Regra NOSSEF: Média ≥ 10.0 PASSA / GRADUA. Média &lt; 10.0 RETEIN (Repete).
                  </p>
                </div>

                <button
                  onClick={handleExecutePromotion}
                  disabled={submittingPromo || promoRows.length === 0}
                  className="btn btn-primary"
                >
                  <CheckCircle2 size={16} />
                  <span>{submittingPromo ? 'Prosesa hela...' : 'Aprova & Executa Promosaun'}</span>
                </button>
              </div>

              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nu. Estudante</th>
                      <th>Naran Kompletu</th>
                      <th>Sexo</th>
                      <th>Média Jerál</th>
                      <th>Rekomendasaun Sistema</th>
                      <th>Desizaun Final</th>
                      <th>Klase Destinu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoRows.length > 0 ? (
                      promoRows.map((row, idx) => (
                        <tr key={row.student_id}>
                          <td style={{ fontWeight: 700, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>
                            {row.student_no}
                          </td>
                          <td style={{ fontWeight: 600 }}>{row.full_name}</td>
                          <td>{row.gender}</td>
                          <td>
                            <span style={{ fontWeight: 700, color: row.average_score >= 10.0 ? '#047857' : '#B91C1C', fontVariantNumeric: 'tabular-nums' }}>
                              {row.average_score.toFixed(1)} / 20.0
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${row.recommendation === 'PASSA' ? 'badge-verified' : row.recommendation === 'GRADUADU' ? 'badge-submitted' : 'badge-arrears'}`}>
                              <span className="badge-dot" />
                              <span>{row.recommendation}</span>
                            </span>
                          </td>
                          <td>
                            <select
                              value={row.action}
                              onChange={(e) => {
                                const newAction = e.target.value;
                                setPromoRows((prev) =>
                                  prev.map((r, i) => (i === idx ? { ...r, action: newAction } : r))
                                );
                              }}
                              style={{ padding: '4px 8px', height: '34px', fontSize: '0.8rem' }}
                            >
                              <option value="PASSA">PASSA (Promote)</option>
                              <option value="RETEIN">RETEIN (Repete)</option>
                              <option value="GRADUADU">GRADUADU (Graduated)</option>
                            </select>
                          </td>
                          <td>
                            {row.action === 'GRADUADU' ? (
                              <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>Graduadu husi NOSSEF</span>
                            ) : (
                              <select
                                value={row.to_classroom_id || promoTargetClassroomId}
                                onChange={(e) => {
                                  const cid = e.target.value;
                                  setPromoRows((prev) =>
                                    prev.map((r, i) => (i === idx ? { ...r, to_classroom_id: cid } : r))
                                  );
                                }}
                                style={{ padding: '4px 8px', height: '34px', fontSize: '0.8rem' }}
                              >
                                <option value="">Padraun ({promoTargetClassroomId ? 'Hili tiha ona' : 'Seidauk'})</option>
                                {classrooms.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name} ({c.code})
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                          La iha estudante ativu iha klase ne&#39;e.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student 360 Detail Modal */}
      {selectedStudent && (
        <div className="modal-backdrop" onClick={() => setSelectedStudent(null)}>
          <div className="modal-box" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-card)', paddingBottom: '12px' }}>
              <div>
                <span className="badge badge-submitted">
                  <span className="badge-dot" />
                  <span>{selectedStudent.student_no}</span>
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-main)' }}>
                  {selectedStudent.full_name}
                </h3>
              </div>
              <div className="badge badge-verified">
                <span className="badge-dot" />
                <span>{selectedStudent.status}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '4px', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Klase & Sala Aula</div>
                <div style={{ fontWeight: 700, marginTop: '2px', color: 'var(--text-main)' }}>{selectedStudent.classroom_name || '-'}</div>
              </div>
              <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '4px', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Área / Departamentu</div>
                <div style={{ fontWeight: 700, marginTop: '2px', color: 'var(--text-main)' }}>{selectedStudent.major_name || 'Ciências Naturais'}</div>
              </div>
              <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '4px', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Data Moris & Fatin</div>
                <div style={{ fontWeight: 600, marginTop: '2px', color: 'var(--text-main)' }}>{selectedStudent.birth_date} ({selectedStudent.birth_place || 'Railaco'})</div>
              </div>
              <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '4px', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enkaregadu (Inan-Aman)</div>
                <div style={{ fontWeight: 600, marginTop: '2px', color: 'var(--text-main)' }}>{selectedStudent.guardian_name || '-'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{selectedStudent.guardian_phone || ''}</div>
              </div>
            </div>

            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '4px', border: '1px solid var(--border-card)', marginBottom: '18px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hela Fatin (Enderesu)</div>
              <div style={{ fontWeight: 500, marginTop: '2px', color: 'var(--text-main)' }}>{selectedStudent.address || 'Railaco Vila, Ermera'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-card)', paddingTop: '12px' }}>
              <button onClick={() => setSelectedStudent(null)} className="btn btn-secondary">
                {TETUN.actions.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-card)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Rejistu Estudante Foun
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Prenxe dadus estudante no atribui ba klase ativu
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Naran Kompletu Estudante *
                </label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ez: Teresa Tilman dos Santos"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Sexo
                  </label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="Mane">Mane</option>
                    <option value="Feto">Feto</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Data Moris
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Fatin Moris
                  </label>
                  <input
                    required
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="Ez: Railaco"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Klase & Sala Aula
                  </label>
                  <select value={classroomId} onChange={(e) => setClassroomId(e.target.value)}>
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Hela Fatin (Enderesu)
                </label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ez: Aldeia Railaco Craic, Ermera"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Naran Inan-Aman / Enkaregadu
                  </label>
                  <input
                    required
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Ez: José dos Santos"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Telefone Enkaregadu
                  </label>
                  <input
                    required
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="+670 7712 9999"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid var(--border-card)', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  {TETUN.actions.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Rai hela...' : TETUN.actions.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
