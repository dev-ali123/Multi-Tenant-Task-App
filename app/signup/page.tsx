"use client";

import { useState } from 'react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        let msg = 'Unable to create account. Please try again.';
        if ((data as any).error === 'Email already exists') {
          msg = 'That email is already registered. Try logging in instead.';
        }
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
        <h1 className="h1">Sign up</h1>
        <form onSubmit={onSubmit} className="stack-12" aria-busy={loading}>
          <input
            className="input"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
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
            {loading ? (<><span className="spinner" /> Creating…</>) : 'Create account'}
          </button>
          {error ? <div className="alert error">{error}</div> : null}
          <p className="muted" style={{ marginTop: 4 }}>
            Already have an account? <a href="/login">Log in</a>
          </p>
        </form>
      </div>
    </div>
  );
}


