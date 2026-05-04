import { requireAdmin } from '@/lib/require-admin'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin()
  if (result instanceof Response) return result

  const { id } = await params
  const snap = await adminDb.collection('turmas').doc(id).get()
  if (!snap.exists) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ id: snap.id, ...snap.data() })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin()
  if (result instanceof Response) return result

  const { id } = await params
  const body = await req.json()
  await adminDb.collection('turmas').doc(id).update(body)
  return Response.json({ ok: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin()
  if (result instanceof Response) return result

  const { id } = await params
  await adminDb.collection('turmas').doc(id).delete()
  return Response.json({ ok: true })
}
