import { requireEditor } from '@/lib/require-editor'
import { adminDb } from '@/lib/firebase-admin'
import type { Turma } from '@/types'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const auth = await requireEditor()
  if (auth instanceof Response) return auth

  const { id } = await params
  const turmaSnap = await adminDb.collection('turmas').doc(id).get()
  if (!turmaSnap.exists) return Response.json({ error: 'Turma não encontrada.' }, { status: 404 })

  const turma = turmaSnap.data() as Omit<Turma, 'id'>
  const emails: string[] = turma.students ?? []

  const nameMap: Record<string, string> = {}
  for (let i = 0; i < emails.length; i += 30) {
    const chunk = emails.slice(i, i + 30)
    if (chunk.length === 0) continue
    const snap = await adminDb.collection('users').where('email', 'in', chunk).get()
    for (const doc of snap.docs) {
      const data = doc.data()
      if (data.email) nameMap[data.email] = data.name
    }
  }

  return Response.json(emails.map((email) => ({ email, name: nameMap[email] ?? null })))
}
