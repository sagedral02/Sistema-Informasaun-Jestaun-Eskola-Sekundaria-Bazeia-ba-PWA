'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Bell,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  BookOpen,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  Download,
  History,
  Trophy,
} from 'lucide-react';
import { TETUN } from '@/lib/tetun';
import ExcelPautaUploadModal from '@/components/ExcelPautaUploadModal';

export default function DashboardPage() {
  const [reports, setReports] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPautaModal, setShowPautaModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [repRes, annRes] = await Promise.all([
          fetch('/api/reports'),
          fetch('/api/announcements'),
        ]);

        if (repRes.ok) {
          const repData = await repRes.json();
          setReports(repData);
        }
        if (annRes.ok) {
          const annData = await annRes.json();
          setAnnouncements(annData);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const stats = reports?.summary || {
    totalStudents: 3,
    maleStudents: 2,
    femaleStudents: 1,
    totalTeachers: 4,
    totalClassrooms: 4,
    attendanceRate: 98,
    finance: { totalInvoiced: 30, totalCollected: 15, totalArrears: 15 },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Welcome Institutional Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          background: '#FFFFFF',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div>
          <div className="badge badge-verified" style={{ marginBottom: '8px' }}>
            <span className="badge-dot" />
            <span>Ano Letivo 2026/2027 • Trimestre 1 (CAU 1)</span>
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.015em' }}>
            Painél Prinsipál NOSSEF Railaco
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Escola Secundária Católica Nossa Senhora de Fátima Railaco — Ermera, Timor-Leste
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/dashboard/prezensas" className="btn btn-primary">
            <CalendarCheck size={16} />
            <span>Rejistu Prezensas</span>
          </Link>
          <Link href="/dashboard/avaliasaun" className="btn btn-secondary">
            <Award size={16} />
            <span>Kadiadernu Nota</span>
          </Link>
        </div>
      </div>

      {/* Exclusive Teacher & Homeroom Pauta Upload Widget per PRD Spec */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)',
          border: '1px solid #BBF7D0',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              background: '#DCFCE7',
              border: '1px solid #86EFAC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#15803D',
              flexShrink: 0,
            }}
          >
            <FileSpreadsheet size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#166534' }}>
                Painél Professór & Titulár de Turma: Submete Pauta Valor via EXCEL
              </h2>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                Kurríkulu TL (0–20)
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#15803D', marginTop: '2px' }}>
              Submete nota TPC (20%), Teste 1 (25%), Teste 2 (25%), no Ezame (30%) ho protokolu ofisiál PV-NOSSEF-2026 direta ba Diretora no Vise-Pedagójika.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowPautaModal(true)}
            className="btn btn-primary"
            style={{ background: '#166534', borderColor: '#14532D' }}
          >
            <Upload size={16} />
            <span>Upload Valor Excel</span>
          </button>
          <Link href="/dashboard/avaliasaun" className="btn btn-secondary">
            <BookOpen size={16} />
            <span>Kadiadernu & Pauta</span>
          </Link>
        </div>
      </div>

      {/* High-Contrast KPI Grid per Stitch Spec */}
      <div className="grid-kpi">
        {/* Total Estudante */}
        <Link href="/dashboard/estudante" className="stat-card" style={{ textDecoration: 'none' }}>
          <div className="stat-header">
            <span className="stat-label">Total Estudante</span>
            <div className="stat-icon" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <Users size={18} color="#2563EB" />
            </div>
          </div>
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-desc">
            Mane: {stats.maleStudents} • Feto: {stats.femaleStudents}
          </div>
        </Link>

        {/* Mestre & Funsionáriu */}
        <Link href="/dashboard/mestre" className="stat-card" style={{ textDecoration: 'none' }}>
          <div className="stat-header">
            <span className="stat-label">Mestre & Dosente</span>
            <div className="stat-icon" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
              <GraduationCap size={18} color="#047857" />
            </div>
          </div>
          <div className="stat-value">{stats.totalTeachers}</div>
          <div className="stat-desc">
            Korpu Dosente & Wali Klase
          </div>
        </Link>

        {/* Taxa Prezensas */}
        <Link href="/dashboard/prezensas" className="stat-card" style={{ textDecoration: 'none' }}>
          <div className="stat-header">
            <span className="stat-label">Taxa Prezensas</span>
            <div className="stat-icon" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
              <CalendarCheck size={18} color="#059669" />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#047857' }}>
            {stats.attendanceRate}%
          </div>
          <div className="stat-desc">
            Prezensas Diária & Aula
          </div>
        </Link>

        {/* Finansas Mensalidade */}
        <Link href="/dashboard/finansas" className="stat-card" style={{ textDecoration: 'none' }}>
          <div className="stat-header">
            <span className="stat-label">Kobra Mensalidade</span>
            <div className="stat-icon" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <DollarSign size={18} color="#D97706" />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#0F172A' }}>
            ${stats.finance?.totalCollected ? stats.finance.totalCollected.toFixed(2) : '15.00'}
          </div>
          <div className="stat-desc" style={{ color: '#DC2626' }}>
            Dívida Pendente: ${stats.finance?.totalArrears ? stats.finance.totalArrears.toFixed(2) : '15.00'}
          </div>
        </Link>
      </div>

      {/* Main Content & Side Panel */}
      <div className="grid-main-side">
        {/* Active Announcements */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              borderBottom: '1px solid var(--border-card)',
              paddingBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} color="var(--primary)" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Avizu & Notifikasaun Eskola
              </h2>
            </div>
            <Link
              href="/dashboard/komunikasaun"
              style={{
                fontSize: '0.8rem',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 700,
              }}
            >
              <span>Haree Hotu</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {announcements.length > 0 ? (
              announcements.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#F8FAFC',
                    border: '1px solid var(--border-card)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {a.title}
                    </h3>
                    <span className="badge badge-submitted">
                      <span className="badge-dot" />
                      <span>{a.target_audience}</span>
                    </span>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                    {a.content}
                  </p>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '8px' }}>
                    Públika husi: {a.published_by_name || 'Diretór Eskola'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.85rem' }}>La iha avizu foun.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              marginBottom: '16px',
              borderBottom: '1px solid var(--border-card)',
              paddingBottom: '12px',
              color: 'var(--text-main)',
            }}
          >
            Aksaun Lalais (Atallu)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/dashboard/mestre" className="quick-action-card">
              <GraduationCap size={18} color="var(--primary)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Mestre & Funsionáriu</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Jestaun profesór & dosente</div>
              </div>
              <ChevronRight size={14} color="var(--text-faint)" />
            </Link>

            <Link href="/dashboard/estudante" className="quick-action-card">
              <Users size={18} color="#2563EB" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Estudante & Promosaun</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Perfil 360 & tranzisaun klase</div>
              </div>
              <ChevronRight size={14} color="var(--text-faint)" />
            </Link>

            <Link href="/dashboard/admisasaun" className="quick-action-card">
              <UserCheck size={18} color="#059669" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Admisasaun Estudante</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Kandidatu & matríkula foun</div>
              </div>
              <ChevronRight size={14} color="var(--text-faint)" />
            </Link>

            <Link href="/dashboard/finansas" className="quick-action-card">
              <DollarSign size={18} color="#D97706" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Kobra Mensalidade</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Selu propinas & resibu</div>
              </div>
              <ChevronRight size={14} color="var(--text-faint)" />
            </Link>

            <Link href="/dashboard/orariu" className="quick-action-card">
              <Clock size={18} color="#0284C7" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Oráriu Semanál</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Horáriu aula & profesór</div>
              </div>
              <ChevronRight size={14} color="var(--text-faint)" />
            </Link>

            <Link href="/dashboard/boletin" className="quick-action-card">
              <BookOpen size={18} color="#7C3AED" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Boletin de Notas</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Kartaun evaluasaun alunu</div>
              </div>
              <ChevronRight size={14} color="var(--text-faint)" />
            </Link>
          </div>
        </div>
      </div>

      {/* Executive Row: Top 5 Ranking Jeral & Fee Summary Etapa 1 & 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Top 5 Ranking Jeral */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={18} color="#D97706" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Top 5 Ranking Jerál (CT & CSH)
              </h2>
            </div>
            <span className="badge badge-gold">Trimestre 1</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { rank: 1, name: 'Gabriel de Jesus Pereira', class: '10.º Ano CT-A', score: '18.2', status: 'Distinsaun' },
              { rank: 2, name: 'António Soares Guterres', class: '10.º Ano CT-A', score: '16.8', status: 'Di\'ak Tebes' },
              { rank: 3, name: 'Filomena Barreto dos Reis', class: '11.º Ano CSH', score: '16.5', status: 'Di\'ak Tebes' },
              { rank: 4, name: 'Maria Madalena Belo', class: '10.º Ano CT-A', score: '15.9', status: 'Di\'ak Tebes' },
              { rank: 5, name: 'Bernardo Martins Ximenes', class: '12.º Ano CT', score: '15.4', status: 'Di\'ak' },
            ].map((st) => (
              <div
                key={st.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-card)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: st.rank === 1 ? '#FEF3C7' : '#F1F5F9',
                      color: st.rank === 1 ? '#D97706' : '#64748B',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    #{st.rank}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{st.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{st.class}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#047857' }}>{st.score} / 20</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{st.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Fee Summary: Etapa 1 & Etapa 2 */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={18} color="var(--primary)" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Tabela Tarif SPP Ofisiál (Etapa 1 & 2)
              </h2>
            </div>
            <Link href="/dashboard/finansas" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
              Detallu
            </Link>
          </div>

          <div className="data-table-container">
            <table className="data-table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>Nivel Klase</th>
                  <th>Etapa 1</th>
                  <th>Etapa 2</th>
                  <th>Total / Tinan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700 }}>10.º Ano (Alunu Foun)</td>
                  <td>$85.50</td>
                  <td>$63.00</td>
                  <td style={{ fontWeight: 800, color: 'var(--primary)' }}>$148.50</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>11.º Ano (Kontinua)</td>
                  <td>$69.00</td>
                  <td>$63.00</td>
                  <td style={{ fontWeight: 800, color: 'var(--primary)' }}>$132.00</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>12.º Ano (Finalista)</td>
                  <td>$74.00</td>
                  <td>$63.00</td>
                  <td style={{ fontWeight: 800, color: 'var(--primary)' }}>$137.00</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            Paga bele direta via Tezouraria Eskola ka transfere via BNU Timor, Bank Mandiri Dili, & Telemor Mosan.
          </p>
        </div>
      </div>

      {/* Leadership Organigram & 2002-2026 Archive */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Leadership Organigram */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ShieldCheck size={18} color="var(--primary)" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Estrutura Lideransa Eskola NOSSEF Railaco
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Diretór Eskola</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Pe. Guilhermino da Silva, SJ</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Companhia de Jesus</div>
            </div>
            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Diretora Geral</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Prof. Dra. Cristina Amaral</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Supervizaun Jerál</div>
            </div>
            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vise-Diretora Pedagójika</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Ir. Maria Gorete Martins</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Kurríkulu & Pauta Valor</div>
            </div>
            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tezoureira Eskola</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Madre Teresa Noronha, RVM</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Jestaun Finansas</div>
            </div>
          </div>
        </div>

        {/* 2002-2026 Archive */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} color="var(--primary)" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Arsivu Istóriku (2002–2026 • 24 Anos)
              </h2>
            </div>
            <span className="badge badge-verified">24 Jerasaun</span>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-body)', lineHeight: 1.5, marginBottom: '14px' }}>
            Desde tinan 2002 to\'o 2026, NOSSEF Railaco gradua ona estudante rihun resin iha Ramu Siénsia Naturál (CT) no Siénsia Sosiál (CSH).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
            <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>1,480+</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Totál Alumni</div>
            </div>
            <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#047857' }}>98.4%</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Liu Ezame Nasionál</div>
            </div>
            <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>24</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Angkatan / Turma</div>
            </div>
          </div>
        </div>
      </div>

      <ExcelPautaUploadModal
        isOpen={showPautaModal}
        onClose={() => setShowPautaModal(false)}
      />
    </div>
  );
}
