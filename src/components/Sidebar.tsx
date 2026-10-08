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
        background: 'var(--secondary)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
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
          padding: '20px 18px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #047857 0%, #064E3B 100%)',
              border: '1px solid rgba(167, 243, 208, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Cross size={20} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '0.975rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              NOSSEF Railaco
            </h1>
            <p style={{ fontSize: '0.675rem', color: '#94A3B8', fontWeight: 500, marginTop: '2px' }}>
              Ensino Secundário Geral • Ermera
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: '18px' }}>
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#64748B',
                padding: '0 8px 6px',
              }}
            >
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '0.835rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    background: isActive ? 'rgba(4, 120, 87, 0.25)' : 'transparent',
                    border: isActive ? '1px solid rgba(4, 120, 87, 0.5)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                    marginBottom: '2px',
                  }}
                >
                  <Icon size={17} color={isActive ? '#34D399' : '#64748B'} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {isActive && (
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#34D399',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.2)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
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
                flexShrink: 0,
              }}
            >
              {user?.fullName ? user.fullName[0] : 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: '#FFFFFF',
                }}
              >
                {user?.fullName || 'Utilizadór Sistema'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 500 }}>
                {TETUN.roles[user?.role as keyof typeof TETUN.roles] || user?.role || 'Administrasaun'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title={TETUN.auth.logout}
            style={{
              padding: '6px',
              borderRadius: '4px',
              color: '#94A3B8',
              transition: 'all 0.15s ease',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#EF4444')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#94A3B8')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
