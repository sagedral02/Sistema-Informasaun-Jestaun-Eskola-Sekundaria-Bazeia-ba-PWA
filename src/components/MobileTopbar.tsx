'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Bell, Cross } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MobileTopbarProps {
  onMenuOpen: () => void;
  user?: any;
}

// Maps path to a nice page title in Tetun/Portuguese
function getPageTitle(pathname: string): string {
  const routes: Record<string, string> = {
    '/dashboard': 'Painél Prinsipál',
    '/dashboard/admisasaun': 'Admisasaun',
    '/dashboard/estudante': 'Dadus Estudante',
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
  // Find exact match or prefix match
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', border: '1px solid var(--border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Cross size={16} color="#f59e0b" />
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>{title}</div>
          <div style={{ fontSize: '0.6rem', color: 'var(--gold-light)', fontWeight: 500 }}>NOSSEF Railaco</div>
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => router.push('/dashboard/komunikasaun')}
          style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}
          aria-label="Notifikasaun"
        >
          <Bell size={18} />
          <span style={{ position: 'absolute', top: '7px', right: '7px', width: '7px', height: '7px', borderRadius: '50%', background: '#f59e0b', border: '1.5px solid var(--bg-app)' }} />
        </button>
        <button
          onClick={onMenuOpen}
          style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}
          aria-label="Loke Menu"
        >
          <Menu size={20} />
        </button>
      </div>
    </div>
  );
}
