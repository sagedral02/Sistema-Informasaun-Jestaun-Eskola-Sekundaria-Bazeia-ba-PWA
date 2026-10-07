'use client';

import React, { useState, useEffect } from 'react';
import { Library, BookOpen, Plus, Search, RotateCcw, CheckCircle2 } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'books' | 'loans'>('books');
  const [books, setBooks] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [search]);

  async function loadData() {
    try {
      let bUrl = '/api/library/books?';
      if (search) bUrl += `search=${encodeURIComponent(search)}`;

      const [bRes, lRes] = await Promise.all([
        fetch(bUrl),
        fetch('/api/library/loans'),
      ]);

      if (bRes.ok) setBooks(await bRes.json());
      if (lRes.ok) setLoans(await lRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleReturnBook = async (loanId: string) => {
    try {
      const res = await fetch('/api/library/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loan_id: loanId, action: 'RETURN' }),
      });
      if (res.ok) {
        alert('Livru fila ona ho susesu ba biblioteka!');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Biblioteka Eskolár NOSSEF
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Jestaun katálogu livru, exemplár barcode, empréstimu, no devolusaun livru estudante
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('books')}
          className={`btn ${activeTab === 'books' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <BookOpen size={16} />
          <span>Katálogu Livru</span>
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          className={`btn ${activeTab === 'loans' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <RotateCcw size={16} />
          <span>Empréstimu & Devolusaun</span>
        </button>
      </div>

      {activeTab === 'books' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buka livru tuir títulu, autór, ka ISBN..."
                style={{ paddingLeft: '38px' }}
              />
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ISBN</th>
                  <th>Títulu Livru</th>
                  <th>Autór</th>
                  <th>Editora</th>
                  <th>Kategoria</th>
                  <th>Kópia Disponivel</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{b.isbn || '-'}</td>
                    <td style={{ fontWeight: 700, color: '#fef08a' }}>{b.title}</td>
                    <td>{b.author}</td>
                    <td>{b.publisher || '-'}</td>
                    <td><span className="badge badge-info">{b.category}</span></td>
                    <td>
                      <span className="badge badge-gold">
                        {b.available_copies} / {b.total_copies} Disponivel
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'loans' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            Rejistu Empréstimu Livru
          </h3>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Barcode</th>
                  <th>Títulu Livru</th>
                  <th>Estudante</th>
                  <th>Data Fó</th>
                  <th>Data Limite</th>
                  <th>Status</th>
                  <th>Aksaun</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 700 }}>{l.barcode}</td>
                    <td style={{ fontWeight: 600 }}>{l.book_title}</td>
                    <td>{l.student_name}</td>
                    <td>{l.loan_date}</td>
                    <td>{l.due_date}</td>
                    <td>
                      {l.status === 'ATIVU' ? (
                        <span className="badge badge-warning">Empréstimu Ativu</span>
                      ) : (
                        <span className="badge badge-success">Fila Ona</span>
                      )}
                    </td>
                    <td>
                      {l.status === 'ATIVU' && (
                        <button
                          onClick={() => handleReturnBook(l.id)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          <RotateCcw size={12} />
                          <span>Fila Livru</span>
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
    </div>
  );
}
