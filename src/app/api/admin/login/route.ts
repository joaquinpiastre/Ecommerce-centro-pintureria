import { NextResponse } from 'next/server';
import { createSessionToken, verifyPassword, ADMIN_COOKIE, SESSION_COOKIE_OPTIONS } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!password || !verifyPassword(password)) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), SESSION_COOKIE_OPTIONS);
  return res;
}
