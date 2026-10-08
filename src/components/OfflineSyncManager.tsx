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

    // Check offline items in localStorage / IndexedDB queue
    updatePendingCount();

    // Listen to custom event for queue additions
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
      setTimeout(() => setSyncSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error syncing offline queue:', err);
      setIsSyncing(false);
    }
  };

  return (
    <>
      {/* Floating Offline / Sync Status Indicator */}
      <div className="pwa-status-pill">
        {syncSuccessMessage && (
          <div
            className="animate-fade-in"
            style={{
              background: 'rgba(16, 185, 129, 0.95)',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={16} />
            {syncSuccessMessage}
          </div>
        )}

        <div
          style={{
            background: isOnline ? 'rgba(15, 23, 42, 0.9)' : 'rgba(239, 68, 68, 0.95)',
            border: `1px solid ${isOnline ? 'rgba(255, 255, 255, 0.15)' : 'rgba(239, 68, 68, 0.4)'}`,
            backdropFilter: 'blur(10px)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.8rem',
            fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          {isOnline ? (
            <>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <Wifi size={14} color="#10b981" />
              <span>{TETUN.pwa.onlineStatus}</span>
            </>
          ) : (
            <>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
              <WifiOff size={14} color="#fff" />
              <span>{TETUN.pwa.offlineStatus}</span>
            </>
          )}

          {pendingCount > 0 && (
            <button
              onClick={syncOfflineQueue}
              disabled={!isOnline || isSyncing}
              style={{
                background: 'rgba(245, 158, 11, 0.3)',
                border: '1px solid #f59e0b',
                color: '#fef08a',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RefreshCw size={12} className={isSyncing ? 'pulse-glow' : ''} />
              {pendingCount} {TETUN.pwa.pendingMutations}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
