import { adminDb } from './firebase-admin'
import { isTurmaExpired } from './date-utils'
import type { Turma } from '@/types'

export { isTurmaExpired }

/** Estado efetivo de arquivamento: flag persistida OU expiração já atingida. */
export function isTurmaArchived(turma: Pick<Turma, 'archived' | 'endDate'>): boolean {
  return turma.archived === true || isTurmaExpired(turma.endDate)
}

/**
 * Busca a turma e bloqueia a escrita se ela estiver arquivada e quem pede
 * não for admin. Turmas arquivadas só podem ser alteradas por um admin.
 */
export async function assertTurmaEditable(
  turmaId: string,
  role: string | undefined,
): Promise<{ turma: Turma } | Response> {
  const doc = await adminDb.collection('turmas').doc(turmaId).get()
  if (!doc.exists) return Response.json({ error: 'Turma não encontrada.' }, { status: 404 })

  const turma = { id: doc.id, ...(doc.data() as Omit<Turma, 'id'>) }
  if (role !== 'admin' && isTurmaArchived(turma)) {
    return Response.json({ error: 'Turma arquivada. Somente um admin pode alterá-la.' }, { status: 403 })
  }
  return { turma }
}

/**
 * Varre todas as turmas não arquivadas e persiste `archived: true` nas que
 * já passaram do prazo. Usado pelo cron diário e como fallback.
 */
export async function autoArchiveExpiredTurmas(now: Date = new Date()): Promise<number> {
  const snap = await adminDb.collection('turmas').get()
  const batch = adminDb.batch()
  let count = 0

  for (const doc of snap.docs) {
    const data = doc.data() as Omit<Turma, 'id'>
    if (data.archived !== true && isTurmaExpired(data.endDate, now)) {
      batch.update(doc.ref, {
        archived: true,
        archivedAt: now.toISOString(),
        archivedBy: 'system',
      })
      count++
    }
  }

  if (count > 0) await batch.commit()
  return count
}
