import type { UpcomingAula } from '@/app/api/admin/upcoming-aulas/route'

export function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function groupByDate(aulas: UpcomingAula[]): [string, UpcomingAula[]][] {
  const map = new Map<string, UpcomingAula[]>()
  for (const a of aulas) {
    ;(map.get(a.date) ?? map.set(a.date, []).get(a.date)!).push(a)
  }
  return Array.from(map.entries())
}
