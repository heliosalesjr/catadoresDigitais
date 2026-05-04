'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-helpers'
import { useAuth } from '@/hooks/useAuth'
import { useUsers } from '@/hooks/useUsers'
import { useTheme } from '@/context/ThemeContext'
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2'
import type { UserProfile } from '@/types'

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  teacher: 'Professor',
  student: 'Aluno',
}

const ROLE_COLORS: Record<string, string> = {
  admin: '#FFC530',
  teacher: '#A855F7',
  student: '#06B6D4',
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const { users, loading: usersLoading, updateRole } = useUsers()
  const { isDark, toggle } = useTheme()
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)

  async function handleSignOut() {
    await signOut()
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/login')
  }

  async function handleRoleToggle(u: UserProfile) {
    setUpdating(u.uid)
    const next = u.role === 'teacher' ? 'student' : 'teacher'
    await updateRole(u.uid, next)
    setUpdating(null)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--c-bg)' }}>
        <p style={{ color: 'var(--c-subtle)' }}>Carregando...</p>
      </div>
    )
  }

  const stats = [
    { label: 'Alunos', value: users.filter((u) => u.role === 'student').length },
    { label: 'Professores', value: users.filter((u) => u.role === 'teacher').length },
    { label: 'Total de usuários', value: users.length },
    { label: 'Admins', value: users.filter((u) => u.role === 'admin').length },
  ]

  return (
    <main className="min-h-screen p-8" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--c-text)' }}>Painel Admin</h1>
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

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl p-6 border" style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}>
              <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>{stat.label}</p>
              <p className="text-3xl font-bold mt-2" style={{ color: 'var(--c-text)' }}>
                {usersLoading ? '—' : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Users list */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--c-text)' }}>Usuários cadastrados</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--c-subtle)' }}>
              Selecione um aluno para promovê-lo a professor.
            </p>
          </div>

          {usersLoading ? (
            <div className="px-6 py-10 text-center" style={{ color: 'var(--c-subtle)' }}>Carregando usuários...</div>
          ) : users.length === 0 ? (
            <div className="px-6 py-10 text-center" style={{ color: 'var(--c-subtle)' }}>Nenhum usuário cadastrado ainda.</div>
          ) : (
            <ul>
              {users.map((u, i) => (
                <li
                  key={u.uid}
                  className="flex items-center gap-4 px-6 py-4"
                  style={{
                    borderTop: i === 0 ? 'none' : `1px solid var(--c-border)`,
                  }}
                >
                  {u.photoURL ? (
                    <img src={u.photoURL} alt={u.name} className="w-9 h-9 rounded-full flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
                      style={{ background: 'var(--c-border-md)', color: 'var(--c-text)' }}>
                      {u.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--c-text)' }}>{u.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--c-subtle)' }}>{u.email}</p>
                  </div>

                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      color: ROLE_COLORS[u.role],
                      background: `${ROLE_COLORS[u.role]}18`,
                    }}
                  >
                    {ROLE_LABEL[u.role]}
                  </span>

                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleRoleToggle(u)}
                      disabled={updating === u.uid}
                      className="text-xs px-3 py-1.5 rounded-lg border transition-colors flex-shrink-0 disabled:opacity-50"
                      style={{
                        borderColor: u.role === 'teacher' ? 'var(--c-border-md)' : '#A855F7',
                        color: u.role === 'teacher' ? 'var(--c-muted)' : '#A855F7',
                      }}
                    >
                      {updating === u.uid
                        ? '...'
                        : u.role === 'teacher'
                        ? 'Remover professor'
                        : 'Tornar professor'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
