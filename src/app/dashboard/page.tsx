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
    </div>
  );
}
