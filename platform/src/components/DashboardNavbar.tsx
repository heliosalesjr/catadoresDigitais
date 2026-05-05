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

interface Props {
  title?: string
}

export function DashboardNavbar({ title: titleProp }: Props) {
  const { user } = useAuth()
  const { isDark, toggle } = useTheme()
  const router = useRouter()

  const title = titleProp ?? ROLE_TITLES[user?.role ?? ''] ?? 'Dashboard'

  async function handleSignOut() {
    await signOut()
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/login')
  }

  return (
    <header
      className="flex-shrink-0 sticky top-0 z-10 flex items-center justify-between px-6 md:px-8 py-4 border-b"
      style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
    >
      <div>
        <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--c-text)' }}>
          {title}
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--c-subtle)' }}>Catadores Digitais</p>
      </div>

      <div className="flex items-center gap-3">
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
