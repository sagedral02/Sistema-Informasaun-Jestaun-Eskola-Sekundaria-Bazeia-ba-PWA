'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, Plus, AlertCircle, CheckCircle2, Users, MapPin } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);

  // New slot modal states
  const [showModal, setShowModal] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [periodNumber, setPeriodNumber] = useState(1);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('08:45');
  const [roomNumber, setRoomNumber] = useState('Sala 01 - S. Inácio');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const days = [
    { num: 1, name: 'Segunda-Feira' },
    { num: 2, name: 'Tersa-Feira' },
    { num: 3, name: 'Kuarta-Feira' },
    { num: 4, name: 'Kinta-Feira' },
    { num: 5, name: 'Sesta-Feira' },
  ];

  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    async function loadData() {
      try {
        let url = '/api/schedules?';
        if (selectedClass) url += `classroom_id=${selectedClass}&`;

        const [schRes, clsRes] = await Promise.all([
          fetch(url),
          fetch('/api/classrooms'),
        ]);

        if (schRes.ok) setSchedules(await schRes.json());
        if (clsRes.ok) {
          const clsData = await clsRes.json();
          setClassrooms(clsData);
          if (clsData.length > 0 && !selectedClass) setSelectedClass(clsData[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedClass]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Oráriu Aula Semanál
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Oráriu aula loron-loron, detesaun kolizaun mestre/sala (Collision engine), no substituisaun
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{ width: '220px' }}
          >
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timetable Grid View */}
      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.825rem' }}>
          <thead>
            <tr>
              <th
                style={{
                  padding: '14px',
                  background: 'rgba(10, 16, 31, 0.9)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--gold-light)',
                  width: '90px',
                }}
              >
                Oras / Períodu
              </th>
              {days.map((d) => (
                <th
                  key={d.num}
                  style={{
                    padding: '14px',
                    background: 'rgba(10, 16, 31, 0.9)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-main)',
                    fontWeight: 700,
                  }}
                >
                  {d.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((p) => (
              <tr key={p}>
                <td
                  style={{
                    padding: '14px 8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                  }}
                >
                  Períodu {p}
                </td>
                {days.map((d) => {
                  const entry = schedules.find((s) => s.day_of_week === d.num && s.period_number === p);
                  return (
                    <td
                      key={d.num}
                      style={{
                        padding: '12px',
                        border: '1px solid var(--border-subtle)',
                        verticalAlign: 'top',
                        background: entry ? 'rgba(30, 58, 138, 0.15)' : 'transparent',
                        height: '75px',
                      }}
                    >
                      {entry ? (
                        <div
                          style={{
                            padding: '8px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '6px',
                            textAlign: 'left',
                          }}
                        >
                          <div style={{ fontWeight: 700, color: '#fef08a' }}>{entry.subject_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {entry.teacher_name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--gold-light)', marginTop: '2px' }}>
                            {entry.room_number || 'Sala 01'}
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
