'use client';

import React, { useState, useEffect } from 'react';
import { Boxes, Plus, CheckCircle2, MapPin, Tag } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/assets');
        if (res.ok) setAssets(await res.json());
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
          Patrimóniu & Sasán Eskola
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Inventáriu sasán eskola, ekipamentu eletróniku, mobiliáriu, no distribuisaun ba kada sala
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
          Lista Inventáriu Sasán Eskola
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kódigu Sasán (Tag)</th>
                <th>Naran Sasán</th>
                <th>Kategoria</th>
                <th>Fatin / Sala</th>
                <th>Kustu ($ USD)</th>
                <th>Kondisaun</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{a.asset_tag}</td>
                  <td style={{ fontWeight: 600 }}>{a.name}</td>
                  <td><span className="badge badge-info">{a.category}</span></td>
                  <td>{a.location}</td>
                  <td style={{ fontWeight: 700 }}>${parseFloat(a.cost || '0').toFixed(2)}</td>
                  <td>
                    <span className="badge badge-success">{a.condition === 'DIAK' ? "Di'ak" : a.condition}</span>
                  </td>
                  <td>
                    <span className="badge badge-gold">{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
