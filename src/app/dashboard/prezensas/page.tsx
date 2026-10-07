'use client';

import React, { useState, useEffect } from 'react';
import { CalendarCheck, Users, Check, X, Clock, AlertCircle, WifiOff, Save, CheckCircle2 } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function AttendancePage() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [sessionDate, setSessionDate] = useState('2026-10-08');
  const [sessionMode, setSessionMode] = useState('DAILY');
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: string; notes: string }>>({});
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [simulateOffline, setSimulateOffline] = useState(false);

  useEffect(() => {
    loadClassrooms();
    loadRecentSessions();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudentsForClass(selectedClass);
    }
  }, [selectedClass]);

  async function loadClassrooms() {
    try {
      const res = await fetch('/api/classrooms');
      if (res.ok) {
        const data = await res.json();
        setClassrooms(data);
        if (data.length > 0) setSelectedClass(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadStudentsForClass(classId: string) {
    try {
      const res = await fetch(`/api/students?classroom_id=${classId}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
        // Default all to PREZENTE
        const initMap: Record<string, { status: string; notes: string }> = {};
        data.forEach((s: any) => {
          initMap[s.id] = { status: 'PREZENTE', notes: '' };
        });
        setAttendanceMap(initMap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadRecentSessions() {
    try {
      const res = await fetch('/api/attendance/sessions');
      if (res.ok) {
        setRecentSessions(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  }

  const setStudentStatus = (studentId: string, status: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || students.length === 0) return;
    setSubmitting(true);
    setSuccessMessage(null);

    const cls = classrooms.find((c) => c.id === selectedClass);
    const records = students.map((s) => ({
      student_id: s.id,
      status: attendanceMap[s.id]?.status || 'PREZENTE',
      notes: attendanceMap[s.id]?.notes || '',
    }));

    const payload = {
      client_mutation_id: `MUT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      entity_type: 'ATTENDANCE_SESSION',
      client_timestamp: new Date().toISOString(),
      data: {
        academic_year_id: cls?.academic_year_id,
        trimester_id: 'd9b73461-ea6a-466f-b2aa-4c284762cfb1', // T1
        classroom_id: selectedClass,
        session_date: sessionDate,
        session_mode: sessionMode,
        records,
      },
    };

    // If simulating offline or browser is offline
    if (simulateOffline || !navigator.onLine) {
      const queue = JSON.parse(localStorage.getItem('nossef_offline_queue') || '[]');
      queue.push(payload);
      localStorage.setItem('nossef_offline_queue', JSON.stringify(queue));
      window.dispatchEvent(new Event('nossef_queue_updated'));

      setSuccessMessage('Prezensas rai ona iha memória navegadór (Offline)! Sei sinkroniza bainhira internet liga fali.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/attendance/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academic_year_id: cls?.academic_year_id,
          trimester_id: 'd9b73461-ea6a-466f-b2aa-4c284762cfb1',
          classroom_id: selectedClass,
          session_date: sessionDate,
          session_mode: sessionMode,
          records,
        }),
      });

      if (res.ok) {
        setSuccessMessage('Prezensas rai no haruka ona ba servidór ho susesu!');
        loadRecentSessions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Prezensas & Falta Estudante (PWA Offline)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Rejistu prezensas loron-loron ka tuir aula ho suporta offline kompletu ba eskola Railaco
          </p>
        </div>

        {/* Offline simulator switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={simulateOffline}
              onChange={(e) => setSimulateOffline(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span style={{ color: simulateOffline ? '#f87171' : 'var(--text-muted)' }}>
              Simula Modo Offline (Sem Rede)
            </span>
          </label>
        </div>
      </div>

      {successMessage && (
        <div
          className="animate-fade-in"
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#86efac',
            padding: '14px 18px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Control Filters */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ minWidth: '220px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Hili Klase / Sala Aula
          </label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Data Prezensas
          </label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            style={{ width: '180px' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Tipu Prezensas
          </label>
          <select value={sessionMode} onChange={(e) => setSessionMode(e.target.value)} style={{ width: '180px' }}>
            <option value="DAILY">Loron-loron (Jerál)</option>
            <option value="LESSON">Tuir Aula (Disiplina)</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
          <button
            onClick={handleSaveAttendance}
            disabled={submitting || students.length === 0}
            className="btn btn-primary"
            style={{ padding: '12px 24px' }}
          >
            <Save size={16} />
            <span>{submitting ? 'Rai hela...' : 'Rai Prezensas Agora'}</span>
          </button>
        </div>
      </div>

      {/* Attendance Sheet */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Lista Estudante iha Klase ({students.length} Estudante)
          </h3>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
            <span className="badge badge-success">P = Prezente</span>
            <span className="badge badge-danger">F = Falta</span>
            <span className="badge badge-info">L = Lisensa</span>
            <span className="badge badge-warning">M = Moras</span>
            <span className="badge badge-gold">T = Tarde</span>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nu. Estudante</th>
                <th>Naran Kompletu</th>
                <th>Sexo</th>
                <th>Estatutu Prezensas</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((s) => {
                  const currentStatus = attendanceMap[s.id]?.status || 'PREZENTE';
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{s.student_no}</td>
                      <td style={{ fontWeight: 600 }}>{s.full_name}</td>
                      <td>{s.gender}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setStudentStatus(s.id, 'PREZENTE')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.775rem',
                              background: currentStatus === 'PREZENTE' ? '#10b981' : 'rgba(255,255,255,0.06)',
                              color: currentStatus === 'PREZENTE' ? '#000' : 'var(--text-muted)',
                              border: currentStatus === 'PREZENTE' ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                            }}
                          >
                            P (Prezente)
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentStatus(s.id, 'FALTA')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.775rem',
                              background: currentStatus === 'FALTA' ? '#ef4444' : 'rgba(255,255,255,0.06)',
                              color: currentStatus === 'FALTA' ? '#fff' : 'var(--text-muted)',
                              border: currentStatus === 'FALTA' ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                            }}
                          >
                            F (Falta)
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentStatus(s.id, 'LISENSA')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.775rem',
                              background: currentStatus === 'LISENSA' ? '#3b82f6' : 'rgba(255,255,255,0.06)',
                              color: currentStatus === 'LISENSA' ? '#fff' : 'var(--text-muted)',
                              border: currentStatus === 'LISENSA' ? '1px solid #3b82f6' : '1px solid var(--border-subtle)',
                            }}
                          >
                            L (Lisensa)
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentStatus(s.id, 'MORAS')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.775rem',
                              background: currentStatus === 'MORAS' ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                              color: currentStatus === 'MORAS' ? '#000' : 'var(--text-muted)',
                              border: currentStatus === 'MORAS' ? '1px solid #f59e0b' : '1px solid var(--border-subtle)',
                            }}
                          >
                            M (Moras)
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    La iha estudante iha klase ne'e.
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
