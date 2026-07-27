import {
  collection, deleteDoc, doc, getDoc, getDocs, orderBy, query,
  updateDoc, writeBatch, addDoc, where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { isTurmaExpired } from '@/lib/turma-archive'
import type { Turma } from '@/types'

function toTurma(id: string, data: Omit<Turma, 'id'>): Turma {
  return { id, ...data }
}

/** Lista todas as turmas (admin), arquivando automaticamente as expiradas. */
export async function listTurmasAdmin(): Promise<Turma[]> {
  const snap = await getDocs(query(collection(db, 'turmas'), orderBy('createdAt', 'desc')))
  const now = new Date()
  const batch = writeBatch(db)
  let hasUpdates = false

  const turmas = snap.docs.map((d) => {
    const data = d.data() as Omit<Turma, 'id'>
    if (data.archived !== true && isTurmaExpired(data.endDate, now)) {
      const archivedAt = now.toISOString()
      batch.update(d.ref, { archived: true, archivedAt, archivedBy: 'system' })
      hasUpdates = true
      return toTurma(d.id, { ...data, archived: true, archivedAt, archivedBy: 'system' })
    }
    return toTurma(d.id, data)
  })

  if (hasUpdates) await batch.commit()
  return turmas
}

export async function getTurma(id: string): Promise<Turma> {
  const snap = await getDoc(doc(db, 'turmas', id))
  if (!snap.exists()) throw new Error('Turma não encontrada.')
  return toTurma(snap.id, snap.data() as Omit<Turma, 'id'>)
}

/** Versão admin do get: também persiste o arquivamento automático. */
export async function getTurmaAdmin(id: string): Promise<Turma> {
  const snap = await getDoc(doc(db, 'turmas', id))
  if (!snap.exists()) throw new Error('Turma não encontrada.')

  const data = snap.data() as Omit<Turma, 'id'>
  if (data.archived !== true && isTurmaExpired(data.endDate)) {
    const archivedAt = new Date().toISOString()
    await updateDoc(snap.ref, { archived: true, archivedAt, archivedBy: 'system' })
    return toTurma(snap.id, { ...data, archived: true, archivedAt, archivedBy: 'system' })
  }
  return toTurma(snap.id, data)
}

export async function createTurma(body: Omit<Turma, 'id' | 'createdAt'>): Promise<Turma> {
  const start = new Date(body.startDate)
  const end = new Date(body.endDate)
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)

  if (end <= start) throw new Error('A data de término deve ser após a data de início.')
  if (diffDays > 366) throw new Error('O intervalo não pode ser maior que 12 meses.')

  const turma: Omit<Turma, 'id'> = {
    ...body,
    students: body.students ?? [],
    createdAt: new Date().toISOString(),
  }
  const ref = await addDoc(collection(db, 'turmas'), turma)
  return toTurma(ref.id, turma)
}

export async function updateTurma(
  id: string,
  patch: Partial<Turma> & Record<string, unknown>,
  adminUid: string,
): Promise<void> {
  const body = { ...patch }
  if ('archived' in body) {
    const archived = body.archived === true
    body.archivedAt = archived ? new Date().toISOString() : null
    body.archivedBy = archived ? adminUid : null
  }
  await updateDoc(doc(db, 'turmas', id), body)
}

export async function deleteTurma(id: string): Promise<void> {
  await deleteDoc(doc(db, 'turmas', id))
}

/** Turmas em que o professor leciona. */
export async function listTeacherTurmas(uid: string): Promise<Turma[]> {
  const snap = await getDocs(collection(db, 'turmas'))
  return snap.docs
    .map((d) => toTurma(d.id, d.data() as Omit<Turma, 'id'>))
    .filter((t) => t.professors?.some((p) => p.uid === uid))
}

/** Turmas em que o aluno está matriculado. */
export async function listStudentTurmas(email: string): Promise<Turma[]> {
  const snap = await getDocs(collection(db, 'turmas'))
  return snap.docs
    .map((d) => toTurma(d.id, d.data() as Omit<Turma, 'id'>))
    .filter((t) => t.students?.includes(email))
}

/** Busca nomes de usuários por e-mail (em blocos de 30, limite do `in`). */
export async function getNamesByEmail(emails: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  for (let i = 0; i < emails.length; i += 30) {
    const chunk = emails.slice(i, i + 30)
    if (chunk.length === 0) continue
    const snap = await getDocs(query(collection(db, 'users'), where('email', 'in', chunk)))
    for (const d of snap.docs) {
      const data = d.data()
      if (data.email) result[data.email] = data.name
    }
  }
  return result
}

/** Alunos da turma com nome resolvido (antes /api/turmas/[id]/students). */
export async function getTurmaStudents(id: string): Promise<{ email: string; name: string | null }[]> {
  const turma = await getTurma(id)
  const emails = turma.students ?? []
  const nameMap = await getNamesByEmail(emails)
  return emails.map((email) => ({ email, name: nameMap[email] ?? null }))
}
