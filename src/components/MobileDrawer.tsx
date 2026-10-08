'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, UserPlus, Users, GraduationCap, CalendarDays, CalendarCheck,
  Award, BookOpenCheck, FileSpreadsheet, FileText, DollarSign, HeartHandshake,
  Activity, Library, Boxes, Bell, FolderArchive, BarChart3, ShieldCheck,
  Settings, LogOut, Cross, X
} from 'lucide-react';
import { TETUN } from '@/lib/tetun';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

const navItems = [
  { href: '/dashboard', label: TETUN.nav.dashboard, icon: LayoutDashboard, group: 'core', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'CURRICULUM_ADMIN', 'SECRETARY', 'TEACHER', 'HOMEROOM_TEACHER', 'COUNSELOR', 'LIBRARIAN', 'ASSET_OFFICER'] },
  { href: '/dashboard/admisasaun', label: TETUN.nav.admissions, icon: UserPlus, group: 'core', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'SECRETARY'] },
  { href: '/dashboard/estudante', label: TETUN.nav.students, icon: Users, group: 'core', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'CURRICULUM_ADMIN', 'SECRETARY', 'TEACHER', 'HOMEROOM_TEACHER', 'COUNSELOR', 'LIBRARIAN', 'ASSET_OFFICER'] },
  { href: '/dashboard/mestre', label: 'Mestre & Funsionáriu', icon: GraduationCap, group: 'core', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'SECRETARY'] },
  { href: '/dashboard/akademiku', label: TETUN.nav.academics, icon: BookOpenCheck, group: 'academic', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'CURRICULUM_ADMIN', 'TEACHER', 'HOMEROOM_TEACHER'] },
  { href: '/dashboard/orariu', label: TETUN.nav.schedule, icon: CalendarDays, group: 'academic', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'CURRICULUM_ADMIN', 'TEACHER', 'HOMEROOM_TEACHER'] },
  { href: '/dashboard/prezensas', label: TETUN.nav.attendance, icon: CalendarCheck, group: 'academic', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'CURRICULUM_ADMIN', 'TEACHER', 'HOMEROOM_TEACHER'] },
  { href: '/dashboard/avaliasaun', label: TETUN.nav.assessments, icon: Award, group: 'academic', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'CURRICULUM_ADMIN', 'TEACHER', 'HOMEROOM_TEACHER'] },
  { href: '/dashboard/boletin', label: TETUN.nav.reportCards, icon: FileSpreadsheet, group: 'academic', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'CURRICULUM_ADMIN', 'TEACHER', 'HOMEROOM_TEACHER'] },
  { href: '/dashboard/finansas', label: TETUN.nav.finance, icon: DollarSign, group: 'finance', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'FINANCE_ADMIN'] },
  { href: '/dashboard/konsellu', label: TETUN.nav.counseling, icon: HeartHandshake, group: 'support', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'COUNSELOR', 'LIBRARIAN', 'ASSET_OFFICER'] },
  { href: '/dashboard/estrakurrikular', label: TETUN.nav.extracurricular, icon: Activity, group: 'support', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'COUNSELOR', 'LIBRARIAN', 'ASSET_OFFICER'] },
  { href: '/dashboard/biblioteka', label: TETUN.nav.library, icon: Library, group: 'support', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'COUNSELOR', 'LIBRARIAN', 'ASSET_OFFICER'] },
  { href: '/dashboard/patrimoniu', label: TETUN.nav.assets, icon: Boxes, group: 'support', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'COUNSELOR', 'LIBRARIAN', 'ASSET_OFFICER'] },
  { href: '/dashboard/komunikasaun', label: TETUN.nav.communications, icon: Bell, group: 'support', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'COUNSELOR', 'LIBRARIAN', 'ASSET_OFFICER'] },
  { href: '/dashboard/dokumentu', label: TETUN.nav.documents, icon: FolderArchive, group: 'admin', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
  { href: '/dashboard/relatoriu', label: TETUN.nav.reports, icon: BarChart3, group: 'admin', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
  { href: '/dashboard/audit', label: TETUN.nav.audit, icon: ShieldCheck, group: 'admin', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
  { href: '/dashboard/konfigurasaun', label: TETUN.nav.settings, icon: Settings, group: 'admin', allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
];

const groupLabels: Record<string, string> = {
  core: 'Prinsipál',
  academic: 'Akadémiku',
  finance: 'Finansas',
  support: 'Suportu',
  admin: 'Administrasaun',
};

export default function MobileDrawer({ isOpen, onClose, user }: MobileDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/login');
    onClose();
  };

  const groups = ['core', 'academic', 'finance', 'support', 'admin'];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(2px)',
          zIndex: 1100,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(82vw, 320px)',
          background: '#FFFFFF',
          borderLeft: '1px solid var(--border-card)',
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.16,1,0.3,1)',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-modal)',
        }}
        role="dialog"
        aria-label="Menu Navegasaun"
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 16px 14px',
            borderBottom: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            background: 'var(--surface-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '4px',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Cross size={18} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                NOSSEF Railaco
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Ermera, Timor-Leste
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Taka menu"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              border: '1px solid var(--border-strong)',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-card)',
              background: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '4px',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  flexShrink: 0,
                }}
              >
                {user.fullName ? user.fullName[0] : 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.fullName || 'Utilizadór'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {TETUN.roles[user.role as keyof typeof TETUN.roles] || user.role}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav groups */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {groups.map((group) => {
            const items = navItems.filter((i) => i.group === group && (!user?.role || i.allowedRoles.includes(user.role)));
            if (!items.length) return null;
            return (
              <div key={group} style={{ marginBottom: '14px' }}>
                <div
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--text-muted)',
                    padding: '0 10px 6px',
                  }}
                >
                  {groupLabels[group]}
                </div>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'var(--primary)' : 'var(--text-body)',
                        background: isActive ? 'var(--primary-light)' : 'transparent',
                        border: isActive ? '1px solid var(--primary-border)' : '1px solid transparent',
                        transition: 'all 0.15s ease',
                        marginBottom: '2px',
                        minHeight: '44px',
                      }}
                    >
                      <Icon size={18} color={isActive ? 'var(--primary)' : '#64748B'} />
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {isActive && (
                        <div
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Logout */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-card)',
            flexShrink: 0,
            background: 'var(--surface-muted)',
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '4px',
              color: 'var(--crimson)',
              width: '100%',
              background: 'var(--crimson-light)',
              border: '1px solid var(--crimson-border)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
          >
            <LogOut size={16} />
            <span>Sai husi Sistema</span>
          </button>
        </div>
      </div>
    </>
  );
}
