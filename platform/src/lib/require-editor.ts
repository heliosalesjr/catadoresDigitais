import { cookies } from 'next/headers'
import { adminAuth, adminDb } from './firebase-admin'

export async function requireEditor(): Promise<{ uid: string; role: string } | Response> {
  const cookieStore = await cookies()
  const session = cookieStore.get('cd_session')?.value

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true)
    const snap = await adminDb.collection('users').doc(decoded.uid).get()
    const role = snap.data()?.role
    if (role !== 'admin' && role !== 'teacher') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
    return { uid: decoded.uid, role }
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
