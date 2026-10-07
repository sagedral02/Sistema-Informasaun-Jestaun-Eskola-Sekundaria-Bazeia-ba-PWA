'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Award, Printer, CheckCircle2, BookOpen, GraduationCap, Cross, ChevronRight } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function ReportCardsPage() {
  const [activeTab, setActiveTab] = useState<'boletin' | 'nacional' | 'promosaun'>('boletin');
  const [reportCards, setReportCards] = useState<any[]>([]);
  const [nationalExams, setNationalExams] = useState<any[]>([]);
  const [selectedReportCard, setSelectedReportCard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [rcRes, neRes] = await Promise.all([
          fetch('/api/report-cards'),
          fetch('/api/national-exams'),
        ]);

        if (rcRes.ok) setReportCards(await rcRes.json());
        if (neRes.ok) setNationalExams(await neRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Pauta de Notas, Boletin & Ezame Nasionál
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Emisaun boletin de notas ofisiál, ranking klase, ezame nasionál 12.º ano, no promosaun klase
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('boletin')}
          className={`btn ${activeTab === 'boletin' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <FileSpreadsheet size={16} />
          <span>Boletin de Notas Trimestrál</span>
        </button>
        <button
          onClick={() => setActiveTab('nacional')}
          className={`btn ${activeTab === 'nacional' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Award size={16} />
          <span>Ezame Nasionál (12.º Ano)</span>
        </button>
        <button
          onClick={() => setActiveTab('promosaun')}
          className={`btn ${activeTab === 'promosaun' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <GraduationCap size={16} />
          <span>Promosaun & Graduasaun</span>
        </button>
      </div>

      {/* Tab 1: Boletin de Notas */}
      {activeTab === 'boletin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
              Lista Boletin de Notas Jera Ona
            </h3>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Estudante</th>
                    <th>Klase</th>
                    <th>Trimestre</th>
                    <th>Média Jerál</th>
                    <th>Ranking Klase</th>
                    <th>Status</th>
                    <th>Aksaun</th>
                  </tr>
                </thead>
                <tbody>
                  {reportCards.length > 0 ? (
                    reportCards.map((rc) => (
                      <tr key={rc.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{rc.student_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>{rc.student_no}</div>
                        </td>
                        <td>{rc.classroom_name}</td>
                        <td>{rc.trimester_name}</td>
                        <td style={{ fontWeight: 800, color: '#10b981', fontSize: '1.05rem' }}>
                          {rc.average_score} / 20
                        </td>
                        <td>
                          <span className="badge badge-gold">Pozisaun #{rc.rank_in_class || 1}</span>
                        </td>
                        <td>
                          <span className="badge badge-success">Públika Ona</span>
                        </td>
                        <td>
                          <button
                            onClick={() => setSelectedReportCard(rc)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.775rem' }}
                          >
                            <Printer size={14} />
                            <span>Haree & Imprime</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        La iha boletin jera ona.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Printable Report Card Preview */}
          {selectedReportCard && (
            <div
              className="glass-panel"
              style={{
                padding: '36px',
                background: '#ffffff',
                color: '#0f172a',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
              }}
            >
              {/* Official Catholic School Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                  REPÚBLICA DEMOCRÁTICA DE TIMOR-LESTE
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  MINISTÉRIO DA EDUCAÇÃO • DIOCESE DE MALIANA
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a', marginTop: '6px' }}>
                  ESCOLA SECUNDÁRIA CATÓLICA NOSSA SENHORA DE FÁTIMA RAILACO
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                  {TETUN.school.location} • Pe. Guilhermino da Silva, SJ
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '12px', textDecoration: 'underline' }}>
                  BOLETIN DE NOTAS TRIMESTRÁL (PAUTA INDIVIDUÁL)
                </div>
              </div>

              {/* Student Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem', marginBottom: '20px' }}>
                <div><strong>Naran Kompletu:</strong> {selectedReportCard.student_name}</div>
                <div><strong>Nu. Rejistu (NRE):</strong> {selectedReportCard.student_no}</div>
                <div><strong>Klase:</strong> {selectedReportCard.classroom_name}</div>
                <div><strong>Trimestre:</strong> {selectedReportCard.trimester_name}</div>
                <div><strong>Tinan Akadémiku:</strong> 2026/2027</div>
                <div><strong>Pozisaun iha Klase:</strong> Pozisaun #{selectedReportCard.rank_in_class || 1}</div>
              </div>

              {/* Grades Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderTop: '1px solid #0f172a', borderBottom: '1px solid #0f172a' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Disiplina</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Nota (0-20)</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Klasifikasaun</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Observasaun Mestre</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px', fontWeight: 600 }}>Matemátika</td>
                    <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>16.8</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>B (Di'ak Tebes)</td>
                    <td style={{ padding: '8px' }}>Domina konseitu matemátika ho di'ak tebes.</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px', fontWeight: 600 }}>Língua Portuguesa</td>
                    <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>15.5</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>B (Di'ak Tebes)</td>
                    <td style={{ padding: '8px' }}>Kompreensaun testu no gramátika di'ak.</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px', fontWeight: 600 }}>Fízika</td>
                    <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>16.0</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>B (Di'ak Tebes)</td>
                    <td style={{ padding: '8px' }}>Partisipasaun ativu iha prátika laboratóriu.</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px', fontWeight: 600 }}>Relijiaun Katólika & Morál</td>
                    <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>18.0</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>A (Eselente)</td>
                    <td style={{ padding: '8px' }}>Hatudu karakter no morál kristaun ezemplár.</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid #0f172a', fontWeight: 800 }}>
                    <td style={{ padding: '10px 8px' }}>MÉDIA JERÁL TRIMESTRE</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: '1rem', color: '#1e3a8a' }}>
                      {selectedReportCard.average_score} / 20
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>APROVADU</td>
                    <td style={{ padding: '10px 8px' }}>{selectedReportCard.principal_notes || 'Parabéns no kontinua esforsu!'}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'center', marginTop: '36px', fontSize: '0.8rem' }}>
                <div>
                  <div>Wali Kelas / Mestre Titulár</div>
                  <div style={{ height: '50px' }} />
                  <div style={{ fontWeight: 700 }}>(Mestre Domingos da Costa)</div>
                </div>
                <div>
                  <div>Enkaregadu de Edukasaun</div>
                  <div style={{ height: '50px' }} />
                  <div style={{ fontWeight: 700 }}>(Manuel Guterres)</div>
                </div>
                <div>
                  <div>Diretór Eskola NOSSEF</div>
                  <div style={{ height: '50px' }} />
                  <div style={{ fontWeight: 700 }}>(Pe. Guilhermino da Silva, SJ)</div>
                </div>
              </div>

              {/* Print Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button onClick={() => setSelectedReportCard(null)} className="btn btn-secondary">
                  Taka
                </button>
                <button onClick={handlePrint} className="btn btn-primary">
                  <Printer size={16} />
                  <span>Imprime Boletin Ofisiál</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: National Exam Grade XII */}
      {activeTab === 'nacional' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Rezultadu Ezame Nasionál 12.º Ano (Ensino Secundário)
            </h3>
            <div className="badge badge-gold">
              Separadu husi CAU (Rejistu Ofisiál ME)
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nu. Ezame Nasionál</th>
                  <th>Estudante 12.º Ano</th>
                  <th>Português</th>
                  <th>Inglês</th>
                  <th>Matemátika</th>
                  <th>Disiplina Espesífika</th>
                  <th>Média Final</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {nationalExams.map((ne) => (
                  <tr key={ne.id}>
                    <td style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{ne.exam_number}</td>
                    <td style={{ fontWeight: 600 }}>{ne.student_name}</td>
                    <td>{ne.portugues_score}</td>
                    <td>{ne.ingles_score}</td>
                    <td>{ne.matematika_score}</td>
                    <td>{ne.spesifika_score}</td>
                    <td style={{ fontWeight: 800, color: '#10b981', fontSize: '1.05rem' }}>
                      {ne.final_average} / 20
                    </td>
                    <td>
                      <span className="badge badge-success">LIU EZAME (APROVADU)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Promotion */}
      {activeTab === 'promosaun' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            Desizaun Promosaun & Graduasaun Tinan Letivo
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Regra promosaun: Estudante ho média jerál &gt;= 10.0 no prezensas sufisiente sei promovidu ba nivel tuir mai.
          </p>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Estudante</th>
                  <th>Klase Agora</th>
                  <th>Média Anual</th>
                  <th>Desizaun Promosaun</th>
                  <th>Klase Destinu</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>António Soares Guterres</td>
                  <td>10.º Ano CT-A</td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>16.8</td>
                  <td><span className="badge badge-success">Promovidu ba Klase Tuir Mai</span></td>
                  <td>11.º Ano CT-A</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Maria Madalena Tilman</td>
                  <td>10.º Ano CT-A</td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>14.6</td>
                  <td><span className="badge badge-success">Promovidu ba Klase Tuir Mai</span></td>
                  <td>11.º Ano CT-A</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>João Bosco da Silva</td>
                  <td>12.º Ano CT-A</td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>16.45</td>
                  <td><span className="badge badge-gold">Graduadu Ensino Secundário</span></td>
                  <td>Alumni NOSSEF Railaco</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
