'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, User, Info } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch('/api/audit-logs');
        if (res.ok) setLogs(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Rejistu Audit & Istóriku Seguransa
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Audit trail kompletu: autentikasaun, nota final, transasaun finansas, no modifikasaun dadus
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
          Rejistu Aksaun Operasionál (Audit Logs)
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data & Oras</th>
                <th>Utilizadór</th>
                <th>Aksaun (Action)</th>
                <th>Entidade</th>
                <th>Detallu Transasaun</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.user_name || 'Sistema'}</td>
                    <td><span className="badge badge-gold">{log.action}</span></td>
                    <td>{log.entity_type}</td>
                    <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--gold-light)' }}>
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    La iha rejistu audit foun.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
