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
  { href: '/dashboard', label: TETUN.nav.dashboard, icon: LayoutDashboard, group: 'core' },
  { href: '/dashboard/admisasaun', label: TETUN.nav.admissions, icon: UserPlus, group: 'core' },
  { href: '/dashboard/estudante', label: TETUN.nav.students, icon: Users, group: 'core' },
  { href: '/dashboard/mestre', label: 'Mestre & Funsionáriu', icon: GraduationCap, group: 'core' },
  { href: '/dashboard/akademiku', label: TETUN.nav.academics, icon: BookOpenCheck, group: 'academic' },
  { href: '/dashboard/orariu', label: TETUN.nav.schedule, icon: CalendarDays, group: 'academic' },
  { href: '/dashboard/prezensas', label: TETUN.nav.attendance, icon: CalendarCheck, group: 'academic' },
  { href: '/dashboard/avaliasaun', label: TETUN.nav.assessments, icon: Award, group: 'academic' },
  { href: '/dashboard/boletin', label: TETUN.nav.reportCards, icon: FileSpreadsheet, group: 'academic' },
  { href: '/dashboard/finansas', label: TETUN.nav.finance, icon: DollarSign, group: 'finance' },
  { href: '/dashboard/konsellu', label: TETUN.nav.counseling, icon: HeartHandshake, group: 'support' },
  { href: '/dashboard/estrakurrikular', label: TETUN.nav.extracurricular, icon: Activity, group: 'support' },
  { href: '/dashboard/biblioteka', label: TETUN.nav.library, icon: Library, group: 'support' },
  { href: '/dashboard/patrimoniu', label: TETUN.nav.assets, icon: Boxes, group: 'support' },
  { href: '/dashboard/komunikasaun', label: TETUN.nav.communications, icon: Bell, group: 'support' },
  { href: '/dashboard/dokumentu', label: TETUN.nav.documents, icon: FolderArchive, group: 'admin' },
  { href: '/dashboard/relatoriu', label: TETUN.nav.reports, icon: BarChart3, group: 'admin' },
  { href: '/dashboard/audit', label: TETUN.nav.audit, icon: ShieldCheck, group: 'admin' },
  { href: '/dashboard/konfigurasaun', label: TETUN.nav.settings, icon: Settings, group: 'admin' },
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
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          zIndex: 70, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
        aria-hidden="true"
      />
      {/* Drawer Panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(80vw, 300px)',
          background: 'var(--bg-sidebar)', borderLeft: '1px solid var(--border-subtle)',
          zIndex: 80, display: 'flex', flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
          overflowY: 'auto',
        }}
        role="dialog"
        aria-label="Menu Navegasaun"
      >
        {/* Header */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', border: '1px solid var(--border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cross size={18} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>NOSSEF</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--gold-light)', fontWeight: 500 }}>Railaco • Ermera</div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon" aria-label="Taka menu">
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: '0.95rem', flexShrink: 0 }}>
                {user.fullName ? user.fullName[0] : 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.fullName || 'Utilizadór'}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--gold-light)', fontWeight: 500 }}>{TETUN.roles[user.role as keyof typeof TETUN.roles] || user.role}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav groups */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {groups.map((group) => {
            const items = navItems.filter(i => i.group === group);
            if (!items.length) return null;
            return (
              <div key={group} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', padding: '0 8px 6px' }}>{groupLabels[group]}</div>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '11px', padding: '10px 12px',
                        borderRadius: '10px', fontSize: '0.855rem', fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#fef08a' : 'var(--text-muted)',
                        background: isActive ? 'rgba(245,158,11,0.12)' : 'transparent',
                        border: isActive ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
                        transition: 'all 0.15s ease', marginBottom: '2px',
                      }}
                    >
                      <Icon size={18} color={isActive ? '#f59e0b' : '#94a3b8'} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Logout */}
        <div style={{ padding: '14px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', color: '#f87171', width: '100%', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}
          >
            <LogOut size={18} />
            <span>Sai husi Sistema</span>
          </button>
        </div>
      </div>
    </>
  );
}
