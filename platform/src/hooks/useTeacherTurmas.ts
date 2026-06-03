'use client'

import { useQuery } from '@tanstack/react-query'
import type { Turma } from '@/types'

export function useTeacherTurmas(enabled = true) {
  return useQuery<Turma[]>({
    queryKey: ['teacher', 'turmas'],
    queryFn: () => fetch('/api/teacher/turmas').then((r) => r.json()),
    enabled,
  })
}
