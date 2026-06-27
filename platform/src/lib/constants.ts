import type { Role } from '@/types'

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  teacher: 'Professor',
  student: 'Aluno',
}

export const ROLE_COLORS: Record<Role, string> = {
  admin: 'var(--c-gold)',
  teacher: 'var(--c-purple)',
  student: 'var(--c-info)',
}

export const ROLE_BG_COLORS: Record<Role, string> = {
  admin: 'var(--c-gold-soft)',
  teacher: 'var(--c-purple-soft)',
  student: 'var(--c-info-soft)',
}
