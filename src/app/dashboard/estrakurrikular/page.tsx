'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  Plus,
  Calendar,
  Clock,
  Trophy,
  Award,
  Music,
  HeartHandshake,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Sparkles,
  UserCheck,
  ChevronRight,
  X,
  Cross,
} from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function ExtracurricularPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'korenossef' | 'pastoral' | 'drumband'>('general');
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Registration modal
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string>('KORENOSSEF');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('10.º Ano CT-A');
  const [studentRole, setStudentRole] = useState('Membru Ativu');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegSuccess(`Estudante ${studentName} konsege rejista ona ba ${selectedEntity} ho kargu ${studentRole}!`);
    setTimeout(() => {
      setShowRegModal(false);
      setRegSuccess(null);
      setStudentName('');
    }, 1800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Ekstrakurrikulár & Organizasaun Khas NOSSEF
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            KORENOSSEF (Lideransa Katólika), Ekipa Pastoral Eskolár, Drum Band / Fanfarra, no Klube Desportu
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedEntity(
              activeTab === 'korenossef'
                ? 'KORENOSSEF (Lideransa)'
                : activeTab === 'pastoral'
                ? 'Ekipa Pastoral Eskolár'
                : activeTab === 'drumband'
                ? 'Drum Band & Fanfarra'
                : 'Klube Desportu'
            );
            setShowRegModal(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>Rejistu Membru Foun</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('general')}
          className={`btn ${activeTab === 'general' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Activity size={16} />
          <span>Klube & Desportu Jerál</span>
        </button>

        <button
          onClick={() => setActiveTab('korenossef')}
          className={`btn ${activeTab === 'korenossef' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Award size={16} />
          <span>KORENOSSEF (Lideransa Katólika)</span>
        </button>

        <button
          onClick={() => setActiveTab('pastoral')}
          className={`btn ${activeTab === 'pastoral' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Cross size={16} />
          <span>Ekipa Pastoral Eskolár</span>
        </button>

        <button
          onClick={() => setActiveTab('drumband')}
          className={`btn ${activeTab === 'drumband' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Music size={16} />
          <span>Ekipa Drum Band / Fanfarra</span>
        </button>
      </div>

      {/* Tab 1: General Clubs */}
      {activeTab === 'general' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {(activities.length > 0 ? activities : [
            { id: '1', name: 'Klube Futeból & Futsal NOSSEF', description: 'Ekipa futeból eskola ne\'ebé kompete iha kampaunatu inter-eskolar kotamadya Ermera.', supervisor_name: 'Mestre Domingos da Costa', schedule_info: 'Tersa & Kinta, 16:00 - 17:30', member_count: 28 },
            { id: '2', name: 'Klube Voleiból (Mane & Feto)', description: 'Treinu tátiku no tékniku voleiból iha kampaun resintu eskola NOSSEF.', supervisor_name: 'Mestre Lourenço dos Santos', schedule_info: 'Segunda & Kuarta, 16:00 - 17:30', member_count: 24 },
            { id: '3', name: 'Escoteiro & Guia Katólika', description: 'Formasaun disiplina, moris iha natureza, sobrevivénsia, no solidariedade komunitária.', supervisor_name: 'Frater Companhia de Jesus', schedule_info: 'Sábadu, 08:30 - 11:30', member_count: 45 },
            { id: '4', name: 'Kruz Vermella Juventude (CVTL)', description: 'Primeiros sokorros, edukasaun saúde komunitária, no asaun emerjénsia kalamidade.', supervisor_name: 'Sra. Beatriz da Conceição', schedule_info: 'Sesta, 15:30 - 17:00', member_count: 32 },
            { id: '5', name: 'Klube Xadrez & Siénsia Lójika', description: 'Dezenvolvimentu estratéjia no hanoin analítiku liuhusi jogu xadrez no kompetisaun nasionál.', supervisor_name: 'Mestre Domingos da Costa', schedule_info: 'Kuarta, 15:30 - 17:00', member_count: 16 },
          ]).map((act) => (
            <div key={act.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(37, 99, 235, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                    }}
                  >
                    <Trophy size={20} />
                  </div>
                  <span className="badge badge-gold">{act.member_count || 1} Membru</span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>{act.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {act.description}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.775rem', color: 'var(--text-faint)', borderTop: '1px solid var(--border-card)', paddingTop: '12px' }}>
                <div><strong>Responsável:</strong> {act.supervisor_name || 'Mestre NOSSEF'}</div>
                <div><strong>Oráriu Treinu:</strong> {act.schedule_info || 'Semana-semana'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: KORENOSSEF */}
      {activeTab === 'korenossef' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Institutional Banner */}
          <div
            className="glass-panel"
            style={{
              padding: '24px 28px',
              background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)',
              border: '1px solid #BFDBFE',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: '#DBEAFE',
                  border: '1px solid #93C5FD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1D4ED8',
                }}
              >
                <Award size={28} />
              </div>
              <div>
                <div className="badge badge-verified" style={{ marginBottom: '4px' }}>
                  Organizasaun Estudantil Katólika
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1E3A8A' }}>
                  KORENOSSEF — Dewan Kepemimpinan Siswa Katolik NOSSEF Railaco
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#1E40AF', marginTop: '2px' }}>
                  Formasaun líder Ignasianu ho valór 3C: Competence, Conscience, no Compassion ba gerasaun Timor-Leste.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setSelectedEntity('KORENOSSEF (Lideransa)');
                  setShowRegModal(true);
                }}
                className="btn btn-primary"
                style={{ background: '#1D4ED8', borderColor: '#1E40AF' }}
              >
                <Plus size={16} />
                <span>Rejistu Kandidatu KORENOSSEF</span>
              </button>
            </div>
          </div>

          {/* Division Structure Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {[
              { div: 'Presidénsia & Sekretariadu', lead: 'Gabriel de Jesus Pereira (Prezidente)', desc: 'Kordenasaun jerál, reuniaun semana, relasaun ho diresaun eskola no korenossef cohort.', members: 6, icon: ShieldCheck },
              { div: 'Divizaun Formasaun Espirituál & Karakter', lead: 'Maria Madalena Belo (Xefe Divizaun)', desc: 'Animasaun orasaun matina, retretu estudante, formasaun espiritualidade Ignasiana.', members: 12, icon: HeartHandshake },
              { div: 'Divizaun Relasaun Públika & Sosiál', lead: 'António Soares Guterres (Xefe Divizaun)', desc: 'Asaun karitas ba komunidade Railaco Craic, vizita katuas-ferik, no dokumentasaun.', members: 10, icon: Users },
              { div: 'Divizaun Disiplina & Ambiente Eskolár', lead: 'Francisco Xavier dos Santos (Xefe Divizaun)', desc: 'Supervizaun pontualidade, farda eskolár, orden aula, no promosaun hamoos resintu.', members: 14, icon: CheckCircle2 },
            ].map((d, i) => (
              <div key={i} className="glass-panel" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <d.icon size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{d.div}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{d.lead}</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
                  {d.desc}
                </p>
                <div className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                  {d.members} Membru Ativu
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Pastoral Eskolar */}
      {activeTab === 'pastoral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Pastoral Header Banner */}
          <div
            className="glass-panel"
            style={{
              padding: '24px 28px',
              background: 'linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%)',
              border: '1px solid #FDE68A',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: '#FEF3C7',
                  border: '1px solid #FCD34D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#B45309',
                }}
              >
                <Cross size={28} />
              </div>
              <div>
                <div className="badge badge-gold" style={{ marginBottom: '4px' }}>
                  Misi Jesuita • Kompanhia de Jesus
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#92400E' }}>
                  Ekipa Pastoral Eskolár NOSSEF Railaco
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#B45309', marginTop: '2px' }}>
                  Pelayanan rohani sakramental, Liturgi Misa Primeira Sesta, Koral Múzika Sakra, no Akólitus.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setSelectedEntity('Ekipa Pastoral Eskolár');
                  setShowRegModal(true);
                }}
                className="btn btn-primary"
                style={{ background: '#B45309', borderColor: '#92400E' }}
              >
                <Plus size={16} />
                <span>Rejistu Membru Pastoral</span>
              </button>
            </div>
          </div>

          {/* Pastoral Pillars Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {[
              { title: 'Liturgi Misa & Primeira Sesta', desc: 'Prepara leitura, orasaun dos fieis, no animasaun liturgi misa eskolár mensál kada Primeira Sesta.', resp: 'Pe. Guilhermino da Silva, SJ', members: 18 },
              { title: 'Koral & Múzika Sakra NOSSEF', desc: 'Paduan suara polifóniku, kantu Gregorianu, no múzika litúrjika tradisionál Tetun/Latin.', resp: 'Madre Teresa Noronha, RVM', members: 36 },
              { title: 'Pelayanan Akólitus (Ministru Altar)', desc: 'Servisu altar ba misa eskolár, festa Patronu N. S. de Fátima, no misa graduasaun.', resp: 'Frater Jesuita', members: 15 },
              { title: 'Retretu Espirituál & Karitas', desc: 'Retretu tinan-tinan ba estudante 12.º ano (finalistas) no asaun karitas natal/páskua.', resp: 'Ekipa Pastoral Ermera', members: 22 },
            ].map((p, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '22px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>{p.title}</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>{p.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-card)', paddingTop: '12px', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-body)', fontWeight: 600 }}>Amu / Madre: {p.resp}</span>
                  <span className="badge badge-verified">{p.members} Membru</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Drum Band & Fanfarra */}
      {activeTab === 'drumband' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Drum Band Header Banner */}
          <div
            className="glass-panel"
            style={{
              padding: '24px 28px',
              background: 'linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 100%)',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#DC2626',
                }}
              >
                <Music size={28} />
              </div>
              <div>
                <div className="badge badge-danger" style={{ marginBottom: '4px' }}>
                  Orgullu Eskola NOSSEF Railaco
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#991B1B' }}>
                  Ekipa Drum Band & Fanfarra "Nossa Senhora de Fátima"
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#B91C1C', marginTop: '2px' }}>
                  Unit marching band kebanggaan sekolah untuk upacara kenegaraan 28 Novembru, 20 Maiu, dan pawai Fátima.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setSelectedEntity('Drum Band & Fanfarra');
                  setShowRegModal(true);
                }}
                className="btn btn-primary"
                style={{ background: '#DC2626', borderColor: '#B91C1C' }}
              >
                <Plus size={16} />
                <span>Rejistu Músiku Foun</span>
              </button>
            </div>
          </div>

          {/* Section Naipes Instruments Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {[
              { naipe: 'Naipe Perkusaun: Snare / Caixa', count: 12, lead: 'Bernardo Martins Ximenes', desc: 'Rítmiku prinsipál, kordenasaun marcha no ritmu baze ba marcha tomak.' },
              { naipe: 'Naipe Perkusaun: Bombo / Bass Drum', count: 6, lead: 'Mateus de Jesus', desc: 'Poder baze no dinamizmu tempo marcha no desfile ofisiál.' },
              { naipe: 'Liras & Sinos Melódiku', count: 10, lead: 'Filomena Martins da Costa', desc: 'Melodia prinsipál hino nasionál Pátria-Pátria no kantu litúrjiku.' },
              { naipe: 'Trompete Fanfarra (Metais)', count: 8, lead: 'Manuel Soares', desc: 'Harmonia metais fanfarra ba selebrasaun solene no serimónia bandeira.' },
              { naipe: 'Mayorettes & Bastonárias', count: 8, lead: 'Maria Madalena Belo', desc: 'Koreografia visual, líder formatura marching band, no atraksaun desfile.' },
              { naipe: 'Guarda de Honra / Paskibra', count: 12, lead: 'António Soares Guterres', desc: 'Pasukan Pengibar Bendera RDTL iha serimónia loron nasionál Timor-Leste.' },
            ].map((n, i) => (
              <div key={i} className="glass-panel" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{n.naipe}</h3>
                  <span className="badge badge-gold">{n.count} Músiku</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '6px' }}>
                  Líder Naipe: {n.lead}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {n.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member Registration Modal */}
      {showRegModal && (
        <div className="modal-backdrop" onClick={() => setShowRegModal(false)}>
          <div className="modal-box" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-card)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  Rejistu Membru ba {selectedEntity}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Eskola Sekundária Katólika NOSSEF Railaco
                </p>
              </div>
              <button onClick={() => setShowRegModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {regSuccess ? (
              <div style={{ padding: '20px', textAlign: 'center', background: '#ECFDF5', borderRadius: 'var(--radius-sm)', color: '#047857' }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 10px' }} />
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{regSuccess}</div>
              </div>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Naran Kompletu Estudante *
                  </label>
                  <input
                    required
                    placeholder="Ez: António Soares Guterres"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Klase & Turma
                  </label>
                  <select value={studentClass} onChange={(e) => setStudentClass(e.target.value)}>
                    <option value="10.º Ano CT-A">10.º Ano CT-A</option>
                    <option value="10.º Ano CT-B">10.º Ano CT-B</option>
                    <option value="10.º Ano CSH">10.º Ano CSH</option>
                    <option value="11.º Ano CT">11.º Ano CT</option>
                    <option value="11.º Ano CSH">11.º Ano CSH</option>
                    <option value="12.º Ano CT">12.º Ano CT (Finalista)</option>
                    <option value="12.º Ano CSH">12.º Ano CSH (Finalista)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Kargu / Divizaun / Naipe
                  </label>
                  <input
                    required
                    placeholder="Ez: Naipe Snare / Divizaun Lideransa"
                    value={studentRole}
                    onChange={(e) => setStudentRole(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', borderTop: '1px solid var(--border-card)', paddingTop: '14px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowRegModal(false)}>
                    Kansela
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Konfirma Rejistu
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
