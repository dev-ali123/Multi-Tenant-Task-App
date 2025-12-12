import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { userId } = await requireAuth(req);
    const token = params.token;
    const invite = await prisma.invite.findUnique({ where: { token } });
    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite' }, { status: 404 });
    }
    if (invite.status !== 'PENDING' || invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invite expired or already used' }, { status: 400 });
    }
    // Create or ensure membership
    await prisma.membership.upsert({
      where: { userId_tenantId: { userId, tenantId: invite.tenantId } },
      create: { userId, tenantId: invite.tenantId, role: 'MEMBER' },
      update: {}
    });
    await prisma.invite.update({ where: { token }, data: { status: 'ACCEPTED' } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


