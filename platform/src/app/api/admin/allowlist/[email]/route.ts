import { requireAdmin } from '@/lib/require-admin'
import { adminDb } from '@/lib/firebase-admin'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  const result = await requireAdmin()
  if (result instanceof Response) return result

  const { email } = await params
  const decoded = decodeURIComponent(email)

  await adminDb.collection('allowlist').doc(decoded).delete()
  return Response.json({ ok: true })
}
