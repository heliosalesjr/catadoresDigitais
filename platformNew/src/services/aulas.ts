import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs,
  orderBy, query, setDoc, updateDoc, where, limit as qLimit,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { assertTurmaEditable, isTurmaArchived } from '@/lib/turma-archive'
import { todayISO } from '@/lib/date-utils'
import type { Aula, Role, RespostaDoc, Turma, UpcomingAula, UserProfile } from '@/types'

function aulasCol(turmaId: string) {
  return collection(db, 'turmas', turmaId, 'aulas')
}

function toAula(id: string, data: Omit<Aula, 'id'>): Aula {
  return { id, ...data }
}

export async function listAulas(turmaId: string): Promise<Aula[]> {
  const snap = await getDocs(query(aulasCol(turmaId), orderBy('date')))
  return snap.docs
    .map((d) => toAula(d.id, d.data() as Omit<Aula, 'id'>))
    .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))
}

export async function getAula(turmaId: string, aulaId: string): Promise<Aula> {
  const snap = await getDoc(doc(db, 'turmas', turmaId, 'aulas', aulaId))
  if (!snap.exists()) throw new Error('Aula não encontrada.')
  return toAula(snap.id, snap.data() as Omit<Aula, 'id'>)
}

interface CreateAulaInput {
  title: string
  description?: string
  teachers?: Aula['teachers']
  driveLinks?: Aula['driveLinks']
  date: string
  startTime: string
  endTime: string
}

export async function createAula(turmaId: string, body: CreateAulaInput, role: Role): Promise<{ id: string }> {
  if (!body.title?.trim() || !body.date || !body.startTime || !body.endTime) {
    throw new Error('Título, data, início e fim são obrigatórios.')
  }

  const { turma } = await assertTurmaEditable(turmaId, role)
  if (body.date < turma.startDate || body.date > turma.endDate) {
    throw new Error('Data fora do período da turma.')
  }
  if (body.date < todayISO()) {
    throw new Error('Não é possível criar uma aula para uma data passada.')
  }

  const attendanceCode = String(Math.floor(1000 + Math.random() * 9000))
  const status = role === 'admin' ? 'published' : 'pending'

  const ref = await addDoc(aulasCol(turmaId), {
    title: body.title.trim(),
    description: body.description?.trim() ?? '',
    teachers: body.teachers ?? [],
    driveLinks: body.driveLinks ?? [],
    date: body.date,
    startTime: body.startTime,
    endTime: body.endTime,
    attendance: {},
    attendanceCode,
    status,
    createdAt: new Date().toISOString(),
  })
  return { id: ref.id }
}

const AULA_EDITABLE_FIELDS = [
  'title', 'description', 'teachers', 'driveLinks',
  'date', 'startTime', 'endTime', 'attendance', 'avaliacoes', 'attendanceCode',
] as const

export async function updateAula(
  turmaId: string,
  aulaId: string,
  body: Record<string, unknown>,
  role: Role,
): Promise<void> {
  await assertTurmaEditable(turmaId, role)

  const ref = doc(db, 'turmas', turmaId, 'aulas', aulaId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Aula não encontrada.')

  const update: Record<string, unknown> = {}
  for (const key of AULA_EDITABLE_FIELDS) {
    if (key in body) update[key] = body[key]
  }
  // Só admins alteram o status (publicação)
  if (role === 'admin' && 'status' in body) update.status = body.status

  await updateDoc(ref, update)
}

export async function deleteAula(turmaId: string, aulaId: string): Promise<void> {
  await deleteDoc(doc(db, 'turmas', turmaId, 'aulas', aulaId))
}

/** Próximas aulas de um conjunto de turmas, ordenadas por data/hora. */
async function upcomingFromTurmas(
  turmas: Turma[],
  fromDate: string,
  opts: { perTurma: number; total: number; hidePending: boolean },
): Promise<UpcomingAula[]> {
  const perTurma = await Promise.all(
    turmas.map(async (turma) => {
      const snap = await getDocs(query(
        aulasCol(turma.id),
        where('date', '>=', fromDate),
        orderBy('date'),
        qLimit(opts.perTurma),
      ))
      return snap.docs
        .filter((d) => !opts.hidePending || d.data().status !== 'pending')
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Aula, 'id'>),
          turmaId: turma.id,
          turmaName: turma.name,
          turmaIconColor: turma.iconColor,
        } as UpcomingAula))
    })
  )

  return perTurma
    .flat()
    .sort((a, b) => {
      const d = a.date.localeCompare(b.date)
      return d !== 0 ? d : (a.startTime ?? '').localeCompare(b.startTime ?? '')
    })
    .slice(0, opts.total)
}

export async function listUpcomingAulasAdmin(): Promise<UpcomingAula[]> {
  const snap = await getDocs(collection(db, 'turmas'))
  const turmas = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Turma, 'id'>) }))
  return upcomingFromTurmas(turmas, todayISO(), { perTurma: 10, total: 10, hidePending: false })
}

