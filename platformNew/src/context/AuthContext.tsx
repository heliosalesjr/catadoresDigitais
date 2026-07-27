import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { UserProfile } from '@/types'

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  refetch: () => Promise<void>
  updateLocal: (patch: Partial<UserProfile>) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refetch: async () => {},
  updateLocal: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    const uid = auth.currentUser?.uid
    if (!uid) return
    const snap = await getDoc(doc(db, 'users', uid))
    setUser(snap.exists() ? (snap.data() as UserProfile) : null)
  }, [])

  const updateLocal = useCallback((patch: Partial<UserProfile>) => {
    setUser((prev) => prev ? { ...prev, ...patch } : prev)
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setLoading(false)
        return
      }
      try {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
        setUser(snap.exists() ? (snap.data() as UserProfile) : null)
      } catch (e) {
        // Perfil ilegível (emulador fora do ar, rules, rede): não pode travar
        // o app num spinner — trata como deslogado e deixa o /login assumir.
        console.error('[auth] falha ao carregar perfil', e)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })
    return unsub
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refetch, updateLocal }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
