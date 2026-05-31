import { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireEditor } from '@/lib/require-editor'

type Ctx = { params: Promise<{ id: string; bancoId: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await requireEditor()
  if (auth instanceof Response) return auth

  const { id, bancoId } = await params
  const body = await req.json()

  const ref = adminDb.collection('turmas').doc(id).collection('banco').doc(bancoId)
  const doc = await ref.get()
  if (!doc.exists) return Response.json({ error: 'Aula não encontrada.' }, { status: 404 })

  const allowed = ['title', 'description', 'teachers', 'driveLinks', 'avaliacoes']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  await ref.update(update)
  return Response.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const auth = await requireEditor()
  if (auth instanceof Response) return auth

  const { id, bancoId } = await params

  const ref = adminDb.collection('turmas').doc(id).collection('banco').doc(bancoId)
  const doc = await ref.get()
  if (!doc.exists) return Response.json({ error: 'Aula não encontrada.' }, { status: 404 })

  const data = doc.data()!
  if (auth.role !== 'admin' && data.createdBy !== auth.uid) {
    return Response.json({ error: 'Sem permissão para excluir.' }, { status: 403 })
  }

  await ref.delete()
  return Response.json({ ok: true })
}
