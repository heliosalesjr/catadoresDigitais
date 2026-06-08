'use client'

import { useQuery } from '@tanstack/react-query'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Nota } from '@/types'

export function useStudentLastNota(uid: string | null) {
  return useQuery<Nota | null>({
    queryKey: ['student', 'last-nota', uid],
    queryFn: async () => {
      if (!uid) return null
      const q = query(
        collection(db, 'users', uid, 'notas'),
        orderBy('updatedAt', 'desc'),
        limit(1)
      )
      const snap = await getDocs(q)
      if (snap.empty) return null
      const d = snap.docs[0]
      return { id: d.id, ...d.data() } as Nota
    },
    enabled: !!uid,
    staleTime: 2 * 60 * 1000,
  })
}
