import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
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
): Promise<{ turma: Turma }> {
  const snap = await getDoc(doc(db, 'turmas', turmaId))
  if (!snap.exists()) throw new Error('Turma não encontrada.')

  const turma = { id: snap.id, ...(snap.data() as Omit<Turma, 'id'>) }
  if (role !== 'admin' && isTurmaArchived(turma)) {
    throw new Error('Turma arquivada. Somente um admin pode alterá-la.')
  }
  return { turma }
}
