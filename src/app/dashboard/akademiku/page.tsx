'use client';

import React, { useState, useEffect } from 'react';
import { GraduationCap, Calendar, BookOpen, Users, Plus, CheckCircle2, Clock } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState<'year' | 'classes' | 'subjects'>('year');
  const [years, setYears] = useState<any[]>([]);
  const [trimestres, setTrimestres] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachingAssignments, setTeachingAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [yrRes, triRes, clsRes, subRes, taRes] = await Promise.all([
          fetch('/api/academic-years'),
          fetch('/api/trimestres'),
          fetch('/api/classrooms'),
          fetch('/api/subjects'),
          fetch('/api/teaching-assignments'),
        ]);

        if (yrRes.ok) setYears(await yrRes.json());
        if (triRes.ok) setTrimestres(await triRes.json());
        if (clsRes.ok) setClassrooms(await clsRes.json());
        if (subRes.ok) setSubjects(await subRes.json());
        if (taRes.ok) setTeachingAssignments(await taRes.json());
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
          Estrutura Akadémika & Kurríkulu
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Jestaun tinan akadémiku, trimestre & CAU 1–3, klase, sala aula, disiplina, no distribuisaun mestre
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('year')}
          className={`btn ${activeTab === 'year' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Calendar size={16} />
          <span>Tinan Akadémiku & Trimestre</span>
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`btn ${activeTab === 'classes' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <GraduationCap size={16} />
          <span>Klase & Sala Aula</span>
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`btn ${activeTab === 'subjects' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <BookOpen size={16} />
          <span>Disiplina & Mestre Pengampu</span>
        </button>
      </div>

      {/* Tab 1: Years & Trimesters */}
      {activeTab === 'year' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Year Card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
              Tinan Akadémiku Ativu
            </h3>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kódigu</th>
                    <th>Naran Tinan Letivo</th>
                    <th>Data Hahu</th>
                    <th>Data Remata</th>
                    <th>Total Klase</th>
                    <th>Total Estudante</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {years.map((y) => (
                    <tr key={y.id}>
                      <td style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{y.code}</td>
                      <td style={{ fontWeight: 600 }}>{y.name}</td>
                      <td>{y.start_date}</td>
                      <td>{y.end_date}</td>
                      <td>{y.classroom_count || 4}</td>
                      <td>{y.student_count || 3}</td>
                      <td>
                        {y.is_active ? (
                          <span className="badge badge-success">Ativu (Ano Letivo Agora)</span>
                        ) : (
                          <span className="badge badge-warning">Pendente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trimesters Card (PRD: Trimester 1..3 mapped 1-to-1 with CAU 1..3) */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
              Trimestre & Ligasaun Ezame CAU 1–3
            </h3>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Trimestre</th>
                    <th>Naran Trimestre</th>
                    <th>Mapeamentu Ezame CAU</th>
                    <th>Data Hahu</th>
                    <th>Data Remata</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trimestres.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 700 }}>Trimestre {t.number}</td>
                      <td style={{ fontWeight: 600 }}>{t.name}</td>
                      <td>
                        <span className="badge badge-gold">CAU {t.cau_number}</span>
                      </td>
                      <td>{t.start_date}</td>
                      <td>{t.end_date}</td>
                      <td>
                        {t.is_active ? (
                          <span className="badge badge-success">Trimestre Ativu</span>
                        ) : (
                          <span className="badge badge-warning">Seidauk Loke</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Classrooms */}
      {activeTab === 'classes' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            Lista Klase & Sala Aula NOSSEF Railaco
          </h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kódigu Klase</th>
                  <th>Naran Klase</th>
                  <th>Nivel</th>
                  <th>Área / Departamentu</th>
                  <th>Sala Aula</th>
                  <th>Mestre Titulár (Wali Kelas)</th>
                  <th>Kapasidade</th>
                  <th>Estudante</th>
                </tr>
              </thead>
              <tbody>
                {classrooms.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{c.code}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.grade_level_code} ({c.grade_level_name})</td>
                    <td>
                      <span className="badge badge-info">{c.major_code}</span>
                    </td>
                    <td>{c.room_number}</td>
                    <td>{c.homeroom_teacher_name || 'Seidauk iha'}</td>
                    <td>{c.capacity || 35}</td>
                    <td>
                      <span className="badge badge-gold">{c.student_count || 0} Estudante</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Subjects & Assignments */}
      {activeTab === 'subjects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
              Disiplina / Matéria Kurríkulu Sekundária
            </h3>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kódigu</th>
                    <th>Naran Disiplina</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{s.code}</td>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>
                        <span className="badge badge-success">Ativu</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
              Atribuisaun Mestre ba Sala Aula
            </h3>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Klase</th>
                    <th>Disiplina</th>
                    <th>Mestre Pengampu</th>
                  </tr>
                </thead>
                <tbody>
                  {teachingAssignments.map((ta) => (
                    <tr key={ta.id}>
                      <td style={{ fontWeight: 700 }}>{ta.classroom_name}</td>
                      <td>{ta.subject_name} ({ta.subject_code})</td>
                      <td style={{ fontWeight: 600, color: '#fef08a' }}>{ta.teacher_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
