"use client";

import dayjs from 'dayjs';

type Task = {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'DOING' | 'DONE';
  dueDate: string | null;
  assigneeId: string | null;
};

type Member = {
  id: string;
  name: string;
};

type Props = {
  task: Task;
  members: Member[];
  onUpdateStatus: (id: string, status: Task['status']) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
};

export default function TaskCard({ task, members, onUpdateStatus, onDelete }: Props) {
  const assigneeName = task.assigneeId
    ? (members.find((m) => m.id === task.assigneeId)?.name || 'Unknown')
    : 'Unassigned';

  return (
    <div className="card">
      <div className="space-between">
        <strong>{task.title}</strong>
        <div className="row">
          <select
            className="select"
            value={task.status}
            onChange={(e) => onUpdateStatus(task.id, e.target.value as Task['status'])}
          >
            <option value="TODO">Todo</option>
            <option value="DOING">Doing</option>
            <option value="DONE">Done</option>
          </select>
          <button className="btn danger" onClick={() => onDelete(task.id)}>Delete</button>
        </div>
      </div>
      <div className="row muted" style={{ marginTop: 6, fontSize: 12, gap: 8 }}>
        <span>Assignee: {assigneeName}</span>
        <span>•</span>
        <span>Due: {task.dueDate ? dayjs(task.dueDate).format('MMM D, YYYY h:mm A') : '—'}</span>
      </div>
      <div className="muted" style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{task.description}</div>
    </div>
  );
}


