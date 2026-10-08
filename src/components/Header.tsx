'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, UserCheck, Calendar, Shield, Sparkles, FileSpreadsheet } from 'lucide-react';
import { TETUN } from '@/lib/tetun';
import ExcelPautaUploadModal from '@/components/ExcelPautaUploadModal';

interface HeaderProps {
  user?: any;
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [switching, setSwitching] = useState(false);
  const [showPautaModal, setShowPautaModal] = useState(false);

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
      className="desktop-header"
      style={{
        height: 'var(--header-height)',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: '#FFFFFF',
        borderBottom: '1px solid var(--border-card)',
      }}
    >
      {/* Left: Academic Year & Trimester Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--surface-muted)',
            border: '1px solid var(--border-strong)',
            padding: '5px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-main)',
          }}
        >
          <Calendar size={14} color="var(--primary)" />
          <span>Tinan Akadémiku 2026/2027</span>
          <span style={{ color: 'var(--text-faint)' }}>•</span>
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Trimestre 1 (CAU 1)</span>
        </div>

        <div className="badge badge-verified">
          <span className="badge-dot" />
          <span>{TETUN.status.active}</span>
        </div>
      </div>

      {/* Right: Quick Role Switcher (Demo) & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="var(--primary)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Muda Kargu:</span>
          <select
            disabled={switching}
            onChange={(e) => handleQuickSwitch(e.target.value)}
            value={user?.email || ''}
            style={{
              padding: '4px 8px',
              fontSize: '0.78rem',
              borderRadius: '4px',
              background: '#FFFFFF',
              borderColor: 'var(--border-strong)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              width: 'auto',
              minHeight: '34px',
            }}
          >
            {demoUsers.map((du) => (
              <option key={du.email} value={du.email}>
                {du.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Excel Pauta Upload Button for Teachers & Homeroom */}
        <button
          onClick={() => setShowPautaModal(true)}
          className="btn btn-primary"
          style={{
            height: '36px',
            padding: '0 12px',
            fontSize: '0.78rem',
            gap: '6px',
            fontWeight: 700,
          }}
          title="Submete Pauta de Valor via EXCEL"
        >
          <FileSpreadsheet size={15} />
          <span>Upload Valor Excel</span>
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => router.push('/dashboard/komunikasaun')}
          title={TETUN.nav.communications}
          style={{
            position: 'relative',
            width: '36px',
            height: '36px',
            borderRadius: '4px',
            background: 'var(--surface-muted)',
            border: '1px solid var(--border-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-body)',
            cursor: 'pointer',
          }}
        >
          <Bell size={16} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'var(--crimson)',
            }}
          />
        </button>

        {/* User Mini Profile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingLeft: '6px',
            borderLeft: '1px solid var(--border-card)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {user?.fullName ? user.fullName[0] : 'U'}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {user?.fullName || 'Utilizadór Sistema'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {TETUN.roles[user?.role as keyof typeof TETUN.roles] || user?.role || 'Administrasaun'}
            </div>
          </div>
        </div>
      </div>

      <ExcelPautaUploadModal
        isOpen={showPautaModal}
        onClose={() => setShowPautaModal(false)}
        user={user}
      />
    </header>
  );
}
