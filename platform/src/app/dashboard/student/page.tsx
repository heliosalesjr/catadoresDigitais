'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { TECH_ICONS } from '@/lib/icons'
import {
  HiCalendarDays, HiClock,
  HiChevronRight, HiArrowTopRightOnSquare,
} from 'react-icons/hi2'
import type { Turma } from '@/types'
import type { UpcomingAula } from '@/app/api/admin/upcoming-aulas/route'

function parseLocalDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (date.getTime() === today.getTime()) return 'Hoje'
  if (date.getTime() === tomorrow.getTime()) return 'Amanhã'
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}

function getWeekISO(): { mon: string; sun: string } {
  const today = new Date()
  const dow = today.getDay()
  const mon = new Date(today); mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { mon: fmt(mon), sun: fmt(sun) }
}

function groupByDate(aulas: UpcomingAula[]): [string, UpcomingAula[]][] {
  const map = new Map<string, UpcomingAula[]>()
  for (const a of aulas) {
    ;(map.get(a.date) ?? map.set(a.date, []).get(a.date)!).push(a)
  }
  return Array.from(map.entries())
}

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [turmasLoading, setTurmasLoading] = useState(true)
  const [upcomingAulas, setUpcomingAulas] = useState<UpcomingAula[]>([])
  const [aulasLoading, setAulasLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const [turmasRes, aulasRes] = await Promise.all([
      fetch('/api/student/turmas'),
      fetch('/api/student/upcoming-aulas'),
    ])
    if (turmasRes.ok) setTurmas(await turmasRes.json())
    if (aulasRes.ok) setUpcomingAulas(await aulasRes.json())
    setTurmasLoading(false)
    setAulasLoading(false)
  }, [])

  useEffect(() => { if (!authLoading) fetchData() }, [authLoading, fetchData])

  const { mon, sun } = getWeekISO()
  const todayISO = new Date().toISOString().split('T')[0]
  const aulasThisWeek = upcomingAulas.filter((a) => a.date >= mon && a.date <= sun).length
  const upcoming = upcomingAulas.filter((a) => a.date >= todayISO)
  const grouped = groupByDate(upcoming)

  const stats = [
    { label: 'Aulas esta semana', value: aulasThisWeek, icon: <HiCalendarDays className="w-5 h-5" />, loading: aulasLoading },
    { label: 'Próximas aulas', value: upcoming.length, icon: <HiClock className="w-5 h-5" />, loading: aulasLoading },
  ]

  if (authLoading) {
    return (
      <main className="p-6 md:p-8 flex items-center justify-center min-h-[50vh]">
        <p style={{ color: 'var(--c-subtle)' }}>Carregando...</p>
      </main>
    )
  }

  return (
    <main className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>
            Olá, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--c-subtle)' }}>
            Acompanhe suas turmas e próximas aulas.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-5 border flex flex-col gap-3"
              style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--c-border)', color: 'var(--c-subtle)' }}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--c-subtle)' }}>{s.label}</p>
                <p className="text-3xl font-bold mt-0.5" style={{ color: 'var(--c-text)' }}>
                  {s.loading ? '—' : s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Minha turma */}
        <section>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--c-text)' }}>Minha turma</h2>

          {turmasLoading ? (
            <div
              className="rounded-2xl border px-6 py-10 text-center text-sm"
              style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)', color: 'var(--c-subtle)' }}
            >
              Carregando...
            </div>
          ) : turmas.length === 0 ? (
            <div
              className="rounded-2xl border px-6 py-10 text-center"
              style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
            >
              <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>
                Você ainda não está em nenhuma turma
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--c-subtle)' }}>
                Peça ao administrador para te matricular.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {turmas.map((turma) => {
                const iconEntry = TECH_ICONS[turma.icon]
                const Icon = iconEntry?.icon
                const start = parseLocalDate(turma.startDate)
                const end = parseLocalDate(turma.endDate)
                const today = new Date(); today.setHours(0, 0, 0, 0)
                const hasEnded = today > end
                const hasStarted = today >= start
                const daysLeft = Math.max(0, Math.round((end.getTime() - today.getTime()) / 86400000))
                const totalMs = end.getTime() - start.getTime()
                const elapsedMs = Math.min(Math.max(today.getTime() - start.getTime(), 0), totalMs)
                const progress = totalMs > 0 ? Math.round((elapsedMs / totalMs) * 100) : 0

                return (
                  <Link
                    key={turma.id}
                    href={`/dashboard/turmas/${turma.id}`}
                    className="rounded-2xl border p-5 flex flex-col gap-4 transition-opacity hover:opacity-75"
                    style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${turma.iconColor}20` }}
                      >
                        {Icon && <Icon className="w-5 h-5" style={{ color: turma.iconColor }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-snug" style={{ color: 'var(--c-text)' }}>
                          {turma.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--c-subtle)' }}>
                          {start.toLocaleDateString('pt-BR')} → {end.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <HiArrowTopRightOnSquare
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: 'var(--c-faint)' }}
                      />
                    </div>

                    {/* Progress */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--c-subtle)' }}>
                          {hasEnded ? 'Curso concluído' : !hasStarted ? 'Ainda não iniciado' : `${progress}% concluído`}
                        </span>
                        {hasEnded ? (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--c-border)', color: 'var(--c-subtle)' }}
                          >
                            Encerrada
                          </span>
                        ) : !hasStarted ? (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: `${turma.iconColor}18`, color: turma.iconColor }}
                          >
                            Em breve
                          </span>
                        ) : (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: `${turma.iconColor}18`, color: turma.iconColor }}
                          >
                            {daysLeft === 0 ? 'Último dia' : `${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restantes`}
                          </span>
                        )}
                      </div>
                      <div
                        className="w-full h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'var(--c-border)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${progress}%`, background: hasEnded ? 'var(--c-subtle)' : turma.iconColor }}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Próximas aulas */}
        <section>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--c-text)' }}>Próximas aulas</h2>

          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
          >
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
                          <div
                            className="flex items-center gap-1.5 flex-shrink-0 text-xs"
                            style={{ color: 'var(--c-muted)' }}
                          >
                            <HiClock className="w-3.5 h-3.5" />
                            {aula.startTime}{aula.endTime ? ` – ${aula.endTime}` : ''}
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
        </section>

      </div>
    </main>
  )
}
