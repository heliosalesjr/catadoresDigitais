import { adminDb } from '@/lib/firebase-admin'
import { requireAuthAny } from '@/lib/require-auth-any'

export async function GET() {
  const auth = await requireAuthAny()
  if (auth instanceof Response) return auth

  const snap = await adminDb
    .collection('users')
    .where('role', 'in', ['teacher', 'admin'])
    .get()

  return Response.json(
    snap.docs.map((d) => ({
      uid: d.id,
      name: d.data().name as string,
      email: d.data().email as string,
    }))
  )
}
