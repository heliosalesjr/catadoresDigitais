import { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireAuthAny } from '@/lib/require-auth-any'

type Ctx = { params: Promise<{ id: string; aulaId: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  const auth = await requireAuthAny()
  if (auth instanceof Response) return auth

  const { id, aulaId } = await params
  const body = await req.json()
  const { code } = body as { code: string }

  if (!code || typeof code !== 'string') {
    return Response.json({ error: 'Código inválido.' }, { status: 400 })
  }

  // Resolve student email from uid
  const userDoc = await adminDb.collection('users').doc(auth.uid).get()
  if (!userDoc.exists) {
    return Response.json({ error: 'Usuário não encontrado.' }, { status: 404 })
  }
  const email = userDoc.data()!.email as string

  // Validate enrollment
  const turmaDoc = await adminDb.collection('turmas').doc(id).get()
  if (!turmaDoc.exists) {
    return Response.json({ error: 'Turma não encontrada.' }, { status: 404 })
  }
  const turmaStudents: string[] = turmaDoc.data()!.students ?? []
  if (!turmaStudents.includes(email)) {
    return Response.json({ error: 'Você não está matriculado nesta turma.' }, { status: 403 })
  }

  // Get aula
  const aulaDoc = await adminDb
    .collection('turmas').doc(id)
    .collection('aulas').doc(aulaId)
    .get()
  if (!aulaDoc.exists) {
    return Response.json({ error: 'Aula não encontrada.' }, { status: 404 })
  }
  const aula = aulaDoc.data()!

  // Validate code
  if (!aula.attendanceCode || aula.attendanceCode !== code.trim()) {
    return Response.json({ error: 'Código incorreto.' }, { status: 400 })
  }

  // Validate time window (UTC-3 / America/Sao_Paulo)
  const aulaStart = new Date(`${aula.date}T${aula.startTime}:00-03:00`)
  const aulaEnd = new Date(`${aula.date}T${aula.endTime}:00-03:00`)
  const now = new Date()
  if (now < aulaStart || now > aulaEnd) {
    return Response.json({ error: 'Fora do horário da aula.' }, { status: 400 })
  }

  // Mark present
  const attendance = { ...(aula.attendance ?? {}), [email]: 'present' }
  await adminDb
    .collection('turmas').doc(id)
    .collection('aulas').doc(aulaId)
    .update({ attendance })

  return Response.json({ ok: true })
}
