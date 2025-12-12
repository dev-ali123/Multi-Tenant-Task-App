"use client";

import { useState } from 'react';
import Alert from '@/components/ui/Alert';

type Tenant = { id: string; name: string; role: 'ADMIN' | 'MEMBER' };

type Props = {
  tenant: Tenant;
  isCurrent: boolean;
  onSwitch: (tenantId: string) => Promise<void> | void;
};

export default function TenantCard({ tenant, isCurrent, onSwitch }: Props) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUrl, setInviteUrl] = useState<string>('');
  const [inviteError, setInviteError] = useState<string>('');
  const [inviteLoading, setInviteLoading] = useState<boolean>(false);

  async function sendInvite() {
    setInviteError('');
    setInviteLoading(true);
    try {
      const res = await fetch(`/api/tenants/${tenant.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).error || 'Failed to send invite');
      }
      const data = await res.json();
      setInviteUrl(data.acceptUrl);
    } catch (e: any) {
      setInviteError(e.message || 'Failed to send invite');
    } finally {
      setInviteLoading(false);
    }
  }

  function toUiLink(url: string): string {
    return url.replace('/api/invites/', '/invites/').replace('/accept', '');
  }

  return (
    <div className="card stack-8">
      <div className="space-between">
        <div className="row" style={{ gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: 9999, background: isCurrent ? 'var(--accent)' : 'var(--border)' }} />
          <div>{tenant.name}</div>
        </div>
        <button className="btn" onClick={() => onSwitch(tenant.id)}>
          {isCurrent ? 'Current' : 'Switch'}
        </button>
      </div>
      {tenant.role === 'ADMIN' ? (
        <details>
          <summary>Invite by email</summary>
          <div className="stack-8" style={{ marginTop: 8 }}>
            <div className="row">
              <input
                className="input"
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                style={{ maxWidth: 320 }}
              />
              <button
                className="btn primary"
                disabled={inviteLoading || !inviteEmail.trim()}
                onClick={sendInvite}
              >
                {inviteLoading ? (<><span className="spinner" /> Sending…</>) : 'Send invite'}
              </button>
            </div>
            {inviteError ? <Alert variant="error">{inviteError}</Alert> : null}
            {inviteUrl ? (
              <div className="stack-8">
                <div className="muted">Accept via UI (shareable link):</div>
                <div className="row">
                  <a href={toUiLink(inviteUrl)} target="_blank" rel="noreferrer">
                    {toUiLink(inviteUrl)}
                  </a>
                  <button className="btn" onClick={() => navigator.clipboard.writeText(toUiLink(inviteUrl))}>Copy</button>
                </div>
              </div>
            ) : null}
          </div>
        </details>
      ) : (
        <p className="muted">Only tenant admins can send invites.</p>
      )}
    </div>
  );
}


