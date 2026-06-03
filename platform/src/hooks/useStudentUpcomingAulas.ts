'use client'

import { useQuery } from '@tanstack/react-query'
import type { UpcomingAula } from '@/app/api/admin/upcoming-aulas/route'

export function useStudentUpcomingAulas(enabled = true) {
  return useQuery<UpcomingAula[]>({
    queryKey: ['student', 'upcoming-aulas'],
    queryFn: () => fetch('/api/student/upcoming-aulas').then((r) => r.json()),
    enabled,
  })
}
