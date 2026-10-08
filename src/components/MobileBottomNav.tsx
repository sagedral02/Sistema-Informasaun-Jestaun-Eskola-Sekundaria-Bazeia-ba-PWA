'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Award,
  DollarSign,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  onMenuOpen: () => void;
}

export default function MobileBottomNav({ onMenuOpen }: MobileBottomNavProps) {
  const pathname = usePathname();

  const primaryTabs = [
    { href: '/dashboard', label: 'Painél', icon: LayoutDashboard },
    { href: '/dashboard/estudante', label: 'Estudante', icon: Users },
    { href: '/dashboard/prezensas', label: 'Prezensas', icon: CalendarCheck },
    { href: '/dashboard/avaliasaun', label: 'Nota', icon: Award },
    { href: '/dashboard/finansas', label: 'Finansas', icon: DollarSign },
  ];

  return (
    <nav className="bottom-nav" aria-label="Navegasaun Prinsipal">
      <div className="bottom-nav-items">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || 
            (tab.href !== '/dashboard' && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`bottom-nav-item${isActive ? ' active' : ''}`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
        <button
          className="bottom-nav-item"
          onClick={onMenuOpen}
          aria-label="Menu Hotu"
          style={{ background: 'none', border: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
        >
          <Menu size={22} strokeWidth={1.8} />
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
}
