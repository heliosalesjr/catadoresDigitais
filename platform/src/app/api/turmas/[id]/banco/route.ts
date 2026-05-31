import { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireEditor } from '@/lib/require-editor'
import type { BancoAula } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireEditor()
  if (auth instanceof Response) return auth

  const { id } = await params

  try {
    const snap = await adminDb
      .collection('turmas').doc(id)
      .collection('banco')
      .orderBy('createdAt')
      .get()

    const banco = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BancoAula, 'id'>) }))
    return Response.json(banco)
  } catch (err) {
    console.error('[GET banco]', err)
    return Response.json({ error: 'Erro ao buscar banco de aulas.' }, { status: 500 })
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

  if (!body.title?.trim()) {
    return Response.json({ error: 'O título é obrigatório.' }, { status: 400 })
  }

  const turmaDoc = await adminDb.collection('turmas').doc(id).get()
  if (!turmaDoc.exists) return Response.json({ error: 'Turma não encontrada.' }, { status: 404 })

  let teachers = body.teachers ?? []
  if (auth.role === 'teacher') {
    const userDoc = await adminDb.collection('users').doc(auth.uid).get()
    const userData = userDoc.data()
    if (userData && !teachers.find((t: { uid: string }) => t.uid === auth.uid)) {
      teachers = [{ uid: auth.uid, name: userData.name }, ...teachers]
    }
  }

  const ref = await adminDb
    .collection('turmas').doc(id)
    .collection('banco')
    .add({
      title: body.title.trim(),
      description: body.description?.trim() ?? '',
      teachers,
      driveLinks: body.driveLinks ?? [],
      avaliacoes: body.avaliacoes ?? [],
      createdBy: auth.uid,
      createdAt: new Date().toISOString(),
    })

  return Response.json({ id: ref.id }, { status: 201 })
}
