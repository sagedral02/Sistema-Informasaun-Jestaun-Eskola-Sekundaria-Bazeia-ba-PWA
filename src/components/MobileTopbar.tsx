'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Bell, Cross } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MobileTopbarProps {
  onMenuOpen: () => void;
  user?: any;
}

function getPageTitle(pathname: string): string {
  const routes: Record<string, string> = {
    '/dashboard': 'Painél Prinsipál',
    '/dashboard/admisasaun': 'Admisasaun',
    '/dashboard/estudante': 'Dadus Estudante',
    '/dashboard/mestre': 'Mestre & Funsionáriu',
    '/dashboard/akademiku': 'Estrutura Akadémika',
    '/dashboard/orariu': 'Oráriu Aula',
    '/dashboard/prezensas': 'Prezensas',
    '/dashboard/avaliasaun': 'Avaliasaun & CAU',
    '/dashboard/boletin': 'Boletin de Notas',
    '/dashboard/finansas': 'Finansas & SPP',
    '/dashboard/konsellu': 'Konsellu & Disiplina',
    '/dashboard/estrakurrikular': 'Estrakurrikulár',
    '/dashboard/biblioteka': 'Biblioteka',
    '/dashboard/patrimoniu': 'Patrimóniu',
    '/dashboard/komunikasaun': 'Avizu & Notifikasaun',
    '/dashboard/dokumentu': 'Dokumentu',
    '/dashboard/relatoriu': 'Relatóriu',
    '/dashboard/audit': 'Rejistu Audit',
    '/dashboard/konfigurasaun': 'Konfigurasaun',
  };
  if (routes[pathname]) return routes[pathname];
  for (const [key, val] of Object.entries(routes)) {
    if (pathname.startsWith(key) && key !== '/dashboard') return val;
  }
  return 'NOSSEF Railaco';
}

export default function MobileTopbar({ onMenuOpen, user }: MobileTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const title = getPageTitle(pathname);

  return (
    <div className="mobile-topbar">
      {/* Logo / School identifier */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Cross size={16} color="#FFFFFF" />
        </div>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {title}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            NOSSEF Railaco
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => router.push('/dashboard/komunikasaun')}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '4px',
            background: 'var(--surface-muted)',
            border: '1px solid var(--border-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-body)',
            position: 'relative',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          aria-label="Notifikasaun"
        >
          <Bell size={17} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--crimson)',
            }}
          />
        </button>

        <button
          onClick={onMenuOpen}
          style={{
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
            flexShrink: 0,
          }}
          aria-label="Loke Menu"
        >
          <Menu size={18} />
        </button>
      </div>
    </div>
  );
}
