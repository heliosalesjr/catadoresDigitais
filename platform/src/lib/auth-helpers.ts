import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from './firebase'
import type { Role, UserProfile } from '@/types'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL
const OPEN_SIGNUP = process.env.NEXT_PUBLIC_OPEN_SIGNUP === 'true'

async function resolveAccess(email: string): Promise<{ role: Role; turmaId?: string }> {
  if (email === ADMIN_EMAIL) return { role: 'admin' }

  const allowSnap = await getDoc(doc(db, 'allowlist', email))
  if (allowSnap.exists()) {
    const data = allowSnap.data()
    return { role: data.role as Role, turmaId: data.turmaId as string | undefined }
  }

  if (OPEN_SIGNUP) return { role: 'student' }

  throw new Error('EMAIL_NOT_ALLOWED')
}

export async function signInWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider)
  const { uid, email, displayName, photoURL } = result.user

  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    let access: { role: Role; turmaId?: string }
    try {
      access = await resolveAccess(email!)
    } catch (e) {
      await firebaseSignOut(auth)
      throw e
    }

    const profile: UserProfile = {
      uid,
      email: email!,
      name: displayName ?? email!,
      photoURL: photoURL,
      role: access.role,
      createdAt: new Date().toISOString(),
    }
    await setDoc(ref, profile)

    if (access.turmaId) {
      const idToken = await result.user.getIdToken()
      await fetch('/api/auth/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, turmaId: access.turmaId }),
      })
    }

    return profile
  }

  return snap.data() as UserProfile
}

export async function signOut() {
  await firebaseSignOut(auth)
}
