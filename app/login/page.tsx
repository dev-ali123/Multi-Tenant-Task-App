'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        let msg = 'Unable to log in. Please check your email and password.';
        if (res.status === 401) msg = 'Invalid email or password.';
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).error || msg);
      }
      window.location.href = '/tenants';
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid" style={{ placeItems: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ width: 360 }}>
        <h1 className="h1">Login</h1>
        <form onSubmit={onSubmit} className="stack-12" aria-busy={loading}>
          <input
            className="input"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            className="input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button className="btn primary" disabled={loading} type="submit">
            {loading ? (<><span className="spinner" /> Logging in…</>) : 'Login'}
          </button>
          {error ? <div className="alert error">{error}</div> : null}
          <p className="muted" style={{ marginTop: 4 }}>
            Don&apos;t have an account? <a href="/signup">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}

