'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Award,
  Users,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Cross,
  Sparkles,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
} from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-main)' }}>
      {/* Navbar */}
      <nav
        className="glass-nav"
        style={{
          height: '76px',
          padding: '0 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
              border: '1px solid var(--border-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Cross size={26} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
              NOSSEF Railaco
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', fontWeight: 500 }}>
              Escola Secundaria Catolica Nossa Senhora de Fatima
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="badge badge-gold" style={{ display: 'none' }}>
            <Sparkles size={12} />
            <span>PWA Instalavel</span>
          </div>
          <Link href="/login" className="btn btn-primary">
            <span>{TETUN.auth.loginTitle}</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          padding: '80px 24px 60px',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div
          className="badge badge-gold"
          style={{ marginBottom: '24px', padding: '6px 16px', fontSize: '0.85rem' }}
        >
          <Cross size={14} />
          <span>Fé, Siénsia no Karidade ba Futuru Timor-Leste</span>
        </div>

        <h1
          style={{
            fontSize: '3.2rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            maxWidth: '900px',
            margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #fcd34d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Sistema Informasaun Jestaun Eskola Sekundária Bazeia ba PWA
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            maxWidth: '750px',
            margin: '0 auto 40px',
            lineHeight: 1.6,
          }}
        >
          Plataforma ofisiál integradu ba administrasaun akadémika, rejistu prezensas offline, kadiadernu
          nota & CAU 1–3, boletin de notas, finansas mensalidade, no ezame nasionál 12.º ano ba Escola
          Secundaria Catolica Nossa Senhora de Fatima Railaco, Ermera.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link
            href="/login"
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: '1rem' }}
          >
            <span>Tama iha Painél Kontrolu</span>
            <ChevronRight size={18} />
          </Link>
          <Link
            href="/dashboard/admisasaun"
            className="btn btn-secondary"
            style={{ padding: '14px 28px', fontSize: '1rem' }}
          >
            <GraduationCap size={18} />
            <span>Admisasaun & Rejistu Foun</span>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            marginTop: '70px',
            textAlign: 'left',
          }}
        >
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <Smartphone size={22} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
              PWA & Sincronizasaun Offline
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Mestre sira bele rejistu prezensas no nota iha sala aula maski la iha rede internet. Dadus
              sei sinkroniza automatikamente bainhira internet liga fali.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '28px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <Award size={22} color="#3b82f6" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
              Kadiadernu Nota & Ezame CAU 1–3
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Kalkulasaun nota trimestre bazeia ba ponderasaun formataiva no ezame CAU. Tranka nota
              ofisiál no jera boletin de notas ho ranking klase.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '28px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <BookOpen size={22} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
              Ezame Nasionál 12.º Ano
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Rejistu espesiál ba rezultadu ezame nasionál final 12.º ano (Português, Inglês, Matemátika,
              no Disiplina Espesífika) separadu husi CAU.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '28px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <ShieldCheck size={22} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
              Finansas & Mensalidade (SPP)
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Jera konta mensalidade automátiku $15/fulan, rejistu pagamentu, emisaun resibu ofisiál
              REC-2026, no audit trail ba kada transasaun.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '40px 24px',
          textAlign: 'center',
          color: 'var(--text-faint)',
          fontSize: '0.825rem',
          background: 'rgba(7, 11, 20, 0.8)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '14px' }}>
          <span>Railaco Vila, Posto Administrativo Railaco, Munisípiu Ermera, Timor-Leste</span>
          <span>•</span>
          <span>Pe. Guilhermino da Silva, SJ (Diretór Eskola)</span>
        </div>
        <p>
          © 2026 Escola Secundaria Catolica Nossa Senhora de Fatima Railaco (NOSSEF). Direitu hotu
          rezervadu.
        </p>
      </footer>
    </div>
  );
}
