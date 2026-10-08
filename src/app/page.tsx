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
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  School,
  FileText,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Institutional Header */}
      <header
        style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-card)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo & School Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'var(--brand-emerald)',
                border: '1px solid #065F46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 2px 4px rgba(4, 120, 87, 0.2)',
                flexShrink: 0,
              }}
            >
              <Cross size={24} color="#FFFFFF" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-slate)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                NOSSEF Railaco
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Escola Secundária Católica Nossa Senhora de Fátima
              </div>
            </div>
          </div>

          {/* Navigation Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              className="badge"
              style={{
                background: 'var(--emerald-light)',
                color: 'var(--brand-emerald)',
                border: '1px solid #A7F3D0',
                display: 'none',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
              }}
            >
              <Sparkles size={13} />
              <span>PWA Offline Ready</span>
            </div>

            <Link
              href="/login"
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.9rem', fontWeight: 700 }}
            >
              <span>{TETUN.auth.loginTitle}</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '64px 24px 48px',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          width: '100%',
        }}
      >
        {/* Academic Faith Motto Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            background: 'var(--emerald-light)',
            color: 'var(--brand-emerald)',
            border: '1px solid #A7F3D0',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '24px',
          }}
        >
          <Cross size={14} strokeWidth={2.5} />
          <span>Fé, Siénsia no Karidade ba Futuru Timor-Leste</span>
        </div>

        {/* Main Title - Pure Typography, No AI Slop Gradients */}
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: 'var(--brand-slate)',
            maxWidth: '920px',
            margin: '0 auto 20px',
          }}
        >
          Sistema Informasaun Jestaun Eskola Sekundária Bazeia ba PWA
        </h1>

        {/* Institutional Description */}
        <p
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
            color: 'var(--text-muted)',
            maxWidth: '780px',
            margin: '0 auto 36px',
            lineHeight: 1.65,
          }}
        >
          Plataforma ofisiál integradu ba administrasaun akadémika, rejistu prezensas offline, kadiadernu
          nota & CAU 1–3, boletin de notas, finansas mensalidade, no ezame nasionál 12.º ano ba Escola
          Secundária Católica Nossa Senhora de Fátima Railaco, Munisípiu Ermera.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' }}>
          <Link
            href="/login"
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: '1rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)' }}
          >
            <span>Tama iha Painél Kontrolu</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/dashboard/admisasaun"
            className="btn btn-secondary"
            style={{ padding: '14px 28px', fontSize: '1rem', fontWeight: 600, background: '#FFFFFF' }}
          >
            <GraduationCap size={18} color="var(--brand-emerald)" />
            <span>Admisasaun & Rejistu Foun</span>
          </Link>
        </div>

        {/* Institutional Stats Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            maxWidth: '980px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-emerald)', fontFamily: 'var(--font-mono)' }}>
              450+
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
              Estudante Ativu (10.º - 12.º)
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-slate)', fontFamily: 'var(--font-mono)' }}>
              32
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
              Mestre & Funsionáriu
            </div>
          </div>
          <div style={{ borderRight: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#D97706', fontFamily: 'var(--font-mono)' }}>
              100%
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
              Pasasaun Ezame Nasionál
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-emerald)', fontFamily: 'var(--font-mono)' }}>
              OFFLINE
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
              PWA Sala Aula Ready
            </div>
          </div>
        </div>
      </section>

      {/* Feature Modules Grid */}
      <section
        style={{
          padding: '32px 24px 64px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-slate)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Módulu Prinsipál Sistema Eskolár
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Estrutura padraun tuir kurríkulu nasionál Ministériu Edukasaun Timor-Leste
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Card 1: PWA Offline */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'var(--emerald-light)',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-emerald)',
              }}
            >
              <Smartphone size={22} strokeWidth={2.2} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-slate)', margin: 0 }}>
              PWA & Sincronizasaun Offline
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
              Mestre sira bele rejistu prezensas no nota iha sala aula maski la iha rede internet iha Railaco. Dadus
              sei sinkroniza ba base de dadus bainhira internet liga fali.
            </p>
          </div>

          {/* Card 2: CAU 1-3 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <Award size={22} strokeWidth={2.2} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-slate)', margin: 0 }}>
              Kadiadernu Nota & CAU 1–3
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
              Kalkulasaun nota trimestre bazeia ba ponderasaun formativa no ezame Kontrolu Avaliasaun Unitáriu (CAU).
              Tranka nota ofisiál no jera boletin de notas ho ranking klase.
            </p>
          </div>

          {/* Card 3: Ezame Nasional */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'var(--gold-light)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706',
              }}
            >
              <BookOpen size={22} strokeWidth={2.2} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-slate)', margin: 0 }}>
              Ezame Nasionál 12.º Ano
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
              Rejistu espesiál ba rezultadu ezame nasionál final 12.º ano (Português, Matemátika, Fizika, Kímika, sst.)
              separadu husi CAU tuir regulamentu MEJD Timor-Leste.
            </p>
          </div>

          {/* Card 4: Finansas SPP */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(220, 38, 38, 0.08)',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-crimson)',
              }}
            >
              <DollarSign size={22} strokeWidth={2.2} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-slate)', margin: 0 }}>
              Finansas & Mensalidade (SPP)
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
              Jera konta mensalidade automátiku $15/fulan, rejistu pagamentu, emisaun resibu ofisiál
              REC-2026, no audit trail ba kada transasaun finanseiru eskola.
            </p>
          </div>
        </div>
      </section>

      {/* Institutional Location & Information Banner */}
      <section
        style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-card)',
          borderBottom: '1px solid var(--border-card)',
          padding: '40px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'var(--canvas-light)',
                border: '1px solid var(--border-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-slate)',
                flexShrink: 0,
              }}
            >
              <MapPin size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-slate)' }}>Fatin Eskola</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '2px' }}>
                Railaco Vila, Posto Administrativo Railaco, Munisípiu Ermera, Timor-Leste
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'var(--canvas-light)',
                border: '1px solid var(--border-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-slate)',
                flexShrink: 0,
              }}
            >
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-slate)' }}>Horáriu Funsinamentu</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '2px' }}>
                Segunda – Sábadu: 07:30 – 13:00 OTL (Aula Presensiál)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'var(--canvas-light)',
                border: '1px solid var(--border-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-slate)',
                flexShrink: 0,
              }}
            >
              <School size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-slate)' }}>Diresaun Eskola</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '2px' }}>
                Pe. Guilhermino da Silva, SJ (Diretór Eskola)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer
        style={{
          marginTop: 'auto',
          background: 'var(--bg-app)',
          padding: '32px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.825rem',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: 'var(--brand-slate)' }}>
            Escola Secundária Católica Nossa Senhora de Fátima Railaco (NOSSEF)
          </p>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            © 2026 NOSSEF Railaco. Sistema Informasaun Jestaun Eskola Sekundária Bazeia ba PWA. Direitu hotu rezervadu.
          </p>
        </div>
      </footer>
    </div>
  );
}
