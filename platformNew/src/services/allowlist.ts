import {
  collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { AllowlistEntry, Role } from '@/types'

const ALLOWED_ROLES: Role[] = ['student', 'teacher']

export async function listAllowlist(): Promise<AllowlistEntry[]> {
  const snap = await getDocs(query(collection(db, 'allowlist'), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => d.data() as AllowlistEntry)
}

export async function addToAllowlist(data: { email: string; role: Role; turmaId: string }): Promise<void> {
  const { email, role, turmaId } = data
  if (!email || !ALLOWED_ROLES.includes(role) || !turmaId) throw new Error('Dados inválidos.')

  const turmaSnap = await getDoc(doc(db, 'turmas', turmaId))
  if (!turmaSnap.exists()) throw new Error('Turma não encontrada')

  const normalized = email.trim().toLowerCase()
  await setDoc(doc(db, 'allowlist', normalized), {
    email: normalized,
    role,
    turmaId,
    createdAt: new Date().toISOString(),
  })
}

export async function removeFromAllowlist(email: string): Promise<void> {
  await deleteDoc(doc(db, 'allowlist', email))
}
