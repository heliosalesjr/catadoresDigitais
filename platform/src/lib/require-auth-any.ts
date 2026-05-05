import { cookies } from 'next/headers'
import { adminAuth } from './firebase-admin'

export async function requireAuthAny(): Promise<{ uid: string } | Response> {
  const cookieStore = await cookies()
  const session = cookieStore.get('cd_session')?.value

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true)
    return { uid: decoded.uid }
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
