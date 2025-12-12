"use client";

import { useEffect, useState } from "react";

export default function AcceptInvitePage({ params }: { params: { token: string } }) {
  const { token } = params;
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function accept() {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`/api/invites/${token}/accept`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).error || "Failed to accept");
      }
      setStatus("ok");
      setMessage("Invite accepted. You have been added to the tenant.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to accept invite.");
    }
  }

  useEffect(() => {
    // Could auto-accept; keep as manual for clarity
  }, []);

  return (
    <div className="grid" style={{ placeItems: "center", minHeight: "60vh" }}>
      <div className="card" style={{ width: 420 }}>
        <h1 className="h1">Accept Invite</h1>
        <p className="muted">Token: <code style={{ wordBreak: "break-all" }}>{token}</code></p>
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn primary" disabled={status === "loading"} onClick={accept} aria-busy={status === "loading"}>
            {status === "loading" ? (<><span className="spinner" /> Accepting…</>) : "Accept invite"}
          </button>
          <a className="btn" href="/tenants">Go to Tenants</a>
        </div>
        {message ? (
          <div style={{ marginTop: 8 }} className={`alert ${status === "error" ? "error" : "success"}`}>
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}


