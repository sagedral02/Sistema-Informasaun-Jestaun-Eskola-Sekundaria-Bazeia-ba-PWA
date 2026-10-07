'use client';

import React, { useState, useEffect } from 'react';
import { HeartHandshake, ShieldAlert, Plus, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function CounselingPage() {
  const [activeTab, setActiveTab] = useState<'counseling' | 'discipline'>('counseling');
  const [cases, setCases] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, iRes] = await Promise.all([
          fetch('/api/counseling/cases'),
          fetch('/api/discipline/incidents'),
        ]);

        if (cRes.ok) setCases(await cRes.json());
        if (iRes.ok) setIncidents(await iRes.json());
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
          Orientasaun, Konsellu (BK) & Disiplina
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Akompañamentu vokasionál, kazu konfidensiál, no rejistu infragrénsia disiplinár estudante
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('counseling')}
          className={`btn ${activeTab === 'counseling' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <HeartHandshake size={16} />
          <span>Kazu Konsellu & Orientasaun (Konfidensiál)</span>
        </button>
        <button
          onClick={() => setActiveTab('discipline')}
          className={`btn ${activeTab === 'discipline' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <ShieldAlert size={16} />
          <span>Infrasaun & Disiplina Eskolár</span>
        </button>
      </div>

      {/* Tab 1: Counseling */}
      {activeTab === 'counseling' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Lista Kazu Konsellór (Restritu)</h3>
            <div className="badge badge-gold">
              <Lock size={12} />
              <span>Privasidade Konfidensiál Garantidu</span>
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nu. Kazu</th>
                  <th>Estudante</th>
                  <th>Kategoria</th>
                  <th>Títulu Kazu</th>
                  <th>Konsellór Responsável</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cases.length > 0 ? (
                  cases.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{c.case_number}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.student_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{c.student_no}</div>
                      </td>
                      <td><span className="badge badge-info">{c.category}</span></td>
                      <td style={{ fontWeight: 600 }}>{c.title}</td>
                      <td>{c.counselor_name}</td>
                      <td><span className="badge badge-success">{c.status}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      La iha kazu konsellu ativu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Discipline */}
      {activeTab === 'discipline' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            Rejistu Infrasaun Disiplinár & Sansaun
          </h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Estudante</th>
                  <th>Tipu Infrasaun</th>
                  <th>Deskrisaun</th>
                  <th>Gravidade</th>
                  <th>Pontu Kastigu</th>
                  <th>Relata Husi</th>
                </tr>
              </thead>
              <tbody>
                {incidents.length > 0 ? (
                  incidents.map((inc) => (
                    <tr key={inc.id}>
                      <td>{inc.incident_date}</td>
                      <td style={{ fontWeight: 600 }}>{inc.student_name}</td>
                      <td>{inc.infraction_type}</td>
                      <td>{inc.description}</td>
                      <td><span className="badge badge-warning">{inc.severity}</span></td>
                      <td style={{ fontWeight: 700, color: '#f87171' }}>+{inc.points} Pontu</td>
                      <td>{inc.reported_by_name}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      La iha rejistu infrasaun disiplinár.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
