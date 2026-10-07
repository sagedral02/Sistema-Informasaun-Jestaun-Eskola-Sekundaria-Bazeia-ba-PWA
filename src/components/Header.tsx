'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, UserCheck, Calendar, Shield, Sparkles } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

interface HeaderProps {
  user?: any;
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [switching, setSwitching] = useState(false);

  // Quick role switch for demo and test evaluation
  const demoUsers = [
    { email: 'admin@nossef.edu.tl', label: 'Maria Soares (TU / Super Admin)' },
    { email: 'diretor@nossef.edu.tl', label: 'Pe. Guilhermino (Diretór Eskola)' },
    { email: 'kurrikulu@nossef.edu.tl', label: 'Mestre Lourenço (Kurríkulu)' },
    { email: 'finansas@nossef.edu.tl', label: 'Madre Teresa (Finansas / SPP)' },
    { email: 'mestre.matematika@nossef.edu.tl', label: 'Mestre Domingos (Mestre Titulár)' },
    { email: 'estudante1@nossef.edu.tl', label: 'António Guterres (Estudante 10-CT)' },
    { email: 'enkaregadu1@nossef.edu.tl', label: 'Manuel Guterres (Inan-Aman / Wali)' },
  ];

  const handleQuickSwitch = async (email: string) => {
    setSwitching(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'nossef2026' }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header
      className="glass-nav"
      style={{
        height: '68px',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left: Academic Year & Trimester Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-card)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
        >
          <Calendar size={14} color="#f59e0b" />
          <span>Tinan Akadémiku 2026/2027</span>
          <span style={{ color: 'var(--text-faint)' }}>•</span>
          <span style={{ color: '#fcd34d' }}>Trimestre 1 (CAU 1)</span>
        </div>

        <div className="badge badge-success">
          <span>{TETUN.status.active}</span>
        </div>
      </div>

      {/* Right: Quick Role Switcher (Demo) & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="#f59e0b" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Muda Kargu (Demo):</span>
          <select
            disabled={switching}
            onChange={(e) => handleQuickSwitch(e.target.value)}
            value={user?.email || ''}
            style={{
              padding: '6px 10px',
              fontSize: '0.775rem',
              borderRadius: '8px',
              background: 'rgba(18, 27, 48, 0.9)',
              borderColor: 'var(--border-accent)',
              color: '#fef08a',
              cursor: 'pointer',
              width: 'auto',
            }}
          >
            {demoUsers.map((du) => (
              <option key={du.email} value={du.email}>
                {du.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Icon */}
        <button
          onClick={() => router.push('/dashboard/komunikasaun')}
          title={TETUN.nav.communications}
          style={{
            position: 'relative',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#f59e0b',
            }}
          />
        </button>

        {/* User Mini Profile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingLeft: '8px',
            borderLeft: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            {user?.fullName ? user.fullName[0] : 'U'}
          </div>
          <div>
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user?.fullName || 'Utilizadór'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {user?.role ? TETUN.roles[user.role as keyof typeof TETUN.roles] || user.role : 'Utilizadór'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
