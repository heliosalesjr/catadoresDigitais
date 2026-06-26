import { requireAdmin } from '@/lib/require-admin'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import type { Role } from '@/types'

const ALLOWED_ROLES: Role[] = ['teacher', 'student']

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  const result = await requireAdmin()
  if (result instanceof Response) return result

  const { uid } = await params
  const body = await req.json() as { role?: Role; name?: string }

  const ref = adminDb.collection('users').doc(uid)
  const snap = await ref.get()

  if (!snap.exists) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  if (snap.data()?.role === 'admin') {
    return Response.json({ error: 'Cannot change admin' }, { status: 403 })
  }

  const update: Record<string, string> = {}

  if (body.role !== undefined) {
    if (!ALLOWED_ROLES.includes(body.role)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 })
    }
    update.role = body.role
  }

  if (body.name !== undefined) {
    const trimmed = body.name.trim()
    if (!trimmed) return Response.json({ error: 'Name cannot be empty' }, { status: 400 })
    update.name = trimmed
  }

  if (Object.keys(update).length === 0) {
    return Response.json({ error: 'Nothing to update' }, { status: 400 })
  }

  await ref.update(update)
  return Response.json({ ok: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  const result = await requireAdmin()
  if (result instanceof Response) return result

  const { uid } = await params

  const snap = await adminDb.collection('users').doc(uid).get()
  if (!snap.exists) return Response.json({ error: 'User not found' }, { status: 404 })
  if (snap.data()?.role === 'admin') {
    return Response.json({ error: 'Cannot delete an admin' }, { status: 403 })
  }

  await adminDb.collection('users').doc(uid).delete()
  await adminAuth.deleteUser(uid)

  return Response.json({ ok: true })
}
