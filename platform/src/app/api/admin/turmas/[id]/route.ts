import { requireAdmin } from '@/lib/require-admin'
import { adminDb } from '@/lib/firebase-admin'
import { isTurmaExpired } from '@/lib/turma-archive'
import type { Turma } from '@/types'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin()
  if (result instanceof Response) return result

  const { id } = await params
  const snap = await adminDb.collection('turmas').doc(id).get()
  if (!snap.exists) return Response.json({ error: 'Not found' }, { status: 404 })

  const data = snap.data() as Omit<Turma, 'id'>
  if (data.archived !== true && isTurmaExpired(data.endDate)) {
    const archivedAt = new Date().toISOString()
    await snap.ref.update({ archived: true, archivedAt, archivedBy: 'system' })
    return Response.json({ id: snap.id, ...data, archived: true, archivedAt, archivedBy: 'system' })
  }

  return Response.json({ id: snap.id, ...data })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin()
  if (result instanceof Response) return result

  const { id } = await params
  const body = await req.json()

  if ('archived' in body) {
    const archived = body.archived === true
    body.archivedAt = archived ? new Date().toISOString() : null
    body.archivedBy = archived ? result.uid : null
  }

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
