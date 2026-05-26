import { adminDb } from '@/lib/firebase-admin'
import { requireAuthAny } from '@/lib/require-auth-any'
import type { Aula, Turma } from '@/types'

export interface FrequenciaResult {
  total: number
  attended: number
  percentage: number | null
}

export async function GET() {
  const auth = await requireAuthAny()
  if (auth instanceof Response) return auth

  const userSnap = await adminDb.collection('users').doc(auth.uid).get()
  const email = userSnap.data()?.email as string | undefined
  if (!email) return Response.json({ error: 'User not found' }, { status: 404 })

  const today = new Date().toISOString().split('T')[0]

  const turmasSnap = await adminDb.collection('turmas').get()
  const turmas = turmasSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Turma, 'id'>) }))
    .filter((t) => t.students?.includes(email))

  const perTurma = await Promise.all(
    turmas.map(async (turma) => {
      const snap = await adminDb
        .collection('turmas').doc(turma.id)
        .collection('aulas')
        .where('date', '<=', today)
        .orderBy('date')
        .get()

      return snap.docs
        .filter((d) => d.data().status !== 'pending')
        .map((d) => d.data() as Aula)
    })
  )

  const pastAulas = perTurma.flat()
  const total = pastAulas.length
  const attended = pastAulas.filter((a) => {
    const status = a.attendance?.[email]
    return status === 'present' || status === 'late'
  }).length

  const percentage = total > 0 ? Math.round((attended / total) * 100) : null

  return Response.json({ total, attended, percentage } satisfies FrequenciaResult)
}
