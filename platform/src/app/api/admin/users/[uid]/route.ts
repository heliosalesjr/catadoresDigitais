import { requireAdmin } from '@/lib/require-admin'
import { adminDb } from '@/lib/firebase-admin'
import type { Role } from '@/types'

const ALLOWED_ROLES: Role[] = ['teacher', 'student']

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  const result = await requireAdmin()
  if (result instanceof Response) return result

  const { uid } = await params
  const { role } = await req.json() as { role: Role }

  if (!ALLOWED_ROLES.includes(role)) {
    return Response.json({ error: 'Invalid role' }, { status: 400 })
  }

  const ref = adminDb.collection('users').doc(uid)
  const snap = await ref.get()

  if (!snap.exists) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  if (snap.data()?.role === 'admin') {
    return Response.json({ error: 'Cannot change admin role' }, { status: 403 })
  }

  await ref.update({ role })
  return Response.json({ ok: true })
}
