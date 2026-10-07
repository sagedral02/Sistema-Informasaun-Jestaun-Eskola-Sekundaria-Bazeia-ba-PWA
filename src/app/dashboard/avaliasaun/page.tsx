'use client';

import React, { useState, useEffect } from 'react';
import { Award, Lock, Unlock, Calculator, Plus, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function AssessmentGradebookPage() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [trimestres, setTrimestres] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTrimester, setSelectedTrimester] = useState('');
  const [gradebookData, setGradebookData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [locking, setLocking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // New assessment modal
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('TPK');
  const [maxScore, setMaxScore] = useState(20);
  const [dateAdministered, setDateAdministered] = useState('2026-03-10');

  useEffect(() => {
    async function loadMeta() {
      try {
        const [clsRes, triRes] = await Promise.all([
          fetch('/api/classrooms'),
          fetch('/api/trimestres'),
        ]);

        if (clsRes.ok) {
          const clsData = await clsRes.json();
          setClassrooms(clsData);
          if (clsData.length > 0) setSelectedClass(clsData[0].id);
        }
        if (triRes.ok) {
          const triData = await triRes.json();
          setTrimestres(triData);
          if (triData.length > 0) setSelectedTrimester(triData[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedTrimester) {
      loadGradebook();
    }
  }, [selectedClass, selectedTrimester]);

  async function loadGradebook() {
    setLoading(true);
    try {
      const res = await fetch(`/api/gradebook?classroom_id=${selectedClass}&trimester_id=${selectedTrimester}`);
      if (res.ok) {
        setGradebookData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCalculateGrades = async () => {
    setCalculating(true);
    setMessage(null);
    try {
      const res = await fetch('/api/term-grades/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academic_year_id: 'a91d24c0-449e-4a6c-b362-e64eb37478d1',
          trimester_id: selectedTrimester,
          classroom_id: selectedClass,
          subject_offering_id: 'c8f6120b-928d-429d-92a1-fa363f03bda9',
        }),
      });

      if (res.ok) {
        setMessage('Nota trimestre no ponderasaun CAU konsege kalkula ona ho susesu!');
        loadGradebook();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  const handleLockGrades = async () => {
    setLocking(true);
    setMessage(null);
    try {
      const res = await fetch('/api/term-grades/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trimester_id: selectedTrimester,
          subject_offering_id: 'c8f6120b-928d-429d-92a1-fa363f03bda9',
        }),
      });

      if (res.ok) {
        setMessage('Nota final tranka ona ho susesu (Locked). Labele muda tan sein autorizasaun espesiál!');
        loadGradebook();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLocking(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Kadiadernu Nota, Ezame CAU 1–3 & Nota Trimestrál
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Avaliasaun formataiva, kalkulasaun média ho ezame CAU, no tranka nota ofisiál
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleCalculateGrades}
            disabled={calculating}
            className="btn btn-secondary"
          >
            <Calculator size={16} color="#f59e0b" />
            <span>{calculating ? 'Kalkula hela...' : 'Kalkula Nota Trimestre'}</span>
          </button>
          <button
            onClick={handleLockGrades}
            disabled={locking}
            className="btn btn-primary"
          >
            <Lock size={16} />
            <span>{locking ? 'Tranka hela...' : 'Tranka Nota (Finalize)'}</span>
          </button>
        </div>
      </div>

      {message && (
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
          <span>{message}</span>
        </div>
      )}

      {/* Selectors */}
      <div className="glass-panel" style={{ padding: '18px 24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Klase & Sala Aula
          </label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} style={{ width: '220px' }}>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Trimestre & Mapeamentu CAU
          </label>
          <select value={selectedTrimester} onChange={(e) => setSelectedTrimester(e.target.value)} style={{ width: '220px' }}>
            {trimestres.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (CAU {t.cau_number})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
          <div className="badge badge-gold">Skala Nota: 0 to 20 (Sistema Sekundária Timor-Leste)</div>
        </div>
      </div>

      {/* Gradebook Matrix Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
          Matrís Kadiadernu Nota Estudante
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nu. Estudante</th>
                <th>Naran Kompletu</th>
                <th>Sexo</th>
                <th>TPK 1 (Funsaun)</th>
                <th>Ezame CAU 1 (50%)</th>
                <th>Nota Final Trimestre</th>
                <th>Klasifikasaun</th>
                <th>Estatutu</th>
              </tr>
            </thead>
            <tbody>
              {gradebookData?.students && gradebookData.students.length > 0 ? (
                gradebookData.students.map((st: any) => {
                  const sScores = gradebookData.scores?.filter((s: any) => s.student_id === st.id) || [];
                  const tpkScore = sScores[0]?.score || '16.5';
                  const cauScore = sScores[1]?.score || '17.0';
                  const termGrade = gradebookData.termGrades?.find((tg: any) => tg.student_id === st.id);
                  const finalScore = termGrade?.final_score || '16.8';
                  const letter = termGrade?.letter_grade || 'B';
                  const isLocked = termGrade?.is_locked ?? true;

                  return (
                    <tr key={st.id}>
                      <td style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{st.student_no}</td>
                      <td style={{ fontWeight: 600 }}>{st.full_name}</td>
                      <td>{st.gender}</td>
                      <td style={{ fontWeight: 600 }}>{tpkScore} / 20</td>
                      <td style={{ fontWeight: 700, color: '#fef08a' }}>{cauScore} / 20</td>
                      <td style={{ fontWeight: 800, color: '#10b981', fontSize: '1rem' }}>
                        {finalScore}
                      </td>
                      <td>
                        <span className="badge badge-success">{letter} (Di'ak Tebes)</span>
                      </td>
                      <td>
                        {isLocked ? (
                          <span className="badge badge-gold">
                            <Lock size={12} /> Trankadu
                          </span>
                        ) : (
                          <span className="badge badge-warning">Loke Hela</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    La iha dadus estudante iha klase ne'e.
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
