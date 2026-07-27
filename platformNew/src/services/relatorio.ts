import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getNamesByEmail } from './turmas'
import type { Aula, RelatorioAula, RelatorioResult, Turma } from '@/types'

function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

export async function getRelatorio(
  turmaId: string,
  range?: { from?: string; to?: string },
): Promise<RelatorioResult> {
  const turmaSnap = await getDoc(doc(db, 'turmas', turmaId))
  if (!turmaSnap.exists()) throw new Error('Turma não encontrada.')
  const turma = turmaSnap.data() as Omit<Turma, 'id'>

  const from = range?.from || turma.startDate
  const to = range?.to || turma.endDate

  const aulasSnap = await getDocs(query(
    collection(db, 'turmas', turmaId, 'aulas'),
    where('date', '>=', from),
    where('date', '<=', to),
    orderBy('date'),
  ))

  const students = turma.students ?? []
  const totalAlunos = students.length
  const studentNames = await getNamesByEmail(students)
  let totalDuracaoMinutos = 0

  const aulas: RelatorioAula[] = []
  for (const d of aulasSnap.docs) {
    const aula = { id: d.id, ...(d.data() as Omit<Aula, 'id'>) }
    const duracaoMinutos = minutesBetween(aula.startTime, aula.endTime)
    totalDuracaoMinutos += duracaoMinutos

    const avaliacoes = aula.avaliacoes ?? []
    const completed: string[] = []

    if (avaliacoes.length > 0) {
      const respostasSnap = await getDocs(collection(db, 'turmas', turmaId, 'aulas', aula.id, 'respostas'))
      for (const r of respostasSnap.docs) {
        const answers = (r.data().answers ?? {}) as Record<string, string>
        const completou = avaliacoes.every((av) => (answers[av.id] ?? '').trim().length > 0)
        if (completou) completed.push(r.id)
      }
    }

    aulas.push({
      aulaId: aula.id,
      title: aula.title,
      date: aula.date,
      duracaoMinutos,
      totalAvaliacoes: avaliacoes.length,
      alunosConcluiram: completed.length,
      percentualConclusao: avaliacoes.length > 0 && totalAlunos > 0
        ? Math.round((completed.length / totalAlunos) * 100)
        : null,
      attendance: aula.attendance ?? {},
      completed,
    })
  }

  const totalPresencas = aulas.reduce((sum, a) => {
    return sum + students.filter((email) => {
      const s = a.attendance[email]
      return s === 'present' || s === 'late'
    }).length
  }, 0)
  const percentualPresenca = aulas.length > 0 && totalAlunos > 0
    ? Math.round((totalPresencas / (aulas.length * totalAlunos)) * 100)
    : null

  return {
    periodo: { from, to },
    students,
    studentNames,
    totalAlunos,
    totalAulas: aulas.length,
    totalDuracaoMinutos,
    percentualPresenca,
    aulas,
  }
}
