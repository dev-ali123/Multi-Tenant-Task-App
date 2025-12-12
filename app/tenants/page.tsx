"use client";

import { useEffect, useState } from 'react';
import TenantCard from '@/components/tenants/TenantCard';

type Tenant = { id: string; name: string; role: 'ADMIN' | 'MEMBER' };

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadTenants() {
    const res = await fetch('/api/tenants');
    if (res.ok) {
      const data = await res.json();
      setTenants(data.tenants || []);
      setCurrentTenantId(data.currentTenantId || null);
    }
  }

  useEffect(() => {
    loadTenants();
  }, []);

  async function createTenant(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create tenant');
      }
      setName('');
      await loadTenants();
    } catch (err: any) {
      setError(err.message || 'Failed to create tenant');
    } finally {
      setLoading(false);
    }
  }

  async function switchTenant(tenantId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/switch-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to switch tenant');
      }
      window.location.href = '/tasks';
    } catch (err: any) {
      setError(err.message || 'Failed to switch tenant');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack-12">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 className="h1">Tenants</h1>
        {loading ? <span className="spinner" aria-label="Loading" /> : null}
      </div>
      <div className="columns-2">
        <div className="stack-8">
          {tenants.map((t) => (
            <TenantCard
              key={t.id}
              tenant={t}
              isCurrent={currentTenantId === t.id}
              onSwitch={switchTenant}
            />
          ))}
          {tenants.length === 0 && <p className="muted">No tenants yet.</p>}
        </div>
        <div className="card">
          <h2 className="h2">Create a tenant</h2>
          <form onSubmit={createTenant} className="stack-8" aria-busy={loading}>
            <input className="input" placeholder="Tenant name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
            <button className="btn primary" disabled={loading || !name.trim()} type="submit">
              {loading ? (<><span className="spinner" /> Creating…</>) : 'Create'}
            </button>
            {error ? <div className="alert error">{error}</div> : null}
          </form>
        </div>
      </div>
    </div>
  );
}


