import type { UpcomingAula } from '@/types'

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

export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false

  for (const len of [9, 10]) {
    let sum = 0
    for (let i = 0; i < len; i++) sum += Number(digits[i]) * (len + 1 - i)
    const check = ((sum * 10) % 11) % 10
    if (check !== Number(digits[len])) return false
  }
  return true
}

export function formatCPF(digits: string): string {
  return digits
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function formatPhone(digits: string): string {
  const d = digits.slice(0, 11)
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
}
