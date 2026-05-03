import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'cd_session'
const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000

export async function POST(req: NextRequest) {
  const { idToken } = await req.json()

  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: FIVE_DAYS_MS,
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: FIVE_DAYS_MS / 1000,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  return NextResponse.json({ ok: true })
}
