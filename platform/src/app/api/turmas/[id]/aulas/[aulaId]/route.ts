import { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireEditor } from '@/lib/require-editor'
import { requireAuthAny } from '@/lib/require-auth-any'

type Ctx = { params: Promise<{ id: string; aulaId: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAuthAny()
  if (auth instanceof Response) return auth

  const { id, aulaId } = await params
  const doc = await adminDb.collection('turmas').doc(id).collection('aulas').doc(aulaId).get()
  if (!doc.exists) return Response.json({ error: 'Aula não encontrada.' }, { status: 404 })

  return Response.json({ id: doc.id, ...doc.data() })
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await requireEditor()
  if (auth instanceof Response) return auth

  const { id, aulaId } = await params
  const body = await req.json()

  const ref = adminDb.collection('turmas').doc(id).collection('aulas').doc(aulaId)
  const doc = await ref.get()
  if (!doc.exists) return Response.json({ error: 'Aula não encontrada.' }, { status: 404 })

  const allowed = ['title', 'description', 'teachers',
                   'driveLinks', 'date', 'startTime', 'endTime', 'attendance', 'avaliacoes', 'attendanceCode']
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

  const { id, aulaId } = await params
  await adminDb.collection('turmas').doc(id).collection('aulas').doc(aulaId).delete()
  return Response.json({ ok: true })
}
