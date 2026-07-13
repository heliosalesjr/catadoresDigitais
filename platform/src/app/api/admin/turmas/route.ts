import { requireAdmin } from '@/lib/require-admin'
import { adminDb } from '@/lib/firebase-admin'
import { isTurmaExpired } from '@/lib/turma-archive'
import type { Turma } from '@/types'

export async function GET() {
  const result = await requireAdmin()
  if (result instanceof Response) return result

  const snap = await adminDb.collection('turmas').orderBy('createdAt', 'desc').get()
  const now = new Date()
  const batch = adminDb.batch()
  let hasUpdates = false

  const turmas = snap.docs.map((d) => {
    const data = d.data() as Omit<Turma, 'id'>
    if (data.archived !== true && isTurmaExpired(data.endDate, now)) {
      const archivedAt = now.toISOString()
      batch.update(d.ref, { archived: true, archivedAt, archivedBy: 'system' })
      hasUpdates = true
      return { id: d.id, ...data, archived: true, archivedAt, archivedBy: 'system' }
    }
    return { id: d.id, ...data }
  })

  if (hasUpdates) await batch.commit()
  return Response.json(turmas)
}

export async function POST(req: Request) {
  const result = await requireAdmin()
  if (result instanceof Response) return result

  const body = await req.json() as Omit<Turma, 'id' | 'createdAt'>

  const start = new Date(body.startDate)
  const end = new Date(body.endDate)
  const diffMs = end.getTime() - start.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (end <= start) {
    return Response.json({ error: 'A data de término deve ser após a data de início.' }, { status: 400 })
  }
  if (diffDays > 366) {
    return Response.json({ error: 'O intervalo não pode ser maior que 12 meses.' }, { status: 400 })
  }

  const ref = adminDb.collection('turmas').doc()
  const turma: Omit<Turma, 'id'> = {
    ...body,
    students: body.students ?? [],
    createdAt: new Date().toISOString(),
  }

  await ref.set(turma)
  return Response.json({ id: ref.id, ...turma }, { status: 201 })
}
