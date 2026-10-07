'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, GraduationCap, Phone, MapPin, Calendar, CheckCircle2, UserCheck, Eye } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [gradeLevels, setGradeLevels] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Mane');
  const [birthDate, setBirthDate] = useState('2008-04-12');
  const [birthPlace, setBirthPlace] = useState('Railaco');
  const [address, setAddress] = useState('Aldeia Railaco Craic, Ermera');
  const [phone, setPhone] = useState('+670 7712 0000');
  const [classroomId, setClassroomId] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('Aman');
  const [guardianPhone, setGuardianPhone] = useState('+670 7712 1111');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [search, selectedClass]);

  async function loadData() {
    try {
      let url = '/api/students?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (selectedClass) url += `classroom_id=${encodeURIComponent(selectedClass)}&`;

      const [stdRes, clsRes, glRes, majRes] = await Promise.all([
        fetch(url),
        fetch('/api/classrooms'),
        fetch('/api/grade-levels'),
        fetch('/api/majors'),
      ]);

      if (stdRes.ok) setStudents(await stdRes.json());
      if (clsRes.ok) {
        const clsData = await clsRes.json();
        setClassrooms(clsData);
        if (clsData.length > 0 && !classroomId) setClassroomId(clsData[0].id);
      }
      if (glRes.ok) setGradeLevels(await glRes.json());
      if (majRes.ok) setMajors(await majRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const cls = classrooms.find((c) => c.id === classroomId);

      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          gender,
          birth_date: birthDate,
          birth_place: birthPlace,
          address,
          phone,
          entry_year: 2026,
          classroom_id: classroomId,
          grade_level_id: cls?.grade_level_id,
          major_id: cls?.major_id,
          academic_year_id: cls?.academic_year_id,
          guardian_name: guardianName,
          guardian_relationship: guardianRelationship,
          guardian_phone: guardianPhone,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setFullName('');
        setGuardianName('');
        loadData();
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
            Dadus Estudante sira (Perfil 360)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Base de dados ofisiál estudante, matríkula, enkaregadu de edukasaun, no istóriku klase
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Aumenta Estudante Foun</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buka tuir naran ka númeru estudante (NOSSEF)..."
            style={{ paddingLeft: '38px' }}
          />
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
        </div>

        <div style={{ width: '220px' }}>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">Klase Hotu-Hotu</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nu. Estudante</th>
                <th>Naran Kompletu</th>
                <th>Sexo</th>
                <th>Klase & Sala Aula</th>
                <th>Área / Departamentu</th>
                <th>Enkaregadu (Inan-Aman)</th>
                <th>Status</th>
                <th>Aksaun</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{s.student_no}</td>
                    <td style={{ fontWeight: 600 }}>{s.full_name}</td>
                    <td>{s.gender}</td>
                    <td>
                      <span className="badge badge-info">{s.classroom_name || 'Seidauk iha Klase'}</span>
                    </td>
                    <td>{s.major_code || 'CT'}</td>
                    <td>
                      <div>{s.guardian_name || '-'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{s.guardian_phone || ''}</div>
                    </td>
                    <td>
                      <span className="badge badge-success">{s.status}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.775rem' }}
                      >
                        <Eye size={14} />
                        <span>Detallu 360</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    La hetan dadus estudante ruma.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student 360 Detail Modal */}
      {selectedStudent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-gold">{selectedStudent.student_no}</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px' }}>{selectedStudent.full_name}</h3>
              </div>
              <div className="badge badge-success">{selectedStudent.status}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Klase & Sala Aula</div>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>{selectedStudent.classroom_name || '-'}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Área / Departamentu</div>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>{selectedStudent.major_name || 'Ciências Naturais'}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Data Moris & Fatin</div>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>{selectedStudent.birth_date} ({selectedStudent.birth_place || 'Railaco'})</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enkaregadu (Inan-Aman)</div>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>{selectedStudent.guardian_name || '-'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{selectedStudent.guardian_phone || ''}</div>
              </div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hela Fatin (Enderesu)</div>
              <div style={{ fontWeight: 500, marginTop: '2px' }}>{selectedStudent.address || 'Railaco Vila, Ermera'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedStudent(null)} className="btn btn-secondary">
                {TETUN.actions.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
              Rejistu Estudante Foun
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Prenxe dadus estudante no atribui ba klase ativu
            </p>

            <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Naran Kompletu Estudante
                </label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ez: Teresa Tilman dos Santos"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Sexo
                  </label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="Mane">Mane</option>
                    <option value="Feto">Feto</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Data Moris
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Fatin Moris
                  </label>
                  <input
                    required
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="Ez: Railaco"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Klase & Sala Aula
                  </label>
                  <select value={classroomId} onChange={(e) => setClassroomId(e.target.value)}>
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Hela Fatin (Enderesu)
                </label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ez: Aldeia Railaco Craic, Ermera"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Naran Inan-Aman / Enkaregadu
                  </label>
                  <input
                    required
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Ez: José dos Santos"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Telefone Enkaregadu
                  </label>
                  <input
                    required
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="+670 7712 9999"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  {TETUN.actions.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Rai hela...' : TETUN.actions.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
