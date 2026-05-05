import { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireEditor } from '@/lib/require-editor'
import { requireAuthAny } from '@/lib/require-auth-any'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuthAny()
  if (auth instanceof Response) return auth

  const { id } = await params

  try {
    const snap = await adminDb
      .collection('turmas').doc(id)
      .collection('aulas')
      .orderBy('date')
      .get()

    const aulas = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }))
      .sort((a, b) =>
        (`${a.date}T${a.startTime}` as string).localeCompare(
          `${b.date}T${b.startTime}` as string
        )
      )

    return Response.json(aulas)
  } catch (err) {
    console.error('[GET aulas]', err)
    return Response.json({ error: 'Erro ao buscar aulas.' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireEditor()
  if (auth instanceof Response) return auth

  const { id } = await params
  const body = await req.json()

  if (!body.title?.trim() || !body.date || !body.startTime || !body.endTime) {
    return Response.json({ error: 'Título, data, início e fim são obrigatórios.' }, { status: 400 })
  }

  const turmaDoc = await adminDb.collection('turmas').doc(id).get()
  if (!turmaDoc.exists) return Response.json({ error: 'Turma não encontrada.' }, { status: 404 })

  const { startDate, endDate } = turmaDoc.data()!
  if (body.date < startDate || body.date > endDate) {
    return Response.json({ error: 'Data fora do período da turma.' }, { status: 400 })
  }

  const ref = await adminDb
    .collection('turmas').doc(id)
    .collection('aulas')
    .add({
      title: body.title.trim(),
      description: body.description?.trim() ?? '',
      teachers: body.teachers ?? [],
      driveLinks: body.driveLinks ?? [],
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      attendance: {},
      createdAt: new Date().toISOString(),
    })

  return Response.json({ id: ref.id }, { status: 201 })
}
