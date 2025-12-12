import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, userIsAdmin } from '@/lib/auth';
import { InviteCreateSchema } from '@/lib/validators';
import crypto from 'crypto';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requireAuth(req);
    const tenantId = params.id;
    const isAdmin = await userIsAdmin(userId, tenantId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const json = await req.json().catch(() => ({}));
    const parsed = InviteCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const { email } = parsed.data;
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invite = await prisma.invite.create({
      data: {
        tenantId,
        email,
        token,
        expiresAt,
        invitedById: userId
      }
    });
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const acceptUrl = `${baseUrl}/api/invites/${invite.token}/accept`;
    return NextResponse.json({ inviteId: invite.id, acceptUrl });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


