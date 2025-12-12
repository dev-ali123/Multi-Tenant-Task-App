import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireTenantMembership } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { tenantId } = await requireTenantMembership(req);
    const memberships = await prisma.membership.findMany({
      where: { tenantId },
      include: { user: true }
    });
    const members = memberships.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role
    }));
    return NextResponse.json({ members });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


