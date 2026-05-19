import { adminDb } from '@/lib/firebase-admin'
import { requireEditor } from '@/lib/require-editor'
import type { Turma } from '@/types'

export async function GET() {
  const auth = await requireEditor()
  if (auth instanceof Response) return auth

  const snap = await adminDb.collection('turmas').get()
  const turmas = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Turma, 'id'>) }))
    .filter((t) => t.professors?.some((p) => p.uid === auth.uid))

  return Response.json(turmas)
}
