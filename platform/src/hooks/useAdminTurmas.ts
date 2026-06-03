'use client'

import { useQuery } from '@tanstack/react-query'
import type { Turma } from '@/types'

export function useAdminTurmas(enabled = false) {
  return useQuery<Turma[]>({
    queryKey: ['admin', 'turmas'],
    queryFn: () => fetch('/api/admin/turmas').then((r) => r.json()),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
