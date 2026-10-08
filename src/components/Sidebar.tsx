'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, UserPlus, Users, GraduationCap, CalendarDays, CalendarCheck,
  Award, BookOpenCheck, FileSpreadsheet, FileText, DollarSign, HeartHandshake,
  Activity, Library, Boxes, Bell, FolderArchive, BarChart3, ShieldCheck,
  Settings, LogOut, Cross, ChevronDown, UserCheck
} from 'lucide-react';
import { TETUN } from '@/lib/tetun';

interface SidebarProps {
  user?: any;
}

const navGroups = [
  {
    label: 'Prinsipál',
    items: [
      { href: '/dashboard', label: TETUN.nav.dashboard, icon: LayoutDashboard },
      { href: '/dashboard/admisasaun', label: TETUN.nav.admissions, icon: UserPlus },
      { href: '/dashboard/estudante', label: TETUN.nav.students, icon: Users },
      { href: '/dashboard/mestre', label: 'Mestre & Funsionáriu', icon: GraduationCap },
    ],
  },
  {
    label: 'Akadémiku',
    items: [
      { href: '/dashboard/akademiku', label: TETUN.nav.academics, icon: BookOpenCheck },
      { href: '/dashboard/orariu', label: TETUN.nav.schedule, icon: CalendarDays },
      { href: '/dashboard/prezensas', label: TETUN.nav.attendance, icon: CalendarCheck },
      { href: '/dashboard/avaliasaun', label: TETUN.nav.assessments, icon: Award },
      { href: '/dashboard/boletin', label: TETUN.nav.reportCards, icon: FileSpreadsheet },
    ],
  },
  {
    label: 'Finansas',
    items: [
      { href: '/dashboard/finansas', label: TETUN.nav.finance, icon: DollarSign },
    ],
  },
  {
    label: 'Suportu',
    items: [
      { href: '/dashboard/konsellu', label: TETUN.nav.counseling, icon: HeartHandshake },
      { href: '/dashboard/estrakurrikular', label: TETUN.nav.extracurricular, icon: Activity },
      { href: '/dashboard/biblioteka', label: TETUN.nav.library, icon: Library },
      { href: '/dashboard/patrimoniu', label: TETUN.nav.assets, icon: Boxes },
      { href: '/dashboard/komunikasaun', label: TETUN.nav.communications, icon: Bell },
    ],
  },
  {
    label: 'Administrasaun',
    items: [
      { href: '/dashboard/dokumentu', label: TETUN.nav.documents, icon: FolderArchive },
      { href: '/dashboard/relatoriu', label: TETUN.nav.reports, icon: BarChart3 },
      { href: '/dashboard/audit', label: TETUN.nav.audit, icon: ShieldCheck },
      { href: '/dashboard/konfigurasaun', label: TETUN.nav.settings, icon: Settings },
    ],
  },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        flexShrink: 0,
        overflowY: 'auto',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '22px 18px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px', height: '42px', borderRadius: '11px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
              border: '1px solid var(--border-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)', flexShrink: 0,
            }}
          >
            <Cross size={22} color="#f59e0b" />
          </div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              NOSSEF Railaco
            </h1>
            <p style={{ fontSize: '0.68rem', color: 'var(--gold-light)', fontWeight: 500, marginTop: '1px' }}>
              Sekundária Katólika • Ermera
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-faint)', padding: '0 8px 7px' }}>
              {group.label}
            </div>
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 11px',
                    borderRadius: '9px', fontSize: '0.835rem', fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#fef08a' : 'var(--text-muted)',
                    background: isActive ? 'rgba(245,158,11,0.11)' : 'transparent',
                    border: isActive ? '1px solid rgba(245,158,11,0.28)' : '1px solid transparent',
                    transition: 'all 0.13s ease', marginBottom: '2px',
                  }}
                >
                  <Icon size={17} color={isActive ? '#f59e0b' : '#94a3b8'} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {isActive && <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--gold-500)', flexShrink: 0 }} />}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div style={{ padding: '14px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(7,11,20,0.6)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#000', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
              }}
            >
              {user?.fullName ? user.fullName[0] : 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)' }}>
                {user?.fullName || 'Utilizadór Sistema'}
              </div>
              <div style={{ fontSize: '0.66rem', color: 'var(--gold-light)', fontWeight: 500 }}>
                {TETUN.roles[user?.role as keyof typeof TETUN.roles] || user?.role || 'Administrasaun'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title={TETUN.auth.logout}
            style={{ padding: '8px', borderRadius: '8px', color: '#94a3b8', transition: 'all 0.2s ease', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
