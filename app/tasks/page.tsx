"use client";

import { useEffect, useMemo, useState } from 'react';
import TaskCard from '@/components/tasks/TaskCard';
import CreateTaskForm from '@/components/tasks/CreateTaskForm';

type Task = {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'DOING' | 'DONE';
  dueDate: string | null;
  assigneeId: string | null;
};

type Tenant = { id: string; name: string };
type Member = { id: string; name: string; email: string; role: 'ADMIN' | 'MEMBER' };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  async function loadTenants() {
    const res = await fetch('/api/tenants');
    if (res.ok) {
      const data = await res.json();
      setTenants(data.tenants || []);
      setCurrentTenantId(data.currentTenantId || null);
    }
  }

  async function loadMembers() {
    const res = await fetch('/api/members');
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members || []);
    }
  }

  async function loadTasks() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (status) params.set('status', status);
      if (search) params.set('search', search);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load tasks');
      }
      const data = await res.json();
      setTasks(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await loadTenants();
      await loadMembers();
    })();
  }, []);

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status]);

  async function handleCreated() {
    await loadTasks();
  }

  async function updateTask(id: string, updates: Partial<Task>) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Failed to update task');
      return;
    }
    await loadTasks();
  }

  async function deleteTask(id: string) {
    if (!confirm('Delete this task?')) return;
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Failed to delete task');
      return;
    }
    await loadTasks();
  }

  return (
    <div className="stack-12">
      <div className="space-between">
        <h1 className="h1">Tasks</h1>
      </div>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadTasks()}
          style={{ maxWidth: 260 }}
        />
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="TODO">Todo</option>
          <option value="DOING">Doing</option>
          <option value="DONE">Done</option>
        </select>
        <button className="btn" onClick={loadTasks} disabled={loading}>
          {loading ? (<><span className="spinner" /> Apply</>) : 'Apply'}
        </button>
      </div>

      <div className="columns-2">
        <div>
          {error ? <div className="alert error">{error}</div> : null}
          <div className="stack-8" style={{ opacity: loading ? 0.6 : 1 }}>
            {tasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                members={members.map((m) => ({ id: m.id, name: m.name }))}
                onUpdateStatus={(id, status) => updateTask(id, { status })}
                onDelete={deleteTask}
              />
            ))}
            {tasks.length === 0 && !loading && <p className="muted">No tasks found.</p>}
          </div>
          <div className="row" style={{ gap: 20, marginTop: 12 }}>
            <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </button>
            <span className="muted">
              {page} of {totalPages}
            </span>
            <button className="btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
            <select className="select" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div className="card">
          <h2 className="h2">Create task</h2>
          <CreateTaskForm members={members} onCreated={handleCreated} />
        </div>
      </div>
    </div>
  );
}


