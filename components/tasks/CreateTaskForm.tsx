"use client";

import { useState } from 'react';
import dayjs from 'dayjs';
import Alert from '@/components/ui/Alert';

type Member = { id: string; name: string; email: string };

type Props = {
  members: Member[];
  onCreated: () => Promise<void> | void;
};

export default function CreateTaskForm({ members, onCreated }: Props) {
  const [createError, setCreateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setCreateError(null);
    setLoading(true);
    try {
      const dueDateStr = String(formData.get('dueDate') || '') || null;
      if (dueDateStr) {
        const d = new Date(dueDateStr);
        if (isNaN(d.getTime()) || d <= new Date()) {
          setCreateError("Due date can't be in the past.");
          setLoading(false);
          return;
        }
      }
      const body = {
        title: String(formData.get('title') || ''),
        description: String(formData.get('description') || ''),
        status: String(formData.get('status') || 'TODO'),
        dueDate: dueDateStr,
        assigneeId: String(formData.get('assigneeId') || '') || null
      };
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          (data as any).error === 'Due date must be in the future'
            ? "Due date can't be in the past."
            : ((data as any).error || 'Failed to create task');
        setCreateError(msg);
        setLoading(false);
        return;
      }
      await onCreated();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {createError ? <Alert variant="error">{createError}</Alert> : null}
      <form
        action={async (fd) => {
          await onSubmit(fd);
        }}
        className="stack-8"
        style={{ maxWidth: 520, marginTop: 8 }}
        aria-busy={loading}
      >
        <input className="input" name="title" placeholder="Title" required disabled={loading} />
        <textarea className="textarea" name="description" placeholder="Description" rows={3} />
        <select className="select" name="status" defaultValue="TODO" disabled={loading}>
          <option value="TODO">Todo</option>
          <option value="DOING">Doing</option>
          <option value="DONE">Done</option>
        </select>
        <input
          className="input"
          name="dueDate"
          type="datetime-local"
          min={dayjs().format('YYYY-MM-DDTHH:mm')}
          disabled={loading}
        />
        <select className="select-assignee" name="assigneeId" defaultValue="" disabled={loading}>
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.email})
            </option>
          ))}
        </select>
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? (<><span className="spinner" /> Create</>) : 'Create'}
        </button>
      </form>
    </div>
  );
}


