import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { verifyToken, signToken } from './jwt';
import { parse as parseCookie } from 'cookie';

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export function getCookiesFromRequest(req: Request): Record<string, string> {
  const cookieHeader = req.headers.get('cookie') || '';
  return parseCookie(cookieHeader);
}

export async function getAuthUserId(req: Request): Promise<string | null> {
  const cookies = getCookiesFromRequest(req);
  const token = cookies['auth'];
  if (!token) return null;
  const payload = verifyToken<{ userId: string }>(token);
  return payload?.userId ?? null;
}

export async function requireAuth(req: Request): Promise<{ userId: string }> {
  const userId = await getAuthUserId(req);
  if (!userId) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  return { userId };
}

export async function requireTenantMembership(req: Request): Promise<{ userId: string; tenantId: string }> {
  const { userId } = await requireAuth(req);
  const cookies = getCookiesFromRequest(req);
  const tenantId = cookies['tenantId'];
  if (!tenantId) {
    throw new Response(JSON.stringify({ error: 'Tenant not selected' }), { status: 400 });
  }
  const membership = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId, tenantId } }
  });
  if (!membership) {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  return { userId, tenantId };
}

export async function userIsAdmin(userId: string, tenantId: string): Promise<boolean> {
  const membership = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId, tenantId } }
  });
  return membership?.role === 'ADMIN';
}

export function createAuthCookie(userId: string): string {
  const token = signToken({ userId }, '7d');
  return token;
}


