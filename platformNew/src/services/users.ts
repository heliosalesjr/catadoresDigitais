import {
  collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, where,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { isValidCPF } from '@/lib/utils'
import type { Role, UserProfile } from '@/types'

const ALLOWED_ROLES: Role[] = ['teacher', 'student']

export async function listUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => d.data() as UserProfile)
}

export async function updateUser(uid: string, body: { role?: Role; name?: string }): Promise<void> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Usuário não encontrado.')
  if (snap.data().role === 'admin') throw new Error('Não é possível alterar um admin.')

  const update: Record<string, string> = {}
  if (body.role !== undefined) {
    if (!ALLOWED_ROLES.includes(body.role)) throw new Error('Papel inválido.')
    update.role = body.role
  }
  if (body.name !== undefined) {
    const trimmed = body.name.trim()
    if (!trimmed) throw new Error('O nome não pode ficar vazio.')
    update.name = trimmed
  }
  if (Object.keys(update).length === 0) throw new Error('Nada para atualizar.')

  await updateDoc(ref, update)
}

/**
 * Remove o perfil do usuário no Firestore.
 * Sem Admin SDK não dá para excluir a conta no Firebase Auth — mas sem o doc
 * em `users` (e fora da allowlist) o usuário não consegue mais entrar.
 */
export async function deleteUser(uid: string): Promise<void> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Usuário não encontrado.')
  if (snap.data().role === 'admin') throw new Error('Não é possível excluir um admin.')
  await deleteDoc(ref)
}

export async function listTeachers(): Promise<{ uid: string; name: string; email: string }[]> {
  const snap = await getDocs(query(collection(db, 'users'), where('role', 'in', ['teacher', 'admin'])))
  return snap.docs.map((d) => ({
    uid: d.id,
    name: d.data().name as string,
    email: d.data().email as string,
  }))
}

/** Atualiza o perfil do próprio usuário (antes /api/users/me). */
export async function updateMe(body: { phone?: string; cpf?: string; birthDate?: string }): Promise<void> {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Não autenticado.')

  const update: Record<string, string> = {}

  if (body.phone !== undefined) {
    const digits = body.phone.replace(/\D/g, '')
    if (digits && (digits.length < 10 || digits.length > 11)) throw new Error('Telefone inválido.')
    update.phone = digits
  }
  if (body.cpf !== undefined) {
    const digits = body.cpf.replace(/\D/g, '')
    if (digits && !isValidCPF(digits)) throw new Error('CPF inválido.')
    update.cpf = digits
  }
  if (body.birthDate !== undefined) {
    if (body.birthDate && (!/^\d{4}-\d{2}-\d{2}$/.test(body.birthDate) || body.birthDate > new Date().toISOString().split('T')[0])) {
      throw new Error('Data de nascimento inválida.')
    }
    update.birthDate = body.birthDate
  }
  if (Object.keys(update).length === 0) throw new Error('Nada para atualizar.')

  await updateDoc(doc(db, 'users', uid), update)
}
