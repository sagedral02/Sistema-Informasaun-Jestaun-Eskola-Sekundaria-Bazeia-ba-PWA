'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import OfflineSyncManager from '@/components/OfflineSyncManager';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Default demo user if accessed directly
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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Sidebar user={user} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header user={user} />
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
      <OfflineSyncManager />
    </div>
  );
}
