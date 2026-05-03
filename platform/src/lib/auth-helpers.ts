import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from './firebase'
import type { Role, UserProfile } from '@/types'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

function resolveRole(email: string): Role {
  if (email === ADMIN_EMAIL) return 'admin'
  return 'student'
}

export async function signInWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider)
  const { uid, email, displayName, photoURL } = result.user

  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    const profile: UserProfile = {
      uid,
      email: email!,
      name: displayName ?? email!,
      photoURL: photoURL,
      role: resolveRole(email!),
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
