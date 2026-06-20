import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { TurmaTeacher } from '@/types'

export async function POST(req: Request) {
  const { idToken, turmaId } = await req.json() as { idToken: string; turmaId: string }

  if (!idToken || !turmaId) {
    return Response.json({ error: 'Invalid input' }, { status: 400 })
  }

  let decoded
  try {
    decoded = await adminAuth.verifyIdToken(idToken)
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userSnap = await adminDb.collection('users').doc(decoded.uid).get()
  const user = userSnap.data()
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  const turmaRef = adminDb.collection('turmas').doc(turmaId)
  const turmaSnap = await turmaRef.get()
  if (!turmaSnap.exists) {
    return Response.json({ error: 'Turma not found' }, { status: 404 })
  }

  if (user.role === 'teacher') {
    const professor: TurmaTeacher = { uid: user.uid, name: user.name, email: user.email }
    await turmaRef.update({ professors: FieldValue.arrayUnion(professor) })
  } else {
    await turmaRef.update({ students: FieldValue.arrayUnion(user.email) })
  }

  return Response.json({ ok: true })
}
