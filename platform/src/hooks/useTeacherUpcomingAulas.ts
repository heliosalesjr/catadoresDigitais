'use client'

import { useQuery } from '@tanstack/react-query'
import type { UpcomingAula } from '@/app/api/admin/upcoming-aulas/route'

export function useTeacherUpcomingAulas(enabled = true) {
  return useQuery<UpcomingAula[]>({
    queryKey: ['teacher', 'upcoming-aulas'],
    queryFn: () => fetch('/api/teacher/upcoming-aulas').then((r) => r.json()),
    enabled,
  })
}
