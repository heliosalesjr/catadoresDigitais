import { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireAuthAny } from '@/lib/require-auth-any'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuthAny()
  if (auth instanceof Response) return auth

  const { id } = await params
  const snap = await adminDb.collection('turmas').doc(id).get()
  if (!snap.exists) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ id: snap.id, ...snap.data() })
}
