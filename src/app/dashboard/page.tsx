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
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function DashboardPage() {
  const [reports, setReports] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.45) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1px solid var(--border-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '18px',
        }}
      >
        <div>
          <div className="badge badge-gold" style={{ marginBottom: '8px' }}>
            <Sparkles size={13} />
            <span>Ano Letivo 2026/2027 • Trimestre 1</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.015em' }}>
            Benvindu ba Painél Prinsipál NOSSEF Railaco
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

      {/* Responsive KPI Grid */}
      <div className="grid-kpi">
        {/* Total Estudante */}
        <Link href="/dashboard/estudante" className="stat-card" style={{ textDecoration: 'none' }}>
          <div className="stat-header">
            <span className="stat-label">Total Estudante</span>
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
              <Users size={18} color="#3b82f6" />
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
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
              <GraduationCap size={18} color="#f59e0b" />
            </div>
          </div>
          <div className="stat-value">{stats.totalTeachers}</div>
          <div className="stat-desc">
            Korpu Dosente & Homeroom Ativu
          </div>
        </Link>

        {/* Taxa Prezensas */}
        <Link href="/dashboard/prezensas" className="stat-card" style={{ textDecoration: 'none' }}>
          <div className="stat-header">
            <span className="stat-label">Taxa Prezensas</span>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <CalendarCheck size={18} color="#10b981" />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#10b981' }}>{stats.attendanceRate}%</div>
          <div className="stat-desc">
            Prezensas Diária & Aula
          </div>
        </Link>

        {/* Kobra Mensalidade */}
        <Link href="/dashboard/finansas" className="stat-card" style={{ textDecoration: 'none' }}>
          <div className="stat-header">
            <span className="stat-label">Finansas Mensalidade</span>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
              <DollarSign size={18} color="#f59e0b" />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--gold-light)' }}>
            ${stats.finance?.totalCollected ? stats.finance.totalCollected.toFixed(2) : '15.00'}
          </div>
          <div className="stat-desc" style={{ color: '#f87171' }}>
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
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bell size={18} color="var(--gold-primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Avizu & Notifikasaun Eskola</h3>
            </div>
            <Link
              href="/dashboard/komunikasaun"
              style={{ fontSize: '0.8rem', color: 'var(--gold-light)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}
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
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--gold-100)' }}>{a.title}</h4>
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{a.target_audience}</span>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {a.content}
                  </p>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '8px' }}>
                    Públika husi: {a.published_by_name || 'Diretór Eskola'}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <Bell size={32} color="var(--text-faint)" />
                <p style={{ fontSize: '0.85rem' }}>La iha avizu foun.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
            Aksaun Lalais (Atallu)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/dashboard/mestre" className="quick-action-card">
              <GraduationCap size={18} color="#f59e0b" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Mestre & Funsionáriu</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Jestaun profesór & dosente</div>
              </div>
              <ChevronRight size={14} color="var(--text-faint)" />
            </Link>

            <Link href="/dashboard/estudante" className="quick-action-card">
              <Users size={18} color="#3b82f6" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Estudante & Promosaun</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Perfil 360 & tranzisaun klase</div>
              </div>
              <ChevronRight size={14} color="var(--text-faint)" />
            </Link>

            <Link href="/dashboard/admisasaun" className="quick-action-card">
              <UserCheck size={18} color="#10b981" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Admisasaun Estudante</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Kandidatu & matríkula foun</div>
              </div>
              <ChevronRight size={14} color="var(--text-faint)" />
            </Link>

            <Link href="/dashboard/finansas" className="quick-action-card">
              <DollarSign size={18} color="#10b981" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Kobra Mensalidade</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Selu propinas & resibu</div>
              </div>
              <ChevronRight size={14} color="var(--text-faint)" />
            </Link>

            <Link href="/dashboard/orariu" className="quick-action-card">
              <Clock size={18} color="#60a5fa" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Oráriu Semanál</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Horáriu aula & profesór</div>
              </div>
              <ChevronRight size={14} color="var(--text-faint)" />
            </Link>

            <Link href="/dashboard/boletin" className="quick-action-card">
              <BookOpen size={18} color="#a855f7" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Boletin de Notas</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Kartaun evaluasaun alunu</div>
              </div>
              <ChevronRight size={14} color="var(--text-faint)" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
