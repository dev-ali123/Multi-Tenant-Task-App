import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  // Clear cookies
  res.cookies.set('auth', '', { httpOnly: true, path: '/', maxAge: 0, sameSite: 'lax' });
  res.cookies.set('tenantId', '', { httpOnly: true, path: '/', maxAge: 0, sameSite: 'lax' });
  return res;
}


