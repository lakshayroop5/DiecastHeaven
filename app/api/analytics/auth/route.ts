import { NextRequest, NextResponse } from 'next/server'
import { passwordMatches, signSession } from '@/lib/auth-token'

export async function POST(req: NextRequest) {
  let body: { password?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  const password = typeof body?.password === 'string' ? body.password : ''

  const expected = process.env.ANALYTICS_PASSWORD
  if (!expected || !(await passwordMatches(password, expected))) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('analytics_token', await signSession(expected, 60 * 60 * 24), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24,
  })
  return res
}
