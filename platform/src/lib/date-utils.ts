export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function dateToISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function todayISO(): string {
  return dateToISO(new Date())
}

export function getWeekISO(): { mon: string; sun: string } {
  const today = new Date()
  const dow = today.getDay()
  const mon = new Date(today)
  mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  return { mon: dateToISO(mon), sun: dateToISO(sun) }
}

export function formatDateLabel(iso: string): string {
  const date = parseLocalDate(iso)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (date.getTime() === today.getTime()) return 'Hoje'
  if (date.getTime() === tomorrow.getTime()) return 'Amanhã'
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}

export function fmtDate(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fmtDateShort(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function fmtFullDate(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })
}
