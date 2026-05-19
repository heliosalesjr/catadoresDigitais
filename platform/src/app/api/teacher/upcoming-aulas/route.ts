import { adminDb } from '@/lib/firebase-admin'
import { requireEditor } from '@/lib/require-editor'
import type { Aula, Turma } from '@/types'
import type { UpcomingAula } from '@/app/api/admin/upcoming-aulas/route'

export async function GET() {
  const auth = await requireEditor()
  if (auth instanceof Response) return auth

  const today = new Date().toISOString().split('T')[0]

  const turmasSnap = await adminDb.collection('turmas').get()
  const turmas = turmasSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Turma, 'id'>) }))
    .filter((t) => t.professors?.some((p) => p.uid === auth.uid))

  const perTurma = await Promise.all(
    turmas.map(async (turma) => {
      const snap = await adminDb
        .collection('turmas').doc(turma.id)
        .collection('aulas')
        .where('date', '>=', today)
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
