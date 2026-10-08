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
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--surface-canvas)',
        padding: '24px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Institutional Emblem & Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #047857 0%, #064E3B 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-card)',
              marginBottom: '12px',
            }}
          >
            <Cross size={28} color="#FFFFFF" />
          </div>
          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.015em',
            }}
          >
            NOSSEF Railaco
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
            Escola Secundária Católica Nossa Senhora de Fátima
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {TETUN.school.location}
          </p>
        </div>

        {/* Login Card per Stitch Spec */}
        <div
          className="glass-panel"
          style={{
            padding: '28px',
            background: '#FFFFFF',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              marginBottom: '4px',
              color: 'var(--text-main)',
            }}
          >
            {TETUN.auth.loginTitle}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {TETUN.auth.loginSubtitle}
          </p>

          {error && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#B91C1C',
                padding: '10px 14px',
                borderRadius: '4px',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '18px',
                fontWeight: 600,
              }}
            >
              <AlertCircle size={16} color="#B91C1C" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '5px',
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
                  style={{ paddingLeft: '38px', height: '42px' }}
                />
                <Mail
                  size={17}
                  color="var(--text-faint)"
                  style={{ position: 'absolute', left: '12px', top: '12px' }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '5px',
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
                  style={{ paddingLeft: '38px', paddingRight: '40px', height: '42px' }}
                />
                <Lock
                  size={17}
                  color="var(--text-faint)"
                  style={{ position: 'absolute', left: '12px', top: '12px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '12px',
                    color: 'var(--text-faint)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px 16px', minHeight: '44px', marginTop: '4px' }}
            >
              <span>{loading ? 'Prosesa hela...' : TETUN.auth.submitLogin}</span>
              <ArrowRight size={17} />
            </button>
          </form>

          {/* Quick Login Selection for Demonstration */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-card)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Sparkles size={13} color="var(--primary)" />
              <span>{TETUN.auth.quickLogin}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setQuickUser('diretor@nossef.edu.tl')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 8px', justifyContent: 'flex-start', minHeight: '34px' }}
              >
                Diretór Eskola
              </button>
              <button
                type="button"
                onClick={() => setQuickUser('admin@nossef.edu.tl')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 8px', justifyContent: 'flex-start', minHeight: '34px' }}
              >
                TU / Super Admin
              </button>
              <button
                type="button"
                onClick={() => setQuickUser('finansas@nossef.edu.tl')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 8px', justifyContent: 'flex-start', minHeight: '34px' }}
              >
                Finansas / SPP
              </button>
              <button
                type="button"
                onClick={() => setQuickUser('mestre.matematika@nossef.edu.tl')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 8px', justifyContent: 'flex-start', minHeight: '34px' }}
              >
                Mestre Titulár
              </button>
              <button
                type="button"
                onClick={() => setQuickUser('estudante1@nossef.edu.tl')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 8px', justifyContent: 'flex-start', minHeight: '34px' }}
              >
                Estudante 10-CT
              </button>
              <button
                type="button"
                onClick={() => setQuickUser('enkaregadu1@nossef.edu.tl')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 8px', justifyContent: 'flex-start', minHeight: '34px' }}
              >
                Enkaregadu / Aman
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '18px' }}>
          <Link
            href="/"
            style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
          >
            ← Fila ba Pájina Inisiál
          </Link>
        </div>
      </div>
    </div>
  );
}
