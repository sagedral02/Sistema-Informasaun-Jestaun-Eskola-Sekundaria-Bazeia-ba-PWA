'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Users, Plus, Calendar, Clock, Trophy } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function ExtracurricularPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/extracurricular/activities');
        if (res.ok) setActivities(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Atividade Estrakurrikulár Eskola
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Klube desportu, korál misa, escoteiro, no kruze vermella ba dezenvolvimentu karakter estudante
        </p>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {activities.map((act) => (
          <div key={act.id} className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trophy size={20} color="#f59e0b" />
              </div>
              <span className="badge badge-gold">{act.member_count || 1} Membru</span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>{act.name}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
              {act.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.775rem', color: 'var(--text-faint)' }}>
              <div><strong>Responsável:</strong> {act.supervisor_name || 'Mestre NOSSEF'}</div>
              <div><strong>Oráriu Treinu:</strong> {act.schedule_info || 'Semana-semana'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
