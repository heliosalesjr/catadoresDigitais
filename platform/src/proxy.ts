import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import type { Role } from '@/types'

const DASHBOARD_ROOTS: Record<Role, string> = {
  admin: '/dashboard/admin',
  teacher: '/dashboard/teacher',
  student: '/dashboard/student',
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const sessionCookie = req.cookies.get('cd_session')?.value

  const isAuthRoute = pathname.startsWith('/login')
  const isDashboard = pathname.startsWith('/dashboard')

  if (!isDashboard && !isAuthRoute) return NextResponse.next()

  if (!sessionCookie) {
    if (isDashboard) return NextResponse.redirect(new URL('/login', req.url))
    return NextResponse.next()
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    const userSnap = await adminDb.collection('users').doc(decoded.uid).get()
    const role = (userSnap.data()?.role ?? 'student') as Role
    const home = DASHBOARD_ROOTS[role]

    if (isAuthRoute) return NextResponse.redirect(new URL(home, req.url))

    const isShared = pathname.startsWith('/dashboard/turmas')
    if (isDashboard && !isShared && !pathname.startsWith(home)) {
      return NextResponse.redirect(new URL(home, req.url))
    }

    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/login', req.url))
    res.cookies.delete('cd_session')
    return res
  }
}

export const config = {
  matcher: ['/login', '/dashboard/:path*'],
}
