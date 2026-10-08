'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function OfflineSyncManager() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    updatePendingCount();
    window.addEventListener('nossef_queue_updated', updatePendingCount);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('nossef_queue_updated', updatePendingCount);
    };
  }, []);

  const updatePendingCount = () => {
    try {
      const queue = JSON.parse(localStorage.getItem('nossef_offline_queue') || '[]');
      setPendingCount(queue.length);
    } catch {
      setPendingCount(0);
    }
  };

  const syncOfflineQueue = async () => {
    try {
      const queue = JSON.parse(localStorage.getItem('nossef_offline_queue') || '[]');
      if (queue.length === 0) return;

      setIsSyncing(true);
      for (const item of queue) {
        await fetch('/api/attendance/offline/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }

      localStorage.removeItem('nossef_offline_queue');
      setPendingCount(0);
      setIsSyncing(false);
      setSyncSuccessMessage(TETUN.pwa.syncSuccess);
      setTimeout(() => setSyncSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Error syncing offline queue:', err);
      setIsSyncing(false);
    }
  };

  return (
    <>
      {/* Floating Offline / Sync Status Indicator per Stitch spec */}
      <div className="pwa-status-pill">
        {syncSuccessMessage && (
          <div
            style={{
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#047857',
              padding: '8px 14px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-card)',
              fontSize: '0.825rem',
              fontWeight: 700,
            }}
          >
            <CheckCircle2 size={16} color="#047857" />
            <span>{syncSuccessMessage}</span>
          </div>
        )}

        <div
          style={{
            background: isOnline ? '#FFFFFF' : 'var(--secondary)',
            border: `1px solid ${isOnline ? '#A7F3D0' : '#475569'}`,
            color: isOnline ? '#047857' : '#FFFFFF',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            fontWeight: 700,
            boxShadow: 'var(--shadow-sticky)',
          }}
        >
          {isOnline ? (
            <>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#059669',
                  display: 'inline-block',
                }}
              />
              <Wifi size={14} color="#059669" />
              <span>{TETUN.pwa.onlineStatus}</span>
            </>
          ) : (
            <>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  display: 'inline-block',
                }}
              />
              <WifiOff size={14} color="#EF4444" />
              <span>{TETUN.pwa.offlineStatus}</span>
            </>
          )}

          {pendingCount > 0 && (
            <button
              onClick={syncOfflineQueue}
              disabled={!isOnline || isSyncing}
              style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                color: '#B45309',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={12} className={isSyncing ? 'spin' : ''} />
              <span>{pendingCount} Pendente</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
