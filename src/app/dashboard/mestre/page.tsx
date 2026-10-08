'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Search, Plus, GraduationCap, Phone, Mail, Award,
  BookOpen, CheckCircle2, Clock, Filter, Download, Edit, Eye,
  Star, UserCheck, X, Briefcase, FileSpreadsheet, Upload, ShieldCheck
} from 'lucide-react';
import { TETUN } from '@/lib/tetun';
import ExcelPautaUploadModal from '@/components/ExcelPautaUploadModal';

export default function MestrePage() {
  const [activeTab, setActiveTab] = useState<'teachers' | 'homeroom'>('teachers');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Excel Pauta Modal states
  const [showPautaModal, setShowPautaModal] = useState(false);
  const [pautaClassroomId, setPautaClassroomId] = useState('');

  // Form state
  const [form, setForm] = useState({
    full_name: '',
    employee_no: '',
    nip: '',
    gender: 'Mane',
    phone: '',
    email: '',
    employment_status: 'ACTIVE',
    employment_type: 'FULL_TIME',
    join_date: '',
    specialization: '',
    qualification: 'Lisensiatúra (S1)',
    is_homeroom_teacher: false,
  });

  useEffect(() => {
    initAndLoad();
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadTeachers, 300);
    return () => clearTimeout(timer);
  }, [search, filterStatus, filterType]);

  async function initAndLoad() {
    try {
      await fetch('/api/teachers/migrate', { method: 'POST' });
    } catch {}
    await loadTeachers();
  }

  async function loadTeachers() {
    try {
      let url = '/api/teachers?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (filterStatus) url += `status=${filterStatus}&`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTeachers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) return;
    setSubmitting(true);
    try {
      const method = selectedTeacher ? 'PUT' : 'POST';
      const url = selectedTeacher ? `/api/teachers/${selectedTeacher.id}` : '/api/teachers';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setSelectedTeacher(null);
        resetForm();
        loadTeachers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      full_name: '',
      employee_no: '',
      nip: '',
      gender: 'Mane',
      phone: '',
      email: '',
      employment_status: 'ACTIVE',
      employment_type: 'FULL_TIME',
      join_date: '',
      specialization: '',
      qualification: 'Lisensiatúra (S1)',
      is_homeroom_teacher: false,
    });
  };

  const openEdit = (t: any) => {
    setSelectedTeacher(t);
    setForm({
      full_name: t.full_name || '',
      employee_no: t.employee_no || '',
      nip: t.nip || '',
      gender: t.gender || 'Mane',
      phone: t.phone || '',
      email: t.email || '',
      employment_status: t.employment_status || 'ACTIVE',
      employment_type: t.employment_type || 'FULL_TIME',
      join_date: t.join_date ? t.join_date.split('T')[0] : '',
      specialization: t.specialization || '',
      qualification: t.qualification || 'Lisensiatúra (S1)',
      is_homeroom_teacher: t.is_homeroom_teacher || false,
    });
    setShowModal(true);
  };

  const exportTeachersCSV = () => {
    const headers = ['Naran Kompletu', 'Nu. Empregado', 'NIP', 'Sexo', 'Estadu', 'Tipu', 'Espesializasaun', 'Kualifikasaun', 'Telefone', 'Email'];
    const rows = teachers.map((t) => [
      `"${t.full_name || ''}"`,
      `"${t.employee_no || ''}"`,
      `"${t.nip || ''}"`,
      `"${t.gender || ''}"`,
      `"${t.employment_status || ''}"`,
      `"${t.employment_type || ''}"`,
      `"${t.specialization || ''}"`,
      `"${t.qualification || ''}"`,
      `"${t.phone || ''}"`,
      `"${t.email || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NOSSEF_Mestre_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.employment_status === 'ACTIVE').length,
    homeroom: teachers.filter(t => t.is_homeroom_teacher).length,
    fullTime: teachers.filter(t => t.employment_type === 'FULL_TIME').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap size={24} color="var(--primary)" />
            <span>Mestre & Funsionáriu</span>
          </h1>
          <p className="page-header-sub">
            Jere dadus korpu dosente no funsionáriu administrativu NOSSEF Railaco
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={exportTeachersCSV}>
            <Download size={15} />
            <span>Esporta CSV</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => { setSelectedTeacher(null); resetForm(); setShowModal(true); }}
          >
            <Plus size={16} />
            <span>Rejistu Mestre Foun</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-kpi">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Mestre</span>
            <div className="stat-icon" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <Users size={18} color="#2563EB" />
            </div>
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-desc">Korpu dosente rejistadu</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Mestre Ativu</span>
            <div className="stat-icon" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
              <CheckCircle2 size={18} color="#047857" />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#047857' }}>{stats.active}</div>
          <div className="stat-desc">Estadu ativu iha aula</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Titulár de Turma</span>
            <div className="stat-icon" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
              <Star size={18} color="#059669" />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#059669' }}>{stats.homeroom}</div>
          <div className="stat-desc">Mestre wali klase</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Full-Time</span>
            <div className="stat-icon" style={{ background: '#F1F5F9', border: '1px solid #CBD5E1' }}>
              <Briefcase size={18} color="#0F172A" />
            </div>
          </div>
          <div className="stat-value">{stats.fullTime}</div>
          <div className="stat-desc">Mestre permanente / kontratu</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('teachers')}
          className={`btn ${activeTab === 'teachers' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <GraduationCap size={16} />
          <span>Korpu Dosente & Mestre ({teachers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('homeroom')}
          className={`btn ${activeTab === 'homeroom' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Star size={16} />
          <span>Profesor da Turma (Titulár de Turma & Rombel)</span>
        </button>
      </div>

      {/* Tab 1: Teachers List */}
      {activeTab === 'teachers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filters Bar */}
          <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Search size={16} color="var(--text-faint)" style={{ position: 'absolute', left: '12px', top: '12px', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Buka naran mestre, NIP, ka nómeru empregadu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '38px', height: '40px' }}
              />
            </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto', minWidth: '150px', height: '40px' }}>
          <option value="">Hotu-hotu Estadu</option>
          <option value="ACTIVE">Ativu</option>
          <option value="INACTIVE">Inativu</option>
          <option value="LEAVE">Ona Lisensa</option>
          <option value="ENDED">Ona Finaliza</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 'auto', minWidth: '140px', height: '40px' }}>
          <option value="">Tipu Hotu-hotu</option>
          <option value="FULL_TIME">Full-Time</option>
          <option value="PART_TIME">Part-Time</option>
          <option value="CONTRACT">Kontrato</option>
        </select>
      </div>

      {/* Teachers Grid */}
      {teachers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <GraduationCap size={44} color="var(--text-faint)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
            {loading ? 'Hein ruma...' : 'Seidauk iha dadus mestre. Rejistu mestre foun liu husi botaun acima.'}
          </p>
          <button className="btn btn-primary" onClick={() => { setSelectedTeacher(null); resetForm(); setShowModal(true); }}>
            <Plus size={16} />
            <span>Rejistu Mestre Foun</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
          {teachers.map((t) => (
            <div
              key={t.id}
              className="glass-panel"
              style={{
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <div>
                {/* Teacher avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '4px',
                      background: t.gender === 'Feto' ? '#DB2777' : 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      flexShrink: 0,
                    }}
                  >
                    {t.full_name ? t.full_name[0] : 'M'}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.full_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      {t.specialization || 'Mestre Jenerál'}
                    </div>
                  </div>
                </div>

                {/* Status badges */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <span className={`badge ${t.employment_status === 'ACTIVE' ? 'badge-verified' : 'badge-draft'}`}>
                    <span className="badge-dot" />
                    <span>{t.employment_status === 'ACTIVE' ? 'Ativu' : t.employment_status}</span>
                  </span>
                  <span className="badge badge-submitted">
                    <span className="badge-dot" />
                    <span>{t.employment_type === 'FULL_TIME' ? 'Full-Time' : t.employment_type || 'Kontrato'}</span>
                  </span>
                  {t.is_homeroom_teacher && (
                    <span className="badge badge-verified">
                      <Star size={10} />
                      <span>Titulár</span>
                    </span>
                  )}
                </div>

                {/* Info rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', fontSize: '0.8rem', color: 'var(--text-body)' }}>
                  {t.homeroom_class_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={14} color="var(--primary)" />
                      <span>Titulár de <strong>{t.homeroom_class_name}</strong></span>
                    </div>
                  )}
                  {t.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                      <Phone size={14} />
                      <span>{t.phone}</span>
                    </div>
                  )}
                  {t.qualification && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                      <Award size={14} color="#0284C7" />
                      <span>{t.qualification}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-card)', paddingTop: '12px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => openEdit(t)}
                  style={{ flex: 1, height: '36px', fontSize: '0.78rem' }}
                >
                  <Edit size={14} />
                  <span>Edita</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}

  {/* Tab 2: Homeroom Teachers (Profesor da Turma & Rombel) */}
      {activeTab === 'homeroom' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Rombongan Belajar & Mestre Titulár de Turma (Ano Letivo 2026/2027)
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Estrutura ofisiál 7 rombel NOSSEF Railaco (10º CT-A, 10º CT-B, 10º CSH, 11º CT, 11º CSH, 12º CT, 12º CSH)
              </p>
            </div>
            <button
              onClick={() => { setPautaClassroomId(''); setShowPautaModal(true); }}
              className="btn btn-primary"
            >
              <FileSpreadsheet size={16} />
              <span>Upload Valor Turma (Excel)</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {[
              { id: '10-CT-A', code: '10º CT-A', name: '10.º Ano CT-A', major: 'Ciências Naturais (CT)', teacher: 'Mestre Domingos da Costa', spec: 'Matemátika & Fízika', room: 'Sala 01 - S. Inácio de Loyola', students: 35, chefe: 'António Soares Guterres', contact: '+670 7711 0006' },
              { id: '10-CT-B', code: '10º CT-B', name: '10.º Ano CT-B', major: 'Ciências Naturais (CT)', teacher: 'Mestre Lourenço dos Santos', spec: 'Fízika & Kímika', room: 'Sala 02 - Sto. Alberto Magno', students: 34, chefe: 'Maria Madalena Belo', contact: '+670 7711 0003' },
              { id: '10-CSH', code: '10º CSH', name: '10.º Ano CSH', major: 'Ciências Sociais e Humanidades (CSH)', teacher: 'Mestra Jacinta Pereira', spec: 'Língua Portuguesa & Literatura', room: 'Sala 03 - S. Francisco Xavier', students: 32, chefe: 'Francisco Xavier dos Santos', contact: '+670 7711 0007' },
              { id: '11-CT', code: '11º CT', name: '11.º Ano CT', major: 'Ciências Naturais (CT)', teacher: 'Mestre Domingos da Costa', spec: 'Kímika & Matemátika Avansadu', room: 'Sala 04 - Sto. Estevão', students: 30, chefe: 'Filomena Martins da Costa', contact: '+670 7711 0006' },
              { id: '11-CSH', code: '11º CSH', name: '11.º Ano CSH', major: 'Ciências Sociais e Humanidades (CSH)', teacher: 'Sra. Beatriz da Conceição', spec: 'Istória & Sosiolojia', room: 'Sala 05 - Sta. Teresa de Calcutá', students: 28, chefe: 'Bernardo Martins Ximenes', contact: '+670 7711 0008' },
              { id: '12-CT', code: '12º CT', name: '12.º Ano CT (Finalista)', major: 'Ciências Naturais (CT)', teacher: 'Mestre Lourenço dos Santos', spec: 'Matemátika & Prepara Ezame Nasionál', room: 'Sala 06 - N. S. de Fátima', students: 26, chefe: 'Gabriel de Jesus Pereira', contact: '+670 7711 0003' },
              { id: '12-CSH', code: '12º CSH', name: '12.º Ano CSH (Finalista)', major: 'Ciências Sociais e Humanidades (CSH)', teacher: 'Mestra Jacinta Pereira', spec: 'Ekonomia & Filosofia', room: 'Sala 07 - S. Pedro Faber', students: 25, chefe: 'Filomena Barreto dos Reis', contact: '+670 7711 0007' },
            ].map((turma) => (
              <div key={turma.id} className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span className="badge badge-verified" style={{ marginBottom: '6px' }}>{turma.code}</span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>{turma.name}</h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{turma.major}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-gold">{turma.students} Alunu</span>
                    </div>
                  </div>

                  <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)', marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Mestre Titulár de Turma (Wali Klase)
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                      {turma.teacher}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{turma.spec} • {turma.contact}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: 'var(--text-body)', marginBottom: '16px' }}>
                    <div><strong>Sala Aula:</strong> {turma.room}</div>
                    <div><strong>Xefe de Turma:</strong> {turma.chefe}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-card)', paddingTop: '14px' }}>
                  <button
                    onClick={() => {
                      setPautaClassroomId(turma.id);
                      setShowPautaModal(true);
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Upload size={14} />
                    <span>Upload Valor Turma</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-card)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={18} color="#FFFFFF" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {selectedTeacher ? 'Edita Dadus Mestre' : 'Rejistu Mestre Foun'}
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Formuláriu korpu dosente NOSSEF Railaco
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Naran Kompletu *
                </label>
                <input
                  required
                  placeholder="Ez: Mestre Lourenço da Silva"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Nu. Empregado
                  </label>
                  <input
                    placeholder="Ez: EMP-2026-001"
                    value={form.employee_no}
                    onChange={(e) => setForm({ ...form, employee_no: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    NIP (Kazu Funsionáriu Estadu)
                  </label>
                  <input
                    placeholder="Ez: 19850101..."
                    value={form.nip}
                    onChange={(e) => setForm({ ...form, nip: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Sexo
                  </label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="Mane">Mane</option>
                    <option value="Feto">Feto</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Kualifikasaun
                  </label>
                  <select value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })}>
                    <option value="Lisensiatúra (S1)">Lisensiatúra (S1)</option>
                    <option value="Mestradu (S2)">Mestradu (S2)</option>
                    <option value="Doutoramentu (S3)">Doutoramentu (S3)</option>
                    <option value="Bacharelato (D3)">Bacharelato (D3)</option>
                    <option value="Sekundáriu">Sekundáriu</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Estadu Empregu
                  </label>
                  <select value={form.employment_status} onChange={(e) => setForm({ ...form, employment_status: e.target.value })}>
                    <option value="ACTIVE">Ativu</option>
                    <option value="INACTIVE">Inativu</option>
                    <option value="LEAVE">Lisensa</option>
                    <option value="ENDED">Finaliza</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Tipu Kontratu
                  </label>
                  <select value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })}>
                    <option value="FULL_TIME">Full-Time (Permanente)</option>
                    <option value="PART_TIME">Part-Time (Horista)</option>
                    <option value="CONTRACT">Kontrato</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Espesializasaun / Disiplina
                  </label>
                  <input
                    placeholder="Ez: Matemátika & Fízika"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Telefone
                  </label>
                  <input
                    placeholder="+670 7712 3456"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="homeroom"
                  checked={form.is_homeroom_teacher}
                  onChange={(e) => setForm({ ...form, is_homeroom_teacher: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="homeroom" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  Atribui nu&#39;udar Mestre Titulár de Turma (Wali Klase)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid var(--border-card)', paddingTop: '14px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  {TETUN.actions.cancel}
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Rai hela...' : (selectedTeacher ? 'Atualiza' : 'Rejistu')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ExcelPautaUploadModal
        isOpen={showPautaModal}
        onClose={() => setShowPautaModal(false)}
        initialClassroomId={pautaClassroomId}
      />
    </div>
  );
}
