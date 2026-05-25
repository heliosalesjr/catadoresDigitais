import { adminDb } from '@/lib/firebase-admin'
import { requireAuthAny } from '@/lib/require-auth-any'
import type { Turma } from '@/types'

export async function GET() {
  const auth = await requireAuthAny()
  if (auth instanceof Response) return auth

  const userSnap = await adminDb.collection('users').doc(auth.uid).get()
  const email = userSnap.data()?.email as string | undefined
  if (!email) return Response.json({ error: 'User not found' }, { status: 404 })

  const snap = await adminDb.collection('turmas').get()
  const turmas = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Turma, 'id'>) }))
    .filter((t) => t.students?.includes(email))

  return Response.json(turmas)
}
