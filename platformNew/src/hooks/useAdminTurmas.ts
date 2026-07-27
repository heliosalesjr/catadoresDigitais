import { useQuery } from '@tanstack/react-query'
import { listTurmasAdmin } from '@/services/turmas'
import type { Turma } from '@/types'

export function useAdminTurmas(enabled = false) {
  return useQuery<Turma[]>({
    queryKey: ['admin', 'turmas'],
    queryFn: listTurmasAdmin,
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
