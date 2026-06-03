'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUsers } from '@/hooks/useUsers'
import { useAdminUpcomingAulas } from '@/hooks/useAdminUpcomingAulas'
import { useAdminAllowlist } from '@/hooks/useAdminAllowlist'
import { useAdminTurmas } from '@/hooks/useAdminTurmas'
import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { HiAcademicCap, HiChevronRight, HiCalendarDays, HiClock, HiTrash, HiShieldCheck, HiPlus } from 'react-icons/hi2'
import Link from 'next/link'
import type { UserProfile, Turma } from '@/types'
import type { UpcomingAula } from '@/app/api/admin/upcoming-aulas/route'
import { UserListModal, type CardFilter } from '@/components/UserListModal'
import { UserDetailPanel } from '@/components/UserDetailPanel'

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
  const queryClient = useQueryClient()

  const { users, loading: usersLoading, updateRole, deleteUser } = useUsers()
  const { data: upcomingAulas = [], isLoading: aulasLoading } = useAdminUpcomingAulas()
  const {
    allowlist,
    allowlistLoading,
    addToAllowlist,
    addingToAllowlist,
    removeFromAllowlist,
    removingFromAllowlist,
  } = useAdminAllowlist()

  const [turmasEnabled, setTurmasEnabled] = useState(false)
  const { data: turmas = [], isLoading: turmasLoading } = useAdminTurmas(turmasEnabled)

  const [detailUser, setDetailUser] = useState<UserProfile | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [activeCard, setActiveCard] = useState<CardFilter | null>(null)
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<'student' | 'teacher'>('student')

  function openCard(filter: CardFilter) {
    setActiveCard(filter)
    setTurmasEnabled(true)
  }

  async function handleAddToAllowlist(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail.trim()) return
    await addToAllowlist({ email: newEmail.trim().toLowerCase(), role: newRole })
    setNewEmail('')
  }

  async function handleAddToTurma(turmaId: string, studentEmail: string) {
    const currentTurmas = queryClient.getQueryData<Turma[]>(['admin', 'turmas']) ?? []
    const turma = currentTurmas.find((t) => t.id === turmaId)
    if (!turma || turma.students?.includes(studentEmail)) return
    const updatedStudents = [...(turma.students ?? []), studentEmail]
    const res = await fetch(`/api/admin/turmas/${turmaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: updatedStudents }),
    })
    if (res.ok) {
      queryClient.setQueryData<Turma[]>(['admin', 'turmas'], (prev) =>
        prev?.map((t) => t.id === turmaId ? { ...t, students: updatedStudents } : t) ?? []
      )
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p style={{ color: 'var(--c-subtle)' }}>Carregando...</p>
      </div>
    )
  }

  const stats: { label: string; value: number; filter: CardFilter }[] = [
    { label: 'Alunos', value: users.filter((u) => u.role === 'student').length, filter: 'student' },
    { label: 'Professores', value: users.filter((u) => u.role === 'teacher').length, filter: 'teacher' },
    { label: 'Total de usuários', value: users.length, filter: 'all' },
    { label: 'Admins', value: users.filter((u) => u.role === 'admin').length, filter: 'admin' },
  ]

  const pendingAulas = upcomingAulas.filter((a) => a.status === 'pending')
  const publishedAulas = upcomingAulas.filter((a) => a.status !== 'pending')
  const grouped = groupByDate(publishedAulas)

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const q = search.toLowerCase()
    const matchesSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    return matchesRole && matchesSearch
  })

  const hasFilter = search.trim() !== '' || roleFilter !== 'all'
  const PAGE_SIZE = 10
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE)
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <main className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <button
              key={stat.label}
              onClick={() => !usersLoading && openCard(stat.filter)}
              disabled={usersLoading}
              className="rounded-2xl p-6 border text-left transition-opacity hover:opacity-75 disabled:cursor-default group"
              style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
            >
              <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>{stat.label}</p>
              <p className="text-3xl font-bold mt-2" style={{ color: 'var(--c-text)' }}>
                {usersLoading ? '—' : stat.value}
              </p>
              {!usersLoading && (
                <p className="text-[11px] mt-2" style={{ color: 'var(--c-faint)' }}>
                  Ver lista →
                </p>
              )}
            </button>
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
          ) : pendingAulas.length === 0 && grouped.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm" style={{ color: 'var(--c-subtle)' }}>
              Nenhuma aula agendada.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--c-border)' }}>

              {pendingAulas.length > 0 && (
                <div>
                  <div
                    className="px-6 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
                    style={{ background: '#f59e0b12', color: '#f59e0b' }}
                  >
                    Aguardando aprovação · {pendingAulas.length}
                  </div>
                  {pendingAulas.map((aula) => (
                    <Link
                      key={aula.id}
                      href={`/dashboard/turmas/${aula.turmaId}`}
                      className="flex items-center gap-4 px-6 py-3.5 transition-opacity hover:opacity-75 border-t"
                      style={{ borderColor: '#f59e0b22' }}
                    >
                      <div
                        className="w-1 h-10 rounded-full flex-shrink-0"
                        style={{ background: aula.turmaIconColor, opacity: 0.5 }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--c-text)' }}>
                            {aula.title}
                          </p>
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: `${aula.turmaIconColor}22`, color: aula.turmaIconColor }}
                          >
                            {aula.turmaName}
                          </span>
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: '#f59e0b18', color: '#f59e0b' }}
                          >
                            Pendente
                          </span>
                        </div>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--c-subtle)' }}>
                          {formatDateLabel(aula.date)}
                          {aula.teachers?.length > 0 && (
                            <> · Prof: {aula.teachers.map((t) => t.name).join(', ')}</>
                          )}
                        </p>
                      </div>
                      {aula.startTime && (
                        <div className="flex items-center gap-1.5 flex-shrink-0 text-xs" style={{ color: 'var(--c-muted)' }}>
                          <HiClock className="w-3.5 h-3.5" />
                          {aula.startTime}{aula.endTime ? ` – ${aula.endTime}` : ''}
                        </div>
                      )}
                      <HiChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#f59e0b88' }} />
                    </Link>
                  ))}
                </div>
              )}

              {grouped.map(([date, aulas]) => (
                <div key={date}>
                  <div
                    className="px-6 py-2 text-xs font-semibold uppercase tracking-wider"
                    style={{ background: 'var(--c-bg)', color: 'var(--c-subtle)' }}
                  >
                    {formatDateLabel(date)}
                  </div>

                  {aulas.map((aula) => (
                    <Link
                      key={aula.id}
                      href={`/dashboard/turmas/${aula.turmaId}`}
                      className="flex items-center gap-4 px-6 py-3.5 transition-opacity hover:opacity-75 border-t"
                      style={{ borderColor: 'var(--c-border)' }}
                    >
                      <div
                        className="w-1 h-10 rounded-full flex-shrink-0"
                        style={{ background: aula.turmaIconColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--c-text)' }}>
                            {aula.title}
                          </p>
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: `${aula.turmaIconColor}22`, color: aula.turmaIconColor }}
                          >
                            {aula.turmaName}
                          </span>
                        </div>
                        {aula.teachers?.length > 0 && (
                          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--c-subtle)' }}>
                            Prof: {aula.teachers.map((t) => t.name).join(', ')}
                          </p>
                        )}
                      </div>
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

        {/* Allowlist */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}>
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--c-border)' }}>
            <HiShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--c-subtle)' }} />
            <div className="flex-1">
              <h2 className="font-semibold" style={{ color: 'var(--c-text)' }}>Lista de acesso</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--c-subtle)' }}>
                Emails pré-autorizados. Quando o signup estiver fechado, apenas estes emails poderão entrar.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddToAllowlist} className="px-6 py-4 flex gap-2 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="email@exemplo.com"
              required
              className="flex-1 rounded-xl px-3 py-2 text-sm border outline-none"
              style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'student' | 'teacher')}
              className="rounded-xl px-3 py-2 text-sm border outline-none"
              style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
            >
              <option value="student">Aluno</option>
              <option value="teacher">Professor</option>
            </select>
            <button
              type="submit"
              disabled={addingToAllowlist}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
              style={{ background: '#FFC530', color: '#06030F' }}
            >
              <HiPlus className="w-4 h-4" />
              {addingToAllowlist ? '...' : 'Adicionar'}
            </button>
          </form>

          {allowlistLoading ? (
            <div className="px-6 py-8 text-center text-sm" style={{ color: 'var(--c-subtle)' }}>Carregando...</div>
          ) : allowlist.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm" style={{ color: 'var(--c-subtle)' }}>Nenhum email na lista ainda.</div>
          ) : (
            <ul>
              {allowlist.map((entry, i) => (
                <li
                  key={entry.email}
                  className="flex items-center gap-4 px-6 py-3.5"
                  style={{ borderTop: i === 0 ? 'none' : `1px solid var(--c-border)` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: 'var(--c-text)' }}>{entry.email}</p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      color: entry.role === 'teacher' ? '#A855F7' : '#06B6D4',
                      background: entry.role === 'teacher' ? '#A855F718' : '#06B6D418',
                    }}
                  >
                    {entry.role === 'teacher' ? 'Professor' : 'Aluno'}
                  </span>
                  <button
                    onClick={() => removeFromAllowlist(entry.email)}
                    disabled={removingFromAllowlist === entry.email}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors flex-shrink-0 disabled:opacity-50"
                    style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-faint)' }}
                    title="Remover da lista"
                  >
                    {removingFromAllowlist === entry.email ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <HiTrash className="w-3.5 h-3.5" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Users list */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}>
          <div className="px-6 py-4 border-b flex flex-col gap-3" style={{ borderColor: 'var(--c-border)' }}>
            <div>
              <h2 className="font-semibold" style={{ color: 'var(--c-text)' }}>Usuários cadastrados</h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--c-subtle)' }}>
                Adicione alunos a turmas existentes.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Buscar por nome ou e-mail..."
                className="flex-1 rounded-xl px-3 py-2 text-sm border outline-none"
                style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
              />
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
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
          ) : !hasFilter ? (
            <div className="px-6 py-10 text-center text-sm" style={{ color: 'var(--c-subtle)' }}>
              Use a busca ou selecione um perfil para ver usuários.
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm" style={{ color: 'var(--c-subtle)' }}>
              Nenhum usuário encontrado.
            </div>
          ) : (
            <>
            <ul>
              {paginatedUsers.map((u, i) => (
                <li
                  key={u.uid}
                  onClick={() => { setDetailUser(u); setTurmasEnabled(true) }}
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer transition-opacity hover:opacity-75"
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
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t" style={{ borderColor: 'var(--c-border)' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-30"
                  style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
                >
                  Anterior
                </button>
                <span className="text-xs" style={{ color: 'var(--c-subtle)' }}>
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-30"
                  style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
                >
                  Próxima
                </button>
              </div>
            )}
            </>
          )}
        </div>

      </div>

      <AnimatePresence>
        {activeCard && (
          <UserListModal
            filter={activeCard}
            users={users}
            turmas={turmas}
            turmasLoading={turmasLoading}
            onClose={() => setActiveCard(null)}
          />
        )}
        {detailUser && (
          <UserDetailPanel
            key={detailUser.uid}
            user={detailUser}
            turmas={turmas}
            turmasLoading={turmasLoading}
            onClose={() => setDetailUser(null)}
            onRoleUpdate={updateRole}
            onDelete={deleteUser}
            onAddToTurma={handleAddToTurma}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
