'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Cross, Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@nossef.edu.tl');
  const [password, setPassword] = useState('nossef2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || TETUN.auth.loginFailed);
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError(TETUN.auth.loginFailed);
      setLoading(false);
    }
  };

  const setQuickUser = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('nossef2026');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 20%, #152238 0%, #080d1a 100%)',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {/* Emblem & Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
              border: '2px solid var(--border-accent)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              marginBottom: '16px',
            }}
          >
            <Cross size={34} color="#f59e0b" />
          </div>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.01em',
            }}
          >
            NOSSEF Railaco
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--gold-light)', marginTop: '4px' }}>
            Escola Secundaria Catolica Nossa Senhora de Fatima
          </p>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {TETUN.school.location}
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              marginBottom: '6px',
              color: 'var(--text-main)',
            }}
          >
            {TETUN.auth.loginTitle}
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            {TETUN.auth.loginSubtitle}
          </p>

          {error && (
            <div
              className="animate-fade-in"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                }}
              >
                {TETUN.auth.usernameOrEmail}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ezemplu@nossef.edu.tl"
                  style={{ paddingLeft: '40px' }}
                />
                <Mail
                  size={18}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '12px' }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                }}
              >
                {TETUN.auth.password}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Prenxe lia-fukun..."
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                />
                <Lock
                  size={18}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '12px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '12px',
                    color: '#94a3b8',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '6px' }}
            >
              <span>{loading ? 'Prosesa hela...' : TETUN.auth.submitLogin}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick Login Selection for Demonstration */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '12px',
                fontSize: '0.775rem',
                fontWeight: 600,
                color: 'var(--gold-light)',
              }}
            >
              <Sparkles size={14} />
              <span>{TETUN.auth.quickLogin}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setQuickUser('diretor@nossef.edu.tl')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 10px', justifyContent: 'flex-start' }}
              >
                Diretór Eskola
              </button>
              <button
                type="button"
                onClick={() => setQuickUser('admin@nossef.edu.tl')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 10px', justifyContent: 'flex-start' }}
              >
                TU / Super Admin
              </button>
              <button
                type="button"
                onClick={() => setQuickUser('finansas@nossef.edu.tl')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 10px', justifyContent: 'flex-start' }}
              >
                Finansas / SPP
              </button>
              <button
                type="button"
                onClick={() => setQuickUser('mestre.matematika@nossef.edu.tl')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 10px', justifyContent: 'flex-start' }}
              >
                Mestre Titulár
              </button>
              <button
                type="button"
                onClick={() => setQuickUser('estudante1@nossef.edu.tl')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 10px', justifyContent: 'flex-start' }}
              >
                Estudante 10-CT
              </button>
              <button
                type="button"
                onClick={() => setQuickUser('enkaregadu1@nossef.edu.tl')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 10px', justifyContent: 'flex-start' }}
              >
                Enkaregadu / Aman
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link
            href="/"
            style={{ fontSize: '0.825rem', color: 'var(--text-muted)', transition: 'color 0.2s' }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--gold-light)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ← Fila ba Pájina Inisiál
          </Link>
        </div>
      </div>
    </div>
  );
}
