"use client";

import { useEffect, useState } from 'react';

type Tenant = { id: string; name: string };

export default function Header() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenantId, setCurrentTenantId] = useState<string | ''>('');
  const [authed, setAuthed] = useState<boolean>(false);
  const [switching, setSwitching] = useState<boolean>(false);
  const [switchError, setSwitchError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/tenants', { cache: 'no-store' });
        if (!res.ok) {
          setAuthed(false);
          return;
        }
        const data = await res.json();
        setAuthed(true);
        setTenants(data.tenants || []);
        setCurrentTenantId(data.currentTenantId || '');
      } catch {
        setAuthed(false);
      }
    })();
  }, []);

  async function switchTenant(tenantId: string) {
    if (!tenantId) return;
    setSwitchError('');
    setSwitching(true);
    try {
      const res = await fetch('/api/auth/switch-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).error || 'Failed to switch tenant');
      }
      setCurrentTenantId(tenantId);
      window.location.href = '/tasks';
    } catch (e: any) {
      setSwitchError(e.message || 'Failed to switch tenant');
    } finally {
      setSwitching(false);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <div className="row">
          <a className="brand" href="/tasks">Tasks</a>
          <span className="muted" style={{ fontSize: 12 }}>Multi-tenant </span>
        </div>
        <div className="nav-actions">
          {authed ? (
            <>
              <a className="btn" href="/tenants">Tenants</a>
              <select
                className="select"
                value={currentTenantId}
                onChange={(e) => switchTenant(e.target.value)}
                style={{ minWidth: 160 }}
                disabled={switching}
              >
                <option value="" disabled>Select tenant</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <button className="btn" onClick={logout} disabled={switching}>
                {switching ? (<><span className="spinner" /> Logout</>) : 'Logout'}
              </button>
              {switchError ? <span className="muted" style={{ color: '#fecaca' }}>{switchError}</span> : null}
            </>
          ) : (
            <>
              <a className="btn" href="/login">Login</a>
              <a className="btn primary" href="/signup">Sign up</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


