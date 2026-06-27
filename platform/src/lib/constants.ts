import { HiLink, HiPencilSquare, HiListBullet } from 'react-icons/hi2'
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

export const AVALIACAO_ICON = {
  link: HiLink,
  text: HiPencilSquare,
  quiz: HiListBullet,
} as const

export const AVALIACAO_LABEL = {
  link: 'Link',
  text: 'Texto',
  quiz: 'Quiz',
} as const
