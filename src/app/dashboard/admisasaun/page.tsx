'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Filter, CheckCircle, XCircle, Clock, Plus, Users, GraduationCap } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function AdmissionsPage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Mane');
  const [birthDate, setBirthDate] = useState('2009-05-10');
  const [birthPlace, setBirthPlace] = useState('Railaco');
  const [prevSchool, setPrevSchool] = useState('');
  const [chosenMajorId, setChosenMajorId] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [appRes, perRes, majRes] = await Promise.all([
        fetch('/api/admissions/applicants'),
        fetch('/api/admissions/periods'),
        fetch('/api/majors'),
      ]);

      if (appRes.ok) setApplicants(await appRes.json());
      if (perRes.ok) setPeriods(await perRes.json());
      if (majRes.ok) {
        const majData = await majRes.json();
        setMajors(majData);
        if (majData.length > 0) setChosenMajorId(majData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateApplicant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (periods.length === 0) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/admissions/applicants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admission_period_id: periods[0].id,
          full_name: fullName,
          gender,
          birth_date: birthDate,
          birth_place: birthPlace,
          previous_school: prevSchool,
          chosen_major_id: chosenMajorId,
          guardian_name: guardianName,
          guardian_phone: guardianPhone,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setFullName('');
        setPrevSchool('');
        setGuardianName('');
        setGuardianPhone('');
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
            Admisasaun & Rejistu Estudante Foun
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Jestaun kandidatu estudante foun, periodu pendaftaran, no desizaun simu/rejeita
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Rejistu Kandidatu Foun</span>
        </button>
      </div>

      {/* Period Banner */}
      {periods.length > 0 && (
        <div
          className="glass-panel"
          style={{
            padding: '20px 24px',
            borderLeft: '4px solid var(--gold-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div className="badge badge-success" style={{ marginBottom: '6px' }}>
              Periodu Loke Hela (Ativu)
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{periods[0].name}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Data: {periods[0].start_date} to {periods[0].end_date} • Tinan Akadémiku: {periods[0].academic_year_code}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-light)' }}>
              {applicants.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kandidatu Rejistadu</div>
          </div>
        </div>
      )}

      {/* Applicants Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
          Lista Kandidatu Estudante
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nu. Pendaftaran</th>
                <th>Naran Kompletu</th>
                <th>Sexo</th>
                <th>Eskola Orijen</th>
                <th>Área / Departamentu</th>
                <th>Enkaregadu (Inan-Aman)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applicants.length > 0 ? (
                applicants.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{a.application_no}</td>
                    <td style={{ fontWeight: 600 }}>{a.full_name}</td>
                    <td>{a.gender}</td>
                    <td>{a.previous_school || '-'}</td>
                    <td>
                      <span className="badge badge-info">{a.chosen_major_code || 'CT'}</span>
                    </td>
                    <td>
                      <div>{a.guardian_name || '-'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{a.guardian_phone || ''}</div>
                    </td>
                    <td>
                      {a.status === 'ACCEPTED' && <span className="badge badge-success">Simu Ona (Aprovadu)</span>}
                      {a.status === 'SUBMITTED' && <span className="badge badge-warning">Haruka Ona</span>}
                      {a.status === 'ENROLLED' && <span className="badge badge-gold">Matrikuladu</span>}
                      {a.status === 'REJECTED' && <span className="badge badge-danger">La Simu</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    La iha kandidatu rejistadu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Modal */}
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
              Formuláriu Rejistu Kandidatu Foun
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Prenxe dadus pesoál no eskola orijen kandidatu nian
            </p>

            <form onSubmit={handleCreateApplicant} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Naran Kompletu Kandidatu
                </label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ez: Filomeno da Silva Soares"
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
                    placeholder="Ez: Railaco / Ermera"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Hili Área / Departamentu
                  </label>
                  <select value={chosenMajorId} onChange={(e) => setChosenMajorId(e.target.value)}>
                    {majors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Eskola Pré-Sekundária Orijen
                </label>
                <input
                  required
                  value={prevSchool}
                  onChange={(e) => setPrevSchool(e.target.value)}
                  placeholder="Ez: Eskola Pré-Sekundária Katólica Railaco"
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
                    placeholder="Ez: Manuel da Costa"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Nu. Telefone Enkaregadu
                  </label>
                  <input
                    required
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="+670 7712 3456"
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
