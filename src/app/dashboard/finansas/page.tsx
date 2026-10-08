'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Printer, CheckCircle2, RotateCcw, FileText, ArrowRight, Sparkles, AlertCircle, X } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'plans'>('invoices');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [feePlans, setFeePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState('15.00');
  const [payMethod, setPayMethod] = useState('CASH');
  const [payRef, setPayRef] = useState('CASH-REC');
  const [paying, setPaying] = useState(false);
  const [receiptToPrint, setReceiptToPrint] = useState<any | null>(null);

  // Bulk generator
  const [showGenModal, setShowGenModal] = useState(false);
  const [genMonth, setGenMonth] = useState('Marsu');
  const [genYear, setGenYear] = useState('2026');
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [invRes, payRes, fpRes] = await Promise.all([
        fetch('/api/finance/invoices'),
        fetch('/api/finance/payments'),
        fetch('/api/finance/fee-plans'),
      ]);

      if (invRes.ok) setInvoices(await invRes.json());
      if (payRes.ok) setPayments(await payRes.json());
      if (fpRes.ok) setFeePlans(await fpRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenPay = (inv: any) => {
    setSelectedInvoice(inv);
    const balance = parseFloat(inv.total_amount) - parseFloat(inv.paid_amount);
    setPayAmount(balance.toFixed(2));
    setShowPayModal(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setPaying(true);

    try {
      const res = await fetch('/api/finance/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedInvoice.student_id,
          invoice_id: selectedInvoice.id,
          amount: parseFloat(payAmount),
          payment_method: payMethod,
          reference_no: payRef,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setShowPayModal(false);
        setReceiptToPrint({
          ...result.receipt,
          student_name: selectedInvoice.student_name,
          student_no: selectedInvoice.student_no,
          invoice_title: selectedInvoice.title,
          amount: payAmount,
          method: payMethod,
        });
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPaying(false);
    }
  };

  const handleGenerateInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch('/api/finance/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academic_year_id: 'a91d24c0-449e-4a6c-b362-e64eb37478d1',
          month_name: genMonth,
          year: genYear,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShowGenModal(false);
        setMessage(data.message);
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleReversePayment = async (paymentId: string) => {
    if (!confirm('Ita-boot hakarak duni halo Reversal (Fila Fali) ba transasaun pagamentu ne\'e?')) return;

    try {
      const res = await fetch('/api/finance/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reversal_id: paymentId,
          reversal_reason: 'Koresaun operasionál finansas',
        }),
      });

      if (res.ok) {
        alert('Pagamentu fila fali ona ho susesu (Reversed)!');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Finansas, Mensalidade (SPP) & Resibu
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Jestaun konta mensalidade $15/fulan, emisaun resibu REC-2026, no reversal transasaun
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowGenModal(true)} className="btn btn-secondary">
            <Plus size={16} />
            <span>Kria Konta Fulan Foun</span>
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`btn ${activeTab === 'invoices' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <FileText size={16} />
          <span>Konta Mensalidade (Fatura)</span>
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`btn ${activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <DollarSign size={16} />
          <span>Istóriku Pagamentu & Resibu</span>
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`btn ${activeTab === 'plans' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Sparkles size={16} />
          <span>Planu Taxa Eskola</span>
        </button>
      </div>

      {/* Tab 1: Invoices */}
      {activeTab === 'invoices' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nu. Fatura</th>
                  <th>Estudante</th>
                  <th>Klase</th>
                  <th>Deskrisaun Konta</th>
                  <th>Total ($)</th>
                  <th>Selu Ona ($)</th>
                  <th>Status</th>
                  <th>Aksaun</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{inv.invoice_number}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{inv.student_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{inv.student_no}</div>
                      </td>
                      <td>{inv.classroom_code || '10-CT-A'}</td>
                      <td>{inv.title}</td>
                      <td style={{ fontWeight: 700 }}>${parseFloat(inv.total_amount).toFixed(2)}</td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>${parseFloat(inv.paid_amount).toFixed(2)}</td>
                      <td>
                        {inv.status === 'SELU_ONA' && <span className="badge badge-success">Selu Ona</span>}
                        {inv.status === 'SEIDAUK_SELU' && <span className="badge badge-danger">Seidauk Selu</span>}
                        {inv.status === 'SELU_BALUN' && <span className="badge badge-warning">Selu Balun</span>}
                      </td>
                      <td>
                        {inv.status !== 'SELU_ONA' ? (
                          <button
                            onClick={() => handleOpenPay(inv)}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.775rem' }}
                          >
                            <DollarSign size={14} />
                            <span>Selu Agora</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                            ✓ Konkluidu
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      La iha konta fatura ruma.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Payments */}
      {activeTab === 'payments' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nu. Pagamentu</th>
                  <th>Nu. Resibu</th>
                  <th>Estudante</th>
                  <th>Data Pagamentu</th>
                  <th>Total ($)</th>
                  <th>Métodu</th>
                  <th>Simu Husi</th>
                  <th>Status</th>
                  <th>Aksaun</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{p.payment_number}</td>
                    <td style={{ fontWeight: 700, color: '#fef08a' }}>{p.receipt_number || 'REC-2026-0001'}</td>
                    <td style={{ fontWeight: 600 }}>{p.student_name}</td>
                    <td>{p.payment_date}</td>
                    <td style={{ fontWeight: 800, color: '#10b981' }}>${parseFloat(p.amount).toFixed(2)}</td>
                    <td>{p.payment_method}</td>
                    <td>{p.received_by_name || 'Finansas'}</td>
                    <td>
                      {p.status === 'VERIFIKADU' ? (
                        <span className="badge badge-success">Verifikadu</span>
                      ) : (
                        <span className="badge badge-danger">Fila Fali (Reversal)</span>
                      )}
                    </td>
                    <td>
                      {p.status === 'VERIFIKADU' && (
                        <button
                          onClick={() => handleReversePayment(p.id)}
                          className="btn btn-danger"
                          style={{ padding: '4px 8px', fontSize: '0.725rem' }}
                          title="Fila pagamentu (Reversal)"
                        >
                          <RotateCcw size={12} />
                          <span>Reversal</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Plans */}
      {activeTab === 'plans' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            Tabela Planu Taxa Mensalidade NOSSEF Railaco
          </h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Naran Planu</th>
                  <th>Tipu Taxa</th>
                  <th>Nivel Klase</th>
                  <th>Montante ($ USD)</th>
                  <th>Loron Limite Selu</th>
                </tr>
              </thead>
              <tbody>
                {feePlans.map((fp) => (
                  <tr key={fp.id}>
                    <td style={{ fontWeight: 700 }}>{fp.name}</td>
                    <td>{fp.fee_type_name}</td>
                    <td>{fp.grade_level_name || 'Nivel Hotu'}</td>
                    <td style={{ fontWeight: 800, color: 'var(--gold-light)', fontSize: '1.05rem' }}>
                      ${parseFloat(fp.amount).toFixed(2)} / fulan
                    </td>
                    <td>Kada fulan loron {fp.due_day || 10}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && selectedInvoice && (
        <div className="modal-backdrop" onClick={() => setShowPayModal(false)}>
          <div className="modal-box" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
                  Rejistu Pagamentu Mensalidade
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Estudante: <strong>{selectedInvoice.student_name}</strong> • {selectedInvoice.title}
                </p>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Total atu Selu ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Métodu Pagamentu
                </label>
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                  <option value="CASH">Osan-Musan (CASH iha Tezouraria)</option>
                  <option value="BANK_TRANSFER">Transferénsia Banku (BNCTL / BNU)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Referénsia / Kódigu Komprovativu
                </label>
                <input
                  required
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="Ez: BNCTL-TRF-091823"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowPayModal(false)} className="btn btn-secondary">
                  Kansela
                </button>
                <button type="submit" disabled={paying} className="btn btn-primary">
                  {paying ? 'Prosesa hela...' : 'Konfirma & Emite Resibu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {receiptToPrint && (
        <div className="modal-backdrop" onClick={() => setReceiptToPrint(null)}>
          <div
            className="modal-box"
            style={{ maxWidth: '500px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <button onClick={() => setReceiptToPrint(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>
            {/* School Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>DIOCESE DE MALIANA</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a' }}>
                ESCOLA SECUNDÁRIA CATÓLICA NOSSA SENHORA DE FÁTIMA RAILACO
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{TETUN.school.location}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: '8px', textDecoration: 'underline' }}>
                RESIBU OFISIÁL PAGAMENTU MENSALIDADE
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '12px' }}>
              <div><strong>Nu. Resibu:</strong> {receiptToPrint.receipt_number}</div>
              <div><strong>Data:</strong> {new Date().toLocaleDateString()}</div>
            </div>

            <div style={{ fontSize: '0.825rem', lineHeight: 1.8, marginBottom: '20px' }}>
              <div><strong>Simu husi Estudante:</strong> {receiptToPrint.student_name} ({receiptToPrint.student_no})</div>
              <div><strong>Pagamentu ba:</strong> {receiptToPrint.invoice_title}</div>
              <div><strong>Métodu:</strong> {receiptToPrint.method}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a', marginTop: '6px' }}>
                <strong>Total Selu:</strong> ${parseFloat(receiptToPrint.amount).toFixed(2)} USD
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '24px', fontSize: '0.8rem' }}>
              <div>Railaco, {new Date().toLocaleDateString()}</div>
              <div>Tezoureiru / Finansas NOSSEF</div>
              <div style={{ height: '40px' }} />
              <div style={{ fontWeight: 700 }}>(Madre Teresa Noronha, RVM)</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setReceiptToPrint(null)} className="btn btn-secondary">
                Taka
              </button>
              <button onClick={() => window.print()} className="btn btn-primary">
                <Printer size={16} />
                <span>Imprime Resibu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Month Invoices Modal */}
      {showGenModal && (
        <div className="modal-backdrop" onClick={() => setShowGenModal(false)}>
          <div className="modal-box" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>
                  Jera Konta Mensalidade ba Estudante Hotu
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Sistema sei jera fatura $15 automátiku ba kada estudante ativu
                </p>
              </div>
              <button onClick={() => setShowGenModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoices} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Fulan
                </label>
                <select value={genMonth} onChange={(e) => setGenMonth(e.target.value)}>
                  {['Janeiru', 'Fevereiru', 'Marsu', 'Abril', 'Maiu', 'Juñu', 'Jullu', 'Agostu', 'Setembru', 'Outubru', 'Novembru', 'Dezembru'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Tinan
                </label>
                <input value={genYear} onChange={(e) => setGenYear(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowGenModal(false)} className="btn btn-secondary">
                  Kansela
                </button>
                <button type="submit" disabled={generating} className="btn btn-primary">
                  {generating ? 'Jera hela...' : 'Jera Konta Fulan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
