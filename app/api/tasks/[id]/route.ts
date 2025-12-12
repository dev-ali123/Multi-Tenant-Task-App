import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireTenantMembership } from '@/lib/auth';
import { TaskUpdateSchema } from '@/lib/validators';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { tenantId } = await requireTenantMembership(req);
    const id = params.id;
    const json = await req.json().catch(() => ({}));
    const parsed = TaskUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const updates: any = { ...parsed.data };
    if (updates.dueDate !== undefined) {
    if (updates.dueDate) {
      const d = new Date(updates.dueDate);
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: 'Invalid due date' }, { status: 400 });
      }
      const now = new Date();
      if (d <= now) {
        return NextResponse.json({ error: 'Due date must be in the future' }, { status: 400 });
      }
      updates.dueDate = d;
    } else {
      updates.dueDate = null;
    }
    }
    if (updates.assigneeId !== undefined) {
      if (updates.assigneeId) {
        const membership = await prisma.membership.findUnique({
          where: { userId_tenantId: { userId: updates.assigneeId, tenantId } }
        });
        if (!membership) {
          return NextResponse.json({ error: 'Assignee not in tenant' }, { status: 400 });
        }
      }
    }
    const task = await prisma.task.update({ where: { id }, data: updates });
    return NextResponse.json({ task });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { tenantId } = await requireTenantMembership(req);
    const id = params.id;
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing || existing.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


