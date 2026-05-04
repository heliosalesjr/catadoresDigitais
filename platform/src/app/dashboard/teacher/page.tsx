'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-helpers'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/context/ThemeContext'
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2'

export default function TeacherDashboard() {
  const { user, loading } = useAuth()
  const { isDark, toggle } = useTheme()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--c-bg)' }}>
        <p style={{ color: 'var(--c-subtle)' }}>Carregando...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--c-text)' }}>Painel do Professor</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--c-subtle)' }}>Catadores Digitais</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              aria-label="Alternar tema"
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors duration-200"
              style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
            >
              {isDark ? <HiOutlineSun className="w-4 h-4" /> : <HiOutlineMoon className="w-4 h-4" />}
            </button>
            {user?.photoURL && (
              <img src={user.photoURL} alt={user.name} className="w-9 h-9 rounded-full" />
            )}
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{user?.name}</span>
              <span className="text-xs" style={{ color: 'var(--c-subtle)' }}>{user?.email}</span>
            </div>
            <button onClick={handleSignOut} className="text-sm transition-colors" style={{ color: 'var(--c-muted)' }}>
              Sair
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Minhas turmas', value: '—' },
            { label: 'Alunos ativos', value: '—' },
            { label: 'Aulas publicadas', value: '—' },
            { label: 'Pendências', value: '—' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-6 border" style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}>
              <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>{stat.label}</p>
              <p className="text-3xl font-bold mt-2" style={{ color: 'var(--c-text)' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-6 border" style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}>
          <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>Conteúdo do painel do professor em construção.</p>
        </div>
      </div>
    </main>
  )
}
