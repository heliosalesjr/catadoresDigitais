'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-helpers'
import { useAuth } from '@/hooks/useAuth'

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Carregando...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Painel Admin</h1>
            <p className="text-gray-400 mt-1">Catadores Digitais</p>
          </div>
          <div className="flex items-center gap-4">
            {user?.photoURL && (
              <img src={user.photoURL} alt={user.name} className="w-9 h-9 rounded-full" />
            )}
            <span className="text-gray-300 text-sm">{user?.name}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sair
            </button>
          </div>
        </header>

        {/* Stat cards placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Alunos', value: '—' },
            { label: 'Professores', value: '—' },
            { label: 'Turmas ativas', value: '—' },
            { label: 'Inscrições pendentes', value: '—' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <p className="text-gray-400 text-sm">
            Painel em construção. Auth configurado com sucesso.
          </p>
        </div>
      </div>
    </main>
  )
}
