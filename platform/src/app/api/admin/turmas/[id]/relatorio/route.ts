import { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireEditor } from '@/lib/require-editor'
import type { Aula, Turma } from '@/types'

type Ctx = { params: Promise<{ id: string }> }

function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

async function getNamesByEmail(emails: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  for (let i = 0; i < emails.length; i += 30) {
    const chunk = emails.slice(i, i + 30)
    if (chunk.length === 0) continue
    const snap = await adminDb.collection('users').where('email', 'in', chunk).get()
    for (const doc of snap.docs) {
      const data = doc.data()
      if (data.email) result[data.email] = data.name
    }
  }
  return result
}

export async function GET(req: NextRequest, { params }: Ctx) {
  const auth = await requireEditor()
  if (auth instanceof Response) return auth

  const { id } = await params
  const turmaDoc = await adminDb.collection('turmas').doc(id).get()
  if (!turmaDoc.exists) return Response.json({ error: 'Turma não encontrada.' }, { status: 404 })
  const turma = turmaDoc.data() as Omit<Turma, 'id'>

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from') || turma.startDate
  const to = searchParams.get('to') || turma.endDate

  const aulasSnap = await adminDb
    .collection('turmas').doc(id)
    .collection('aulas')
    .where('date', '>=', from)
    .where('date', '<=', to)
    .orderBy('date')
    .get()

  const students = turma.students ?? []
  const totalAlunos = students.length
  const studentNames = await getNamesByEmail(students)
  let totalDuracaoMinutos = 0

  const aulas = []
  for (const doc of aulasSnap.docs) {
    const aula = { id: doc.id, ...(doc.data() as Omit<Aula, 'id'>) }
    const duracaoMinutos = minutesBetween(aula.startTime, aula.endTime)
    totalDuracaoMinutos += duracaoMinutos

    const avaliacoes = aula.avaliacoes ?? []
    const completed: string[] = []

    if (avaliacoes.length > 0) {
      const respostasSnap = await adminDb
        .collection('turmas').doc(id)
        .collection('aulas').doc(aula.id)
        .collection('respostas')
        .get()

      for (const r of respostasSnap.docs) {
        const answers = (r.data().answers ?? {}) as Record<string, string>
        const completou = avaliacoes.every((av) => (answers[av.id] ?? '').trim().length > 0)
        if (completou) completed.push(r.id)
      }
    }

    const alunosConcluiram = completed.length

    aulas.push({
      aulaId: aula.id,
      title: aula.title,
      date: aula.date,
      duracaoMinutos,
      totalAvaliacoes: avaliacoes.length,
      alunosConcluiram,
      percentualConclusao: avaliacoes.length > 0 && totalAlunos > 0
        ? Math.round((alunosConcluiram / totalAlunos) * 100)
        : null,
      attendance: aula.attendance ?? {},
      completed,
    })
  }

  const totalPresencas = aulas.reduce((sum, a) => {
    return sum + students.filter((email) => {
      const s = (a.attendance as Record<string, string>)[email]
      return s === 'present' || s === 'late'
    }).length
  }, 0)
  const percentualPresenca = aulas.length > 0 && totalAlunos > 0
    ? Math.round((totalPresencas / (aulas.length * totalAlunos)) * 100)
    : null

  return Response.json({
    periodo: { from, to },
    students,
    studentNames,
    totalAlunos,
    totalAulas: aulas.length,
    totalDuracaoMinutos,
    percentualPresenca,
    aulas,
  })
}
