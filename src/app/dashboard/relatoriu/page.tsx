'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Download, FileSpreadsheet, Users, DollarSign, CalendarCheck } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function ReportsPage() {
  const [reports, setReports] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/reports');
        if (res.ok) setReports(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const exportStudentsCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Nu. Estudante,Naran Kompletu,Sexo,Klase,Status',
       'NOSSEF-2026-0101,António Soares Guterres,Mane,10.º Ano CT-A,ATIVU',
       'NOSSEF-2026-0102,Maria Madalena Tilman,Feto,10.º Ano CT-A,ATIVU',
       'NOSSEF-2024-0045,João Bosco da Silva,Mane,12.º Ano CT-A,ATIVU',
      ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'relatoriu_estudante_nossef_2026.csv');
    document.body.appendChild(link);
    link.click();
  };

  const exportFinanceCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Nu. Fatura,Estudante,Deskrisaun,Total ($),Selu Ona ($),Status',
       'FAT-2026-01-001,António Soares Guterres,Mensalidade Janeiru,15.00,15.00,SELU_ONA',
       'FAT-2026-02-001,António Soares Guterres,Mensalidade Fevereiru,15.00,0.00,SEIDAUK_SELU',
      ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'relatoriu_finansas_mensalidade_nossef.csv');
    document.body.appendChild(link);
    link.click();
  };

  const stats = reports?.summary || {
    totalStudents: 3,
    maleStudents: 2,
    femaleStudents: 1,
    attendanceRate: 98,
    finance: { totalInvoiced: 30, totalCollected: 15, totalArrears: 15 },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Relatóriu Jerál & Esportasaun Dadus
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Estatístika kanónika eskola nian, relatóriu akadémiku, finansas, no esportasaun CSV/Excel
        </p>
      </div>

      {/* Export Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={exportStudentsCsv} className="btn btn-primary">
          <Download size={16} />
          <span>Esporta Lista Estudante (CSV)</span>
        </button>
        <button onClick={exportFinanceCsv} className="btn btn-secondary">
          <FileSpreadsheet size={16} color="#10b981" />
          <span>Esporta Relatóriu Mensalidade (CSV)</span>
        </button>
        <button onClick={() => window.print()} className="btn btn-secondary">
          <span>Imprime Relatóriu Sintétiku</span>
        </button>
      </div>

      {/* Aggregate Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Users size={20} color="#3b82f6" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Demografia Estudante</h3>
          </div>
          <div style={{ fontSize: '0.9rem', lineHeight: 2 }}>
            <div>Total Estudante Ativu: <strong>{stats.totalStudents}</strong></div>
            <div>Mane: <strong>{stats.maleStudents}</strong> ({Math.round((stats.maleStudents/stats.totalStudents)*100)}%)</div>
            <div>Feto: <strong>{stats.femaleStudents}</strong> ({Math.round((stats.femaleStudents/stats.totalStudents)*100)}%)</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <DollarSign size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Resumu Finansas Eskola</h3>
          </div>
          <div style={{ fontSize: '0.9rem', lineHeight: 2 }}>
            <div>Total Fatura Jera: <strong>${stats.finance.totalInvoiced.toFixed(2)} USD</strong></div>
            <div>Total Simu Ona: <strong style={{ color: '#10b981' }}>${stats.finance.totalCollected.toFixed(2)} USD</strong></div>
            <div>Dívida Pendente: <strong style={{ color: '#f87171' }}>${stats.finance.totalArrears.toFixed(2)} USD</strong></div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <CalendarCheck size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Prezensas & Ezame</h3>
          </div>
          <div style={{ fontSize: '0.9rem', lineHeight: 2 }}>
            <div>Taxa Prezensas Jerál: <strong style={{ color: '#10b981' }}>{stats.attendanceRate}%</strong></div>
            <div>Ezame CAU 1: <strong>100% Realizadu</strong></div>
            <div>Taxa Pasasaun Ezame Nasionál (12.º): <strong style={{ color: '#10b981' }}>100% Liu</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
