'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUsers } from '@/hooks/useUsers'
import { HiAcademicCap, HiChevronRight, HiCalendarDays, HiClock, HiTrash } from 'react-icons/hi2'
import Link from 'next/link'
import type { UserProfile } from '@/types'
import type { UpcomingAula } from '@/app/api/admin/upcoming-aulas/route'

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

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (date.getTime() === today.getTime()) return 'Hoje'
  if (date.getTime() === tomorrow.getTime()) return 'Amanhã'

  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}

function groupByDate(aulas: UpcomingAula[]): [string, UpcomingAula[]][] {
  const map = new Map<string, UpcomingAula[]>()
  for (const a of aulas) {
    const existing = map.get(a.date) ?? []
    existing.push(a)
    map.set(a.date, existing)
  }
  return Array.from(map.entries())
}

export default function AdminDashboard() {
  const { loading: authLoading } = useAuth()
  const { users, loading: usersLoading, updateRole, deleteUser } = useUsers()
  const [updating, setUpdating] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [upcomingAulas, setUpcomingAulas] = useState<UpcomingAula[]>([])
  const [aulasLoading, setAulasLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  useEffect(() => {
    fetch('/api/admin/upcoming-aulas')
      .then((r) => r.json())
      .then((data) => { setUpcomingAulas(data); setAulasLoading(false) })
      .catch(() => setAulasLoading(false))
  }, [])

  async function handleDelete(uid: string) {
    setDeleting(uid)
    await deleteUser(uid)
    setDeleting(null)
    setConfirmDelete(null)
  }

  async function handleRoleToggle(u: UserProfile) {
    setUpdating(u.uid)
    const next = u.role === 'teacher' ? 'student' : 'teacher'
    await updateRole(u.uid, next)
    setUpdating(null)
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-32">
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

  const grouped = groupByDate(upcomingAulas)

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const q = search.toLowerCase()
    const matchesSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    return matchesRole && matchesSearch
  })

  return (
    <main className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-6 border"
              style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
            >
              <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>{stat.label}</p>
              <p className="text-3xl font-bold mt-2" style={{ color: 'var(--c-text)' }}>
                {usersLoading ? '—' : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Próximas aulas */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}>
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--c-border)' }}>
            <HiCalendarDays className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--c-subtle)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--c-text)' }}>Próximas aulas</h2>
          </div>

          {aulasLoading ? (
            <div className="px-6 py-10 text-center text-sm" style={{ color: 'var(--c-subtle)' }}>
              Carregando...
            </div>
          ) : grouped.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm" style={{ color: 'var(--c-subtle)' }}>
              Nenhuma aula agendada.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--c-border)' }}>
              {grouped.map(([date, aulas]) => (
                <div key={date}>
                  {/* Date header */}
                  <div
                    className="px-6 py-2 text-xs font-semibold uppercase tracking-wider"
                    style={{ background: 'var(--c-bg)', color: 'var(--c-subtle)' }}
                  >
                    {formatDateLabel(date)}
                  </div>

                  {/* Aulas for this date */}
                  {aulas.map((aula) => (
                    <Link
                      key={aula.id}
                      href={`/dashboard/turmas/${aula.turmaId}`}
                      className="flex items-center gap-4 px-6 py-3.5 transition-opacity hover:opacity-75 border-t"
                      style={{ borderColor: 'var(--c-border)' }}
                    >
                      {/* Color accent */}
                      <div
                        className="w-1 h-10 rounded-full flex-shrink-0"
                        style={{ background: aula.turmaIconColor }}
                      />

                      {/* Title + turma + professor */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--c-text)' }}>
                          {aula.title}
                        </p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--c-subtle)' }}>
                          {aula.turmaName}
                          {aula.teachers?.length > 0 && (
                            <> · Prof: {aula.teachers.map((t) => t.name).join(', ')}</>
                          )}
                        </p>
                      </div>

                      {/* Time */}
                      {aula.startTime && (
                        <div className="flex items-center gap-1.5 flex-shrink-0 text-xs" style={{ color: 'var(--c-muted)' }}>
                          <HiClock className="w-3.5 h-3.5" />
                          <span>{aula.startTime}{aula.endTime ? ` – ${aula.endTime}` : ''}</span>
                        </div>
                      )}

                      <HiChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--c-faint)' }} />
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick access */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/admin/turmas"
            className="rounded-2xl border p-5 flex items-center justify-between transition-opacity hover:opacity-75"
            style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFC53018' }}>
                <HiAcademicCap className="w-5 h-5" style={{ color: '#FFC530' }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>Turmas</p>
                <p className="text-xs" style={{ color: 'var(--c-subtle)' }}>Criar e gerenciar turmas</p>
              </div>
            </div>
            <HiChevronRight className="w-4 h-4" style={{ color: 'var(--c-faint)' }} />
          </Link>
        </div>

        {/* Users list */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}>
          <div className="px-6 py-4 border-b flex flex-col gap-3" style={{ borderColor: 'var(--c-border)' }}>
            <div>
              <h2 className="font-semibold" style={{ color: 'var(--c-text)' }}>Usuários cadastrados</h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--c-subtle)' }}>
                Selecione um aluno para promovê-lo a professor.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="flex-1 rounded-xl px-3 py-2 text-sm border outline-none"
                style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl px-3 py-2 text-sm border outline-none"
                style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
              >
                <option value="all">Todos os perfis</option>
                <option value="student">Alunos</option>
                <option value="teacher">Professores</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          {usersLoading ? (
            <div className="px-6 py-10 text-center" style={{ color: 'var(--c-subtle)' }}>Carregando usuários...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-10 text-center" style={{ color: 'var(--c-subtle)' }}>
              {users.length === 0 ? 'Nenhum usuário cadastrado ainda.' : 'Nenhum usuário encontrado.'}
            </div>
          ) : (
            <ul>
              {filteredUsers.map((u, i) => (
                <li
                  key={u.uid}
                  className="flex items-center gap-4 px-6 py-4"
                  style={{ borderTop: i === 0 ? 'none' : `1px solid var(--c-border)` }}
                >
                  {u.photoURL ? (
                    <img src={u.photoURL} alt={u.name} className="w-9 h-9 rounded-full flex-shrink-0" />
                  ) : (
                    <div
                      className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
                      style={{ background: 'var(--c-border-md)', color: 'var(--c-text)' }}
                    >
                      {u.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--c-text)' }}>{u.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--c-subtle)' }}>{u.email}</p>
                  </div>

                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ color: ROLE_COLORS[u.role], background: `${ROLE_COLORS[u.role]}18` }}
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
                      {updating === u.uid ? '...' : u.role === 'teacher' ? 'Remover professor' : 'Tornar professor'}
                    </button>
                  )}

                  {u.role !== 'admin' && (
                    confirmDelete === u.uid ? (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleDelete(u.uid)}
                          disabled={deleting === u.uid}
                          className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50"
                          style={{ borderColor: '#ef4444', color: '#ef4444' }}
                        >
                          {deleting === u.uid ? '...' : 'Confirmar'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors"
                          style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(u.uid)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors flex-shrink-0"
                        style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-faint)' }}
                        title="Deletar usuário"
                      >
                        <HiTrash className="w-3.5 h-3.5" />
                      </button>
                    )
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
