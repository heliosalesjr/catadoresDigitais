import { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireAuthAny } from '@/lib/require-auth-any'
import { requireEditor } from '@/lib/require-editor'

type Ctx = { params: Promise<{ id: string; aulaId: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAuthAny()
  if (auth instanceof Response) return auth

  const { id, aulaId } = await params
  const respostasRef = adminDb
    .collection('turmas').doc(id)
    .collection('aulas').doc(aulaId)
    .collection('respostas')

  // teachers / admins get all responses
  const editorCheck = await requireEditor()
  if (!(editorCheck instanceof Response)) {
    const snap = await respostasRef.get()
    return Response.json(snap.docs.map((d) => d.data()))
  }

  // students get only their own
  const userSnap = await adminDb.collection('users').doc(auth.uid).get()
  const email = userSnap.data()?.email as string | undefined
  if (!email) return Response.json(null)

  const doc = await respostasRef.doc(email).get()
  return Response.json(doc.exists ? doc.data() : null)
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const auth = await requireAuthAny()
  if (auth instanceof Response) return auth

  const { id, aulaId } = await params
  const { answers } = await req.json() as { answers: Record<string, string> }

  const userSnap = await adminDb.collection('users').doc(auth.uid).get()
  const userData = userSnap.data()
  const email = userData?.email as string | undefined
  if (!email) return Response.json({ error: 'User not found' }, { status: 404 })

  await adminDb
    .collection('turmas').doc(id)
    .collection('aulas').doc(aulaId)
    .collection('respostas').doc(email)
    .set({
      studentEmail: email,
      studentName: userData?.name ?? email,
      answers,
      submittedAt: new Date().toISOString(),
    })

  return Response.json({ ok: true })
}
