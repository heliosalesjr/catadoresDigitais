import { adminDb } from '@/lib/firebase-admin'
import { requireAuthAny } from '@/lib/require-auth-any'
import { isValidCPF } from '@/lib/utils'

export async function PATCH(req: Request) {
  const auth = await requireAuthAny()
  if (auth instanceof Response) return auth

  const body = await req.json() as { phone?: string; cpf?: string; birthDate?: string }
  const update: Record<string, string> = {}

  if (body.phone !== undefined) {
    const digits = body.phone.replace(/\D/g, '')
    if (digits && (digits.length < 10 || digits.length > 11)) {
      return Response.json({ error: 'Invalid phone' }, { status: 400 })
    }
    update.phone = digits
  }

  if (body.cpf !== undefined) {
    const digits = body.cpf.replace(/\D/g, '')
    if (digits && !isValidCPF(digits)) {
      return Response.json({ error: 'Invalid CPF' }, { status: 400 })
    }
    update.cpf = digits
  }

  if (body.birthDate !== undefined) {
    if (body.birthDate && (!/^\d{4}-\d{2}-\d{2}$/.test(body.birthDate) || body.birthDate > new Date().toISOString().split('T')[0])) {
      return Response.json({ error: 'Invalid birth date' }, { status: 400 })
    }
    update.birthDate = body.birthDate
  }

  if (Object.keys(update).length === 0) {
    return Response.json({ error: 'Nothing to update' }, { status: 400 })
  }

  await adminDb.collection('users').doc(auth.uid).update(update)
  return Response.json({ ok: true })
}
