'use client'

import { useQuery } from '@tanstack/react-query'
import type { Turma } from '@/types'

export function useStudentTurmas(enabled = true) {
  return useQuery<Turma[]>({
    queryKey: ['student', 'turmas'],
    queryFn: () => fetch('/api/student/turmas').then((r) => r.json()),
    enabled,
  })
}
