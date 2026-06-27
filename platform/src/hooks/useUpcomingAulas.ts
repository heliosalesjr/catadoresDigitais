'use client'

import { useQuery } from '@tanstack/react-query'
import type { UpcomingAula } from '@/app/api/admin/upcoming-aulas/route'

type Role = 'student' | 'teacher' | 'admin'

export function useUpcomingAulas(role: Role, enabled = true) {
  return useQuery<UpcomingAula[]>({
    queryKey: [role, 'upcoming-aulas'],
    queryFn: () => fetch(`/api/${role}/upcoming-aulas`).then((r) => r.json()),
    enabled,
  })
}
