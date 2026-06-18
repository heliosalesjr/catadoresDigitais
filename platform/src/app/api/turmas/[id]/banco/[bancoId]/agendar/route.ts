import { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireEditor } from '@/lib/require-editor'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; bancoId: string }> },
) {
  const auth = await requireEditor()
  if (auth instanceof Response) return auth

  const { id, bancoId } = await params
  const body = await req.json()

  if (!body.date || !body.startTime || !body.endTime) {
    return Response.json({ error: 'Data, início e fim são obrigatórios.' }, { status: 400 })
  }

  const turmaDoc = await adminDb.collection('turmas').doc(id).get()
  if (!turmaDoc.exists) return Response.json({ error: 'Turma não encontrada.' }, { status: 404 })

  const { startDate, endDate } = turmaDoc.data()!
  if (body.date < startDate || body.date > endDate) {
    return Response.json({ error: 'Data fora do período da turma.' }, { status: 400 })
  }

  const now = new Date()
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  if (body.date < todayISO) {
    return Response.json({ error: 'Não é possível agendar para uma data passada.' }, { status: 400 })
  }

  const bancoDoc = await adminDb.collection('turmas').doc(id).collection('banco').doc(bancoId).get()
  if (!bancoDoc.exists) return Response.json({ error: 'Aula do banco não encontrada.' }, { status: 404 })

  const banco = bancoDoc.data()!
  const attendanceCode = String(Math.floor(1000 + Math.random() * 9000))
  const status = auth.role === 'admin' ? 'published' : 'pending'

  const ref = await adminDb
    .collection('turmas').doc(id)
    .collection('aulas')
    .add({
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

  return Response.json({ id: ref.id }, { status: 201 })
}
