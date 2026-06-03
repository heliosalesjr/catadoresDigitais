'use client'

import { useQuery } from '@tanstack/react-query'
import type { FrequenciaResult } from '@/app/api/student/frequencia/route'

export function useStudentFrequencia(enabled = true) {
  return useQuery<FrequenciaResult>({
    queryKey: ['student', 'frequencia'],
    queryFn: () => fetch('/api/student/frequencia').then((r) => r.json()),
    enabled,
  })
}
