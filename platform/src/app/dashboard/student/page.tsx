'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-helpers'
import { useAuth } from '@/hooks/useAuth'

export default function StudentDashboard() {
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
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Meu Painel</h1>
            <p className="text-gray-400 mt-1">Catadores Digitais</p>
          </div>
          <div className="flex items-center gap-4">
            {user?.photoURL && (
              <img src={user.photoURL} alt={user.name} className="w-9 h-9 rounded-full" />
            )}
            <div className="flex flex-col items-end">
              <span className="text-white text-sm font-medium">{user?.name}</span>
              <span className="text-gray-500 text-xs">{user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sair
            </button>
          </div>
        </header>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <p className="text-gray-400 text-sm">Conteúdo dos cursos em breve.</p>
        </div>
      </div>
    </main>
  )
}