export async function listUpcomingAulasTeacher(uid: string): Promise<UpcomingAula[]> {
  const snap = await getDocs(collection(db, 'turmas'))
  const turmas = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Turma, 'id'>) }))
    .filter((t) => t.professors?.some((p) => p.uid === uid))
  return upcomingFromTurmas(turmas, todayISO(), { perTurma: 10, total: 15, hidePending: false })
}

export async function listUpcomingAulasStudent(email: string): Promise<UpcomingAula[]> {
  const now = new Date()
  const dow = now.getDay()
  const mon = new Date(now)
  mon.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  const weekStart = `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`

  const snap = await getDocs(collection(db, 'turmas'))
  const turmas = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Turma, 'id'>) }))
    .filter((t) => t.students?.includes(email))
  return upcomingFromTurmas(turmas, weekStart, { perTurma: 20, total: 15, hidePending: true })
}

/** Percentual de frequência do aluno em todas as suas turmas. */
export async function getStudentFrequencia(email: string) {
  const today = todayISO()
  const turmasSnap = await getDocs(collection(db, 'turmas'))
  const turmas = turmasSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Turma, 'id'>) }))
    .filter((t) => t.students?.includes(email))

  const perTurma = await Promise.all(
    turmas.map(async (turma) => {
      const snap = await getDocs(query(
        aulasCol(turma.id),
        where('date', '<=', today),
        orderBy('date'),
      ))
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

  return { total, attended, percentage: total > 0 ? Math.round((attended / total) * 100) : null }
}

/**
 * Aluno responde a chamada com o código de 4 dígitos.
 * A validação do código acontece no cliente lendo o doc da aula.
 */
export async function submitChamada(
  turmaId: string,
  aulaId: string,
  code: string,
  user: UserProfile,
): Promise<void> {
  if (!code || typeof code !== 'string') throw new Error('Código inválido.')

  const turmaSnap = await getDoc(doc(db, 'turmas', turmaId))
  if (!turmaSnap.exists()) throw new Error('Turma não encontrada.')
  const turmaData = turmaSnap.data() as Omit<Turma, 'id'>
  if (!(turmaData.students ?? []).includes(user.email)) {
    throw new Error('Você não está matriculado nesta turma.')
  }
  if (isTurmaArchived(turmaData)) {
    throw new Error('Turma arquivada. Chamada indisponível.')
  }

  const aulaRef = doc(db, 'turmas', turmaId, 'aulas', aulaId)
  const aulaSnap = await getDoc(aulaRef)
  if (!aulaSnap.exists()) throw new Error('Aula não encontrada.')
  const aula = aulaSnap.data() as Omit<Aula, 'id'>

  if (!aula.attendanceCode || aula.attendanceCode !== code.trim()) {
    throw new Error('Código incorreto.')
  }

  const aulaStart = new Date(`${aula.date}T${aula.startTime}:00-03:00`)
  const aulaEnd = new Date(`${aula.date}T${aula.endTime}:00-03:00`)
  const now = new Date()
  if (now < aulaStart || now > aulaEnd) {
    throw new Error('Fora do horário da aula.')
  }

  await updateDoc(aulaRef, { [`attendance.${user.email}`]: 'present' })
}

/** Todas as respostas da aula (visão professor/admin). */
export async function listRespostas(turmaId: string, aulaId: string): Promise<RespostaDoc[]> {
  const snap = await getDocs(collection(db, 'turmas', turmaId, 'aulas', aulaId, 'respostas'))
  return snap.docs.map((d) => d.data() as RespostaDoc)
}

/** Resposta do próprio aluno (ou null). */
export async function getMyResposta(turmaId: string, aulaId: string, email: string): Promise<RespostaDoc | null> {
  const snap = await getDoc(doc(db, 'turmas', turmaId, 'aulas', aulaId, 'respostas', email))
  return snap.exists() ? (snap.data() as RespostaDoc) : null
}

export async function submitRespostas(
  turmaId: string,
  aulaId: string,
  answers: Record<string, string>,
  user: UserProfile,
): Promise<void> {
  const turmaSnap = await getDoc(doc(db, 'turmas', turmaId))
  if (!turmaSnap.exists()) throw new Error('Turma não encontrada.')
  const turmaData = turmaSnap.data() as Omit<Turma, 'id'>
  if (isTurmaArchived(turmaData)) {
    throw new Error('Turma arquivada. Não é possível enviar respostas.')
  }

  await setDoc(doc(db, 'turmas', turmaId, 'aulas', aulaId, 'respostas', user.email), {
    studentEmail: user.email,
    studentName: user.name ?? user.email,
    answers,
    submittedAt: new Date().toISOString(),
  })
}
