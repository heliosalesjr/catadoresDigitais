import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from './firebase'
import type { Role, UserProfile } from '@/types'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL
const OPEN_SIGNUP = process.env.NEXT_PUBLIC_OPEN_SIGNUP === 'true'

async function resolveRole(email: string): Promise<Role> {
  if (email === ADMIN_EMAIL) return 'admin'

  const allowSnap = await getDoc(doc(db, 'allowlist', email))
  if (allowSnap.exists()) return allowSnap.data().role as Role

  if (OPEN_SIGNUP) return 'student'

  throw new Error('EMAIL_NOT_ALLOWED')
}

export async function signInWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider)
  const { uid, email, displayName, photoURL } = result.user

  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    let role: Role
    try {
      role = await resolveRole(email!)
    } catch (e) {
      await firebaseSignOut(auth)
      throw e
    }

    const profile: UserProfile = {
      uid,
      email: email!,
      name: displayName ?? email!,
      photoURL: photoURL,
      role,
      createdAt: new Date().toISOString(),
    }
    await setDoc(ref, profile)
    return profile
  }

  return snap.data() as UserProfile
}

export async function signOut() {
  await firebaseSignOut(auth)
}
