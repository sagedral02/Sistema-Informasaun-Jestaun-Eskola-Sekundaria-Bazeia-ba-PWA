'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  ChevronRight,
  Cross,
  CheckCircle2,
  Calendar,
  Sparkles,
  School,
  FileText,
  DollarSign,
  ArrowRight,
  Smartphone
} from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function LandingPage() {
  return (
    <div className="app-shell" style={{ background: 'var(--surface-canvas)' }}>
      {/* Top Institutional Header */}
      <header className="desktop-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo & School Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', boxShadow: '0 2px 4px rgba(4, 120, 87, 0.2)'
            }}>
              <Cross size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                NOSSEF Railaco
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Escola Secundária Católica Nossa Senhora de Fátima
              </div>
            </div>
          </div>

          {/* Navigation Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="badge badge-verified" style={{ padding: '6px 12px' }}>
              <Sparkles size={13} />
              <span className="hide-on-mobile">PWA Offline Ready</span>
            </div>

            <Link href="/login" className="btn btn-primary" style={{ padding: '10px 20px' }}>
              <span>{TETUN.auth.loginTitle}</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '64px 24px 48px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center', width: '100%' }}>
        <div className="badge badge-verified" style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}>
          <Cross size={14} strokeWidth={2.5} />
          <span>Fé, Siénsia no Karidade ba Futuru Timor-Leste</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', color: 'var(--text-main)', maxWidth: '920px', margin: '0 auto 20px' }}>
          Sistema Informasaun Jestaun Eskola Sekundária
        </h1>
        
        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--text-muted)', maxWidth: '780px', margin: '0 auto 36px', lineHeight: 1.6, fontWeight: 500 }}>
          Portal ofisiál ba jestaun akadémiku, finansas, no administrasaun eskolár iha NOSSEF Railaco. Konsebidu husi rai laran, ho padraun kualidade a'as.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' }}>
          <Link href="/login" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <span>Tama iha Painél Kontrolu</span>
            <ArrowRight size={18} />
          </Link>
          <Link href="/dashboard/admisasaun" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <GraduationCap size={18} color="var(--primary)" />
            <span>Admisasaun & Rejistu Foun</span>
          </Link>
        </div>

        {/* Institutional Stats Bar */}
        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', padding: '24px', maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>450+</div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>Estudante Ativu (10.º - 12.º)</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', fontVariantNumeric: 'tabular-nums' }}>32</div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>Mestre & Funsionáriu</div>
          </div>
          <div style={{ borderRight: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--gold)', fontVariantNumeric: 'tabular-nums' }}>100%</div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>Pasasaun Ezame Nasionál</div>
          </div>
          <div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>PWA</div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>Mode Offline Integrada</div>
          </div>
        </div>
      </section>

      {/* Feature Modules Grid */}
      <section style={{ padding: '32px 24px 64px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Módulu Prinsipál Sistema Eskolár
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Estrutura padraun tuir kurríkulu nasionál Ministériu Edukasaun Timor-Leste
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--surface-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Smartphone size={20} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>PWA Offline-First</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Mestre sira bele tau valór no presensa iha área ne'ebé laiha rede internet. Sistema sei sinkroniza automatika kuandu iha ligasaun foun.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <FileText size={20} color="var(--secondary)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Jestaun Valór & Rapor</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Integradu direitamente ho padraun kurríkulu nasionál (CAU 1, CAU 2, Ezame) no jera kartaun boletin outomatikamente.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--sky-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <DollarSign size={20} color="var(--sky)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Finansas Eskolár</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Monitorizasaun pagamentu propinas, taxa etapa 1 & etapa 2, bolsa de estudu, no relatóriu transparénsia ba inan-aman sira.
            </p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer style={{ background: 'var(--surface-card)', borderTop: '1px solid var(--border-card)', padding: '32px 24px', textAlign: 'center', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
            <Cross size={18} strokeWidth={2.5} />
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            &copy; {new Date().getFullYear()} Escola Secundária Católica Nossa Senhora de Fátima. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
