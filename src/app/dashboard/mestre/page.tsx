'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Search, Plus, GraduationCap, Phone, Mail, Award,
  BookOpen, CheckCircle2, Clock, Filter, Download, Edit, Eye,
  Star, UserCheck, X, Briefcase
} from 'lucide-react';
import { TETUN } from '@/lib/tetun';

const statusColors: Record<string, string> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  LEAVE: 'warning',
  ENDED: 'danger',
};
const typeColors: Record<string, string> = {
  FULL_TIME: 'info',
  PART_TIME: 'warning',
  CONTRACT: 'neutral',
};

export default function MestrePage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [migrating, setMigrating] = useState(false);

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
    setMigrating(true);
    try {
      await fetch('/api/teachers/migrate', { method: 'POST' });
    } catch {}
    setMigrating(false);
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

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.employment_status === 'ACTIVE').length,
    homeroom: teachers.filter(t => t.is_homeroom_teacher).length,
    fullTime: teachers.filter(t => t.employment_type === 'FULL_TIME').length,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="skeleton" style={{ height: '60px', borderRadius: 'var(--radius-lg)' }} />
        <div className="grid-kpi">
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-lg)' }} />)}
        </div>
        <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap size={24} color="var(--gold-500)" />
            Mestre & Funsionáriu
          </h1>
          <p className="page-header-sub">Jere dadus korpu dosente no funsionáriu administrativu NOSSEF Railaco</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { /* export CSV */ }}
          >
            <Download size={15} />
            <span>Esporta</span>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Total Mestre</div>
              <div className="stat-value" style={{ color: 'var(--text-main)' }}>{stats.total}</div>
              <div className="stat-sub">Korpu dosente rejistadu</div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <Users size={22} color="var(--gold-500)" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Mestre Ativu</div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.active}</div>
              <div className="stat-sub">Estadu ativu</div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <CheckCircle2 size={22} color="var(--success)" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Titulár de Turma</div>
              <div className="stat-value" style={{ color: 'var(--blue-400)' }}>{stats.homeroom}</div>
              <div className="stat-sub">Mestre wali kelas</div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>
              <Star size={22} color="var(--blue-400)" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Full-Time</div>
              <div className="stat-value" style={{ color: 'var(--gold-300)' }}>{stats.fullTime}</div>
              <div className="stat-sub">Mestre tetap / kontrato</div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <Briefcase size={22} color="var(--gold-400)" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={16} color="var(--text-faint)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Buka naran mestre, NIP, ka nómeru empregadu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto', minWidth: '150px' }}>
          <option value="">Hotu-hotu Estadu</option>
          <option value="ACTIVE">Ativu</option>
          <option value="INACTIVE">Inativu</option>
          <option value="LEAVE">Ona Lisensa</option>
          <option value="ENDED">Ona Finaliza</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 'auto', minWidth: '140px' }}>
          <option value="">Tipu Hotu-hotu</option>
          <option value="FULL_TIME">Full-Time</option>
          <option value="PART_TIME">Part-Time</option>
          <option value="CONTRACT">Kontrato</option>
        </select>
      </div>

      {/* Teachers Grid / List */}
      {teachers.length === 0 ? (
        <div className="glass-panel empty-state">
          <GraduationCap size={40} color="var(--text-faint)" />
          <p>Seidauk iha dadus mestre. Rejistu mestre foun liu husi botaun acima.</p>
          <button className="btn btn-primary" onClick={() => { setSelectedTeacher(null); resetForm(); setShowModal(true); }}>
            <Plus size={16} />
            Rejistu Mestre Foun
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {teachers.map((t) => (
            <div
              key={t.id}
              className="glass-panel"
              style={{ padding: '20px', transition: 'all 0.2s ease', cursor: 'pointer' }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Teacher avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `linear-gradient(135deg, ${t.gender === 'Feto' ? '#ec4899, #be185d' : '#1e3a8a, #3b82f6'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                  {t.full_name ? t.full_name[0] : 'M'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.full_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {t.specialization || 'Mestre Jenerál'}
                  </div>
                </div>
              </div>

              {/* Status badges */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <span className={`badge badge-${statusColors[t.employment_status] || 'neutral'}`}>
                  {t.employment_status === 'ACTIVE' ? 'Ativu' : t.employment_status}
                </span>
                <span className={`badge badge-${typeColors[t.employment_type] || 'neutral'}`}>
                  {t.employment_type === 'FULL_TIME' ? 'Full-Time' : t.employment_type || 'Kontrato'}
                </span>
                {t.is_homeroom_teacher && (
                  <span className="badge badge-gold">
                    <Star size={10} />
                    Titulár
                  </span>
                )}
              </div>

              {/* Info rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {t.homeroom_class_name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <BookOpen size={14} color="var(--gold-400)" />
                    <span>Titulár de <strong style={{ color: 'var(--gold-300)' }}>{t.homeroom_class_name}</strong></span>
                  </div>
                )}
                {t.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Phone size={14} />
                    <span>{t.phone}</span>
                  </div>
                )}
                {t.qualification && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Award size={14} color="var(--blue-400)" />
                    <span>{t.qualification}</span>
                  </div>
                )}
                {t.teaching_assignment_count > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Clock size={14} />
                    <span>{t.teaching_assignment_count} penugasan aktif</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(t)} style={{ flex: 1 }}>
                  <Edit size={14} />
                  Edita
                </button>
                <button className="btn btn-ghost btn-sm btn-icon" title="Haree detallu">
                  <Eye size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setSelectedTeacher(null); }}}>
          <div className="modal-box">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={20} color="var(--gold-500)" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                    {selectedTeacher ? 'Edita Dadus Mestre' : 'Rejistu Mestre Foun'}
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Prenxe formuláriu konpletu</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => { setShowModal(false); setSelectedTeacher(null); }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>Naran Kompletu *</label>
                  <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="ex: Pe. João Baptista, SJ" required />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Nómeru NIP / ID Funsionáriu</label>
                    <input type="text" value={form.nip} onChange={e => setForm({...form, nip: e.target.value})} placeholder="ex: 19820415..." />
                  </div>
                  <div className="form-group">
                    <label>Nómeru Empregadu</label>
                    <input type="text" value={form.employee_no} onChange={e => setForm({...form, employee_no: e.target.value})} placeholder="ex: EMP-001" />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Seksus</label>
                    <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                      <option value="Mane">Mane (Masculino)</option>
                      <option value="Feto">Feto (Feminino)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Estadu Emprego</label>
                    <select value={form.employment_status} onChange={e => setForm({...form, employment_status: e.target.value})}>
                      <option value="ACTIVE">Ativu</option>
                      <option value="INACTIVE">Inativu</option>
                      <option value="LEAVE">Ona Lisensa</option>
                      <option value="ENDED">Finaliza</option>
                    </select>
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Tipu Kontrato</label>
                    <select value={form.employment_type} onChange={e => setForm({...form, employment_type: e.target.value})}>
                      <option value="FULL_TIME">Full-Time (Tetap)</option>
                      <option value="PART_TIME">Part-Time (Parsiál)</option>
                      <option value="CONTRACT">Kontrato Temporáriu</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Data Hahu Servisu</label>
                    <input type="date" value={form.join_date} onChange={e => setForm({...form, join_date: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Espesializasaun / Matéria Ensinu</label>
                  <input type="text" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} placeholder="ex: Matemátika, Fízika, Língua Portuguesa..." />
                </div>
                <div className="form-group">
                  <label>Kualifikasaun Akadémiku</label>
                  <select value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})}>
                    <option value="Lisensiatúra (S1)">Lisensiatúra (S1)</option>
                    <option value="Mestrádu (S2)">Mestrádu (S2)</option>
                    <option value="Doturádu (S3)">Doturádu (S3)</option>
                    <option value="D3 / Diploma">D3 / Diploma</option>
                    <option value="SMA / Ensinu Sekundáriu">SMA / Ensinu Sekundáriu</option>
                  </select>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Telemóvel / Whatsapp</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+670 7712 0000" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="nome@nossef.edu.tl" />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: 'rgba(245,158,11,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-accent)' }}>
                  <input
                    type="checkbox"
                    id="is_homeroom"
                    checked={form.is_homeroom_teacher}
                    onChange={e => setForm({...form, is_homeroom_teacher: e.target.checked})}
                    style={{ width: '18px', height: '18px', minHeight: 'unset', cursor: 'pointer' }}
                  />
                  <label htmlFor="is_homeroom" style={{ margin: 0, color: 'var(--gold-300)', cursor: 'pointer' }}>
                    <Star size={14} style={{ display: 'inline', marginRight: '5px' }} />
                    Mestre Titulár de Turma (Wali Kelas)
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setSelectedTeacher(null); }}>
                  Kansela
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Rai hela...' : selectedTeacher ? 'Atualiza Dadus' : 'Rai Mestre Foun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
