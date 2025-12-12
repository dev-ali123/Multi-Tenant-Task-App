import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, getCookiesFromRequest } from '@/lib/auth';
import { TenantCreateSchema } from '@/lib/validators';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req);
    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: { tenant: true }
    });
    const tenants = memberships.map((m) => ({ id: m.tenant.id, name: m.tenant.name, role: m.role }));
    const cookies = getCookiesFromRequest(req);
    const currentTenantId = cookies['tenantId'] ?? null;
    return NextResponse.json({ tenants, currentTenantId });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth(req);
    const json = await req.json().catch(() => ({}));
    const parsed = TenantCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const { name } = parsed.data;
    const tenant = await prisma.tenant.create({
      data: {
        name,
        memberships: {
          create: {
            userId,
            role: 'ADMIN'
          }
        }
      }
    });
    const res = NextResponse.json({ tenant });
    res.cookies.set('tenantId', tenant.id, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    });
    return res;
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


