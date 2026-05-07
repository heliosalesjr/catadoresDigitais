'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-helpers'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/context/ThemeContext'
import { HiOutlineSun, HiOutlineMoon, HiArrowRightOnRectangle } from 'react-icons/hi2'

const ROLE_TITLES: Record<string, string> = {
  admin: 'Painel Admin',
  teacher: 'Painel do Professor',
  student: 'Painel do Aluno',
}

const ROLE_HOME: Record<string, string> = {
  admin: '/dashboard/admin',
  teacher: '/dashboard/teacher',
  student: '/dashboard/student',
}

const LANDING_URL = process.env.NEXT_PUBLIC_LANDING_URL ?? '/'

interface Props {
  title?: string
}

function LogoMark({ isDark }: { isDark: boolean }) {
  const hexFill = isDark ? '#1A1230' : '#F0E8FF'
  return (
    <svg width="32" height="32" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="22,2 40,12 40,32 22,42 4,32 4,12"
        fill={hexFill}
        stroke="#FFC530"
        strokeWidth="2"
      />
      <path d="M14 22 Q22 14 30 22" stroke="#FFC530" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M17 25.5 Q22 20 27 25.5" stroke={isDark ? '#FF6B35' : '#B83E18'} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <circle cx="22" cy="29" r="2.4" fill="#FFC530" />
      <circle cx="34" cy="10" r="1.5" fill="#A855F7" />
      <circle cx="10" cy="10" r="1" fill="#06B6D4" />
    </svg>
  )
}

export function DashboardNavbar({ title: titleProp }: Props) {
  const { user } = useAuth()
  const { isDark, toggle } = useTheme()
  const router = useRouter()

  const role = user?.role ?? ''
  const roleTitle = titleProp ?? ROLE_TITLES[role] ?? 'Dashboard'
  const roleHome = ROLE_HOME[role] ?? '/dashboard'

  async function handleSignOut() {
    await signOut()
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/login')
  }

  return (
    <header
      className="flex-shrink-0 sticky top-0 z-10 flex items-center justify-between px-5 md:px-8 py-3 border-b"
      style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
    >
      {/* Left: logo + role title */}
      <div className="flex items-center gap-3 min-w-0">
        <a href={LANDING_URL} className="flex items-center gap-2.5 flex-shrink-0">
          <LogoMark isDark={isDark} />
          <div className="flex flex-col leading-none">
            <span
              className="logo-gradient font-extrabold tracking-tight leading-none text-lg"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Catadores
            </span>
            <span
              className="font-extrabold tracking-tight leading-none text-lg"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: 'var(--c-text)' }}
            >
              Digitais
            </span>
          </div>
        </a>

        <span className="w-px h-6 flex-shrink-0" style={{ background: 'var(--c-border-md)' }} />

        <a
          href={roleHome}
          className="text-sm font-semibold truncate transition-opacity hover:opacity-70"
          style={{ color: 'var(--c-subtle)' }}
        >
          {roleTitle}
        </a>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={toggle}
          aria-label="Alternar tema"
          className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors"
          style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
        >
          {isDark ? <HiOutlineSun className="w-4 h-4" /> : <HiOutlineMoon className="w-4 h-4" />}
        </button>

        {user?.photoURL && (
          <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full" />
        )}

        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium leading-tight" style={{ color: 'var(--c-text)' }}>
            {user?.name}
          </span>
          <span className="text-xs" style={{ color: 'var(--c-subtle)' }}>{user?.email}</span>
        </div>

        <button
          onClick={handleSignOut}
          className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors"
          style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
          title="Sair"
          aria-label="Sair"
        >
          <HiArrowRightOnRectangle className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
