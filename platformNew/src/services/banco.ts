import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { assertTurmaEditable } from '@/lib/turma-archive'
import { todayISO } from '@/lib/date-utils'
import type { BancoAula, Role, UserProfile } from '@/types'

function bancoCol(turmaId: string) {
  return collection(db, 'turmas', turmaId, 'banco')
}

export async function listBanco(turmaId: string): Promise<BancoAula[]> {
  const snap = await getDocs(query(bancoCol(turmaId), orderBy('createdAt')))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BancoAula, 'id'>) }))
}

interface CreateBancoInput {
  title: string
  description?: string
  teachers?: BancoAula['teachers']
  driveLinks?: BancoAula['driveLinks']
  avaliacoes?: BancoAula['avaliacoes']
}

export async function createBancoAula(
  turmaId: string,
  body: CreateBancoInput,
  user: UserProfile,
): Promise<{ id: string }> {
  if (!body.title?.trim()) throw new Error('O título é obrigatório.')

  await assertTurmaEditable(turmaId, user.role)

  let teachers = body.teachers ?? []
  if (user.role === 'teacher' && !teachers.find((t) => t.uid === user.uid)) {
    teachers = [{ uid: user.uid, name: user.name }, ...teachers]
  }

  const ref = await addDoc(bancoCol(turmaId), {
    title: body.title.trim(),
    description: body.description?.trim() ?? '',
    teachers,
    driveLinks: body.driveLinks ?? [],
    avaliacoes: body.avaliacoes ?? [],
    createdBy: user.uid,
    createdAt: new Date().toISOString(),
  })
  return { id: ref.id }
}

const BANCO_EDITABLE_FIELDS = ['title', 'description', 'teachers', 'driveLinks', 'avaliacoes'] as const

export async function updateBancoAula(
  turmaId: string,
  bancoId: string,
  body: Record<string, unknown>,
  role: Role,
): Promise<void> {
  await assertTurmaEditable(turmaId, role)

  const ref = doc(db, 'turmas', turmaId, 'banco', bancoId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Aula não encontrada.')

  const update: Record<string, unknown> = {}
  for (const key of BANCO_EDITABLE_FIELDS) {
    if (key in body) update[key] = body[key]
  }
  await updateDoc(ref, update)
}

export async function deleteBancoAula(
  turmaId: string,
  bancoId: string,
  user: UserProfile,
): Promise<void> {
  await assertTurmaEditable(turmaId, user.role)

  const ref = doc(db, 'turmas', turmaId, 'banco', bancoId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Aula não encontrada.')

  if (user.role !== 'admin' && snap.data().createdBy !== user.uid) {
    throw new Error('Sem permissão para excluir.')
  }
  await deleteDoc(ref)
}

/** Agenda uma aula do banco para uma data concreta, criando a aula na turma. */
export async function agendarBancoAula(
  turmaId: string,
  bancoId: string,
  body: { date: string; startTime: string; endTime: string },
  role: Role,
): Promise<{ id: string }> {
  if (!body.date || !body.startTime || !body.endTime) {
    throw new Error('Data, início e fim são obrigatórios.')
  }

  const { turma } = await assertTurmaEditable(turmaId, role)
  if (body.date < turma.startDate || body.date > turma.endDate) {
    throw new Error('Data fora do período da turma.')
  }
  if (body.date < todayISO()) {
    throw new Error('Não é possível agendar para uma data passada.')
  }

  const bancoSnap = await getDoc(doc(db, 'turmas', turmaId, 'banco', bancoId))
  if (!bancoSnap.exists()) throw new Error('Aula do banco não encontrada.')

  const banco = bancoSnap.data() as Omit<BancoAula, 'id'>
  const attendanceCode = String(Math.floor(1000 + Math.random() * 9000))
  const status = role === 'admin' ? 'published' : 'pending'

  const ref = await addDoc(collection(db, 'turmas', turmaId, 'aulas'), {
    title: banco.title,
    description: banco.description ?? '',
    teachers: banco.teachers ?? [],
    driveLinks: banco.driveLinks ?? [],
    avaliacoes: banco.avaliacoes ?? [],
    date: body.date,
    startTime: body.startTime,
    endTime: body.endTime,
    attendance: {},
    attendanceCode,
    status,
    bancoAulaId: bancoId,
    createdAt: new Date().toISOString(),
  })
  return { id: ref.id }
}
