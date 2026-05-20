import { requireAdmin } from '@/lib/require-admin'
import { adminDb } from '@/lib/firebase-admin'
import type { Role } from '@/types'

const ALLOWED_ROLES: Role[] = ['student', 'teacher']

export async function GET() {
  const result = await requireAdmin()
  if (result instanceof Response) return result

  const snap = await adminDb.collection('allowlist').orderBy('createdAt', 'desc').get()
  return Response.json(snap.docs.map((d) => d.data()))
}

export async function POST(req: Request) {
  const result = await requireAdmin()
  if (result instanceof Response) return result

  const { email, role } = await req.json() as { email: string; role: Role }

  if (!email || !ALLOWED_ROLES.includes(role)) {
    return Response.json({ error: 'Invalid input' }, { status: 400 })
  }

  const normalized = email.trim().toLowerCase()

  await adminDb.collection('allowlist').doc(normalized).set({
    email: normalized,
    role,
    createdAt: new Date().toISOString(),
  })

  return Response.json({ ok: true })
}
