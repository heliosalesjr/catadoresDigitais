import { adminDb } from '@/lib/firebase-admin'
import { requireAuthAny } from '@/lib/require-auth-any'
import type { Aula, Turma } from '@/types'
import type { UpcomingAula } from '@/app/api/admin/upcoming-aulas/route'

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
        .where('date', '>=', today)
        .where('status', '!=', 'pending')
        .orderBy('status')
        .orderBy('date')
        .limit(10)
        .get()

      return snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Aula, 'id'>),
        turmaId: turma.id,
        turmaName: turma.name,
        turmaIconColor: turma.iconColor,
      } as UpcomingAula))
    })
  )

  const aulas = perTurma
    .flat()
    .sort((a, b) => {
      const d = a.date.localeCompare(b.date)
      return d !== 0 ? d : (a.startTime ?? '').localeCompare(b.startTime ?? '')
    })
    .slice(0, 15)

  return Response.json(aulas)
}
