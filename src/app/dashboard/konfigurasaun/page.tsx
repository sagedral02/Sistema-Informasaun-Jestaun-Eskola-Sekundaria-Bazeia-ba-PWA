'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Building, ShieldCheck } from 'lucide-react';
import { TETUN } from '@/lib/tetun';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/school/profile');
        if (res.ok) setProfile(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/school/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setMessage('Konfigurasaun eskola nian rai ona ho susesu!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Konfigurasaun Eskola & Sistema
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Perfil ofisiál eskola, dioseze, kontaktu, diretór, no konfigurasaun PWA
        </p>
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

      <div className="glass-panel" style={{ padding: '32px', maxWidth: '720px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Naran Ofisiál Eskola
            </label>
            <input
              required
              value={profile.official_name}
              onChange={(e) => setProfile({ ...profile, official_name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Naran Badak (Sigla)
              </label>
              <input
                required
                value={profile.short_name}
                onChange={(e) => setProfile({ ...profile, short_name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Tinan Fundasaun
              </label>
              <input
                type="number"
                value={profile.foundation_year}
                onChange={(e) => setProfile({ ...profile, foundation_year: parseInt(e.target.value, 10) })}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Naran Diretór Eskola
            </label>
            <input
              required
              value={profile.principal_name}
              onChange={(e) => setProfile({ ...profile, principal_name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Hela Fatin (Enderesu Kompletu)
            </label>
            <input
              required
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Postu Administrativu
              </label>
              <input
                value={profile.administrative_post}
                onChange={(e) => setProfile({ ...profile, administrative_post: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Munisípiu
              </label>
              <input
                value={profile.municipality}
                onChange={(e) => setProfile({ ...profile, municipality: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Telefone Eskola
              </label>
              <input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Email Eskola
              </label>
              <input
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 24px' }}>
              <Save size={16} />
              <span>{saving ? 'Rai hela...' : 'Rai Konfigurasaun'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
