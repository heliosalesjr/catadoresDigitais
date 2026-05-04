import { requireAdmin } from '@/lib/require-admin'
import { adminDb } from '@/lib/firebase-admin'

export async function GET() {
  const result = await requireAdmin()
  if (result instanceof Response) return result

  const snap = await adminDb.collection('users').orderBy('createdAt', 'desc').get()
  const users = snap.docs.map((doc) => doc.data())

  return Response.json(users)
}
