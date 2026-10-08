'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Plus, CheckCircle2, Pin, Send, X } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function CommunicationPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState('HOTU');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) setAnnouncements(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          target_audience: audience,
          is_pinned: isPinned,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setTitle('');
        setContent('');
        loadAnnouncements();
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
            Komunikasaun, Avizu & Notifikasaun
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Públika avizu ofisiál ba mestre, estudante, inan-aman, no notifikasaun Web Push
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Públika Avizu Foun</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {announcements.map((a) => (
          <div key={a.id} className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {a.is_pinned && <Pin size={16} color="#f59e0b" />}
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fef08a' }}>{a.title}</h3>
              </div>
              <span className="badge badge-gold">Destinadáriu: {a.target_audience}</span>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '12px' }}>
              {a.content}
            </p>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', display: 'flex', gap: '16px' }}>
              <span>Públika husi: {a.published_by_name || 'Diretór Eskola'}</span>
              <span>•</span>
              <span>Data: {new Date(a.published_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
                  Públika Avizu Eskola Foun
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Avizu ne'e sei mosu iha painél estudante, mestre, no inan-aman
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Títulu Avizu
                </label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ez: Avizu Misa Santu..." />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Konteúdu Avizu
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Konteúdu kompletu avizu nian..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Destinadáriu
                  </label>
                  <select value={audience} onChange={(e) => setAudience(e.target.value)}>
                    <option value="HOTU">Komunidade Hotu (Públiku)</option>
                    <option value="MESTRE">Mestre & Dosente De'it</option>
                    <option value="ESTUDANTE">Estudante De'it</option>
                    <option value="ENKAREGADU">Inan-Aman / Enkaregadu</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '24px' }}>
                  <input
                    type="checkbox"
                    id="pinned"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <label htmlFor="pinned" style={{ fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                    Pega iha Leten (Pin)
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Kansela
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Públika hela...' : 'Públika Agora'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
