'use client'

import { useQuery } from '@tanstack/react-query'
import type { UpcomingAula } from '@/app/api/admin/upcoming-aulas/route'

export function useAdminUpcomingAulas() {
  return useQuery<UpcomingAula[]>({
    queryKey: ['admin', 'upcoming-aulas'],
    queryFn: () => fetch('/api/admin/upcoming-aulas').then((r) => r.json()),
  })
}
