'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import OfflineSyncManager from '@/components/OfflineSyncManager';
import MobileBottomNav from '@/components/MobileBottomNav';
import MobileDrawer from '@/components/MobileDrawer';
import MobileTopbar from '@/components/MobileTopbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser({
            fullName: 'Maria Madalena Soares, S.Pd',
            email: 'admin@nossef.edu.tl',
            role: 'SUPER_ADMIN',
            roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
          });
        }
      } catch {
        setUser({
          fullName: 'Maria Madalena Soares, S.Pd',
          email: 'admin@nossef.edu.tl',
          role: 'SUPER_ADMIN',
          roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
        });
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  return (
    <div className="app-shell">
      {/* Desktop/Tablet Sidebar — hidden on mobile via CSS */}
      <div className="desktop-sidebar">
        <Sidebar user={user} />
      </div>

      {/* Main Content Area */}
      <div className="main-content-area">
        {/* Desktop Header — hidden on mobile via CSS */}
        <div className="desktop-header">
          <Header user={user} />
        </div>

        {/* Mobile Topbar — shown only on mobile */}
        <MobileTopbar onMenuOpen={() => setDrawerOpen(true)} user={user} />

        {/* Page content */}
        <main className="page-content">
          {children}
        </main>
      </div>

      {/* Mobile: Bottom Navigation */}
      <MobileBottomNav onMenuOpen={() => setDrawerOpen(true)} />

      {/* Mobile: Full Menu Drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
      />

      {/* PWA Offline Sync Manager */}
      <OfflineSyncManager />
    </div>
  );
}
