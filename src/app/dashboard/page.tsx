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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid var(--border-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div className="badge badge-gold" style={{ marginBottom: '10px' }}>
            <Sparkles size={12} />
            <span>Ano Letivo 2026/2027 • Trimestre 1</span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
            Benvindu ba Painél Prinsipál NOSSEF Railaco
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Escola Secundaria Catolica Nossa Senhora de Fatima Railaco — {TETUN.school.location}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
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

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Total Estudante */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Estudante
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
                {stats.totalStudents}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '4px' }}>
                Mane: {stats.maleStudents} • Feto: {stats.femaleStudents}
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} color="#3b82f6" />
            </div>
          </div>
        </div>

        {/* Mestre & Dosente */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Mestre & Profesór
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
                {stats.totalTeachers}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '4px' }}>
                Korpu Dosente Ativu
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GraduationCap size={20} color="#f59e0b" />
            </div>
          </div>
        </div>

        {/* Taxa Prezensas */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Taxa Prezensas
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>
                {stats.attendanceRate}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '4px' }}>
                Prezensas Loron & Aula
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarCheck size={20} color="#10b981" />
            </div>
          </div>
        </div>

        {/* Finansas Mensalidade */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Kobra Mensalidade
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
                ${stats.finance.totalCollected.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px' }}>
                Dívida Pendente: ${stats.finance.totalArrears.toFixed(2)}
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarSign size={20} color="#f59e0b" />
            </div>
          </div>
        </div>
      </div>

      {/* Announcements & Quick Actions Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Active Announcements */}
        <div className="glass-panel" style={{ padding: '26px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bell size={20} color="#f59e0b" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Avizu & Notifikasaun Eskola</h3>
            </div>
            <Link
              href="/dashboard/komunikasaun"
              style={{ fontSize: '0.8rem', color: 'var(--gold-light)', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Haree Hotu</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {announcements.length > 0 ? (
              announcements.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fef08a' }}>{a.title}</h4>
                    <span className="badge badge-gold">{a.target_audience}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {a.content}
                  </p>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-faint)', marginTop: '8px' }}>
                    Públika husi: {a.published_by_name || 'Diretór Eskola'}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>La iha avizu foun.</p>
            )}
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="glass-panel" style={{ padding: '26px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
            Aksaun Lalais (Atallu)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link
              href="/dashboard/admisasaun"
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
            >
              <Users size={16} color="#f59e0b" />
              <span>Admisasaun Estudante Foun</span>
            </Link>
            <Link
              href="/dashboard/finansas"
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
            >
              <DollarSign size={16} color="#10b981" />
              <span>Kria Konta & Selu Mensalidade</span>
            </Link>
            <Link
              href="/dashboard/orariu"
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
            >
              <Clock size={16} color="#3b82f6" />
              <span>Haree Oráriu Aula Semanál</span>
            </Link>
            <Link
              href="/dashboard/boletin"
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
            >
              <BookOpen size={16} color="#a855f7" />
              <span>Imprime Boletin de Notas</span>
            </Link>
            <Link
              href="/dashboard/relatoriu"
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
            >
              <TrendingUp size={16} color="#ec4899" />
              <span>Esporta Relatóriu Jerál</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
