'use client';

import React, { useState, useEffect } from 'react';
import { FolderArchive, FileText, Plus, Download, Printer } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/documents');
        if (res.ok) setDocuments(await res.json());
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
          Dokumentu & Arkivu Eskola
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Jestaun dokumentu ofisiál, deklarasaun estudante ativu, karta transferénsia, no sertifikadu
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
          Lista Dokumentu Ofisiál Jera Ona
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nu. Dokumentu</th>
                <th>Tipu Dokumentu</th>
                <th>Estudante</th>
                <th>Data Emisaun</th>
                <th>Aksaun</th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? (
                documents.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{d.document_number}</td>
                    <td style={{ fontWeight: 600 }}>{d.document_type}</td>
                    <td>{d.student_name || '-'}</td>
                    <td>{new Date(d.generated_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => window.print()}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        <Printer size={12} />
                        <span>Imprime</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    La iha dokumentu jera ona.
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
