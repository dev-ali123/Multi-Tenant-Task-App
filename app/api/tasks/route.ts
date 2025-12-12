import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireTenantMembership } from '@/lib/auth';
import { TaskCreateSchema, TasksQuerySchema } from '@/lib/validators';

export async function GET(req: NextRequest) {
  try {
    const { tenantId } = await requireTenantMembership(req);
    const url = new URL(req.url);
    const query = {
      page: url.searchParams.get('page') ?? undefined,
      pageSize: url.searchParams.get('pageSize') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      search: url.searchParams.get('search') ?? undefined
    };
    const parsed = TasksQuerySchema.safeParse(query);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }
    const { page, pageSize, status, search } = parsed.data;
    const where: any = { tenantId };
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    const [total, items] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);
    return NextResponse.json({ total, items });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tenantId } = await requireTenantMembership(req);
    const json = await req.json().catch(() => ({}));
    const parsed = TaskCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const { title, description, status, dueDate, assigneeId } = parsed.data;
    if (assigneeId) {
      const membership = await prisma.membership.findUnique({
        where: { userId_tenantId: { userId: assigneeId, tenantId } }
      });
      if (!membership) {
        return NextResponse.json({ error: 'Assignee not in tenant' }, { status: 400 });
      }
    }
    let due: Date | null = null;
    if (dueDate) {
      const d = new Date(dueDate);
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: 'Invalid due date' }, { status: 400 });
      }
      const now = new Date();
      if (d <= now) {
        return NextResponse.json({ error: 'Due date must be in the future' }, { status: 400 });
      }
      due = d;
    }
    const task = await prisma.task.create({
      data: {
        tenantId,
        title,
        description,
        status,
        dueDate: due,
        assigneeId: assigneeId || null
      }
    });
    return NextResponse.json({ task });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


