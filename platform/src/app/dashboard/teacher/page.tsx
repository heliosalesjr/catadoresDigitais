'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useTeacherTurmas } from '@/hooks/useTeacherTurmas'
import { useTeacherUpcomingAulas } from '@/hooks/useTeacherUpcomingAulas'
import { TECH_ICONS } from '@/lib/icons'
import {
  HiAcademicCap, HiUsers, HiCalendarDays, HiClock,
  HiChevronRight, HiArrowTopRightOnSquare,
} from 'react-icons/hi2'
import type { UpcomingAula } from '@/app/api/admin/upcoming-aulas/route'
import { parseLocalDate, formatDateLabel, getWeekISO } from '@/lib/date-utils'

function groupByDate(aulas: UpcomingAula[]): [string, UpcomingAula[]][] {
  const map = new Map<string, UpcomingAula[]>()
  for (const a of aulas) {
    ;(map.get(a.date) ?? map.set(a.date, []).get(a.date)!).push(a)
  }
  return Array.from(map.entries())
}

export default function TeacherDashboard() {
  const { user, loading: authLoading } = useAuth()

  const { data: turmas = [], isLoading: turmasQueryLoading } = useTeacherTurmas(!authLoading)
  const { data: upcomingAulas = [], isLoading: aulasQueryLoading } = useTeacherUpcomingAulas(!authLoading)

  const turmasLoading = authLoading || turmasQueryLoading
  const aulasLoading = authLoading || aulasQueryLoading

  const totalAlunos = new Set(turmas.flatMap((t) => t.students)).size
  const { mon, sun } = getWeekISO()
  const aulasThisWeek = upcomingAulas.filter((a) => a.date >= mon && a.date <= sun).length
  const grouped = groupByDate(upcomingAulas)

  const stats = [
    { label: 'Minhas turmas', value: turmas.length, icon: <HiAcademicCap className="w-5 h-5" />, loading: turmasLoading },
    { label: 'Alunos no total', value: totalAlunos, icon: <HiUsers className="w-5 h-5" />, loading: turmasLoading },
    { label: 'Aulas esta semana', value: aulasThisWeek, icon: <HiCalendarDays className="w-5 h-5" />, loading: aulasLoading },
    { label: 'Próximas aulas', value: upcomingAulas.length, icon: <HiClock className="w-5 h-5" />, loading: aulasLoading },
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
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>
            Olá, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--c-subtle)' }}>
            Veja o que está acontecendo nas suas turmas.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Minhas turmas */}
        <section>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--c-text)' }}>Minhas turmas</h2>

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
                Nenhuma turma associada
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--c-subtle)' }}>
                Peça ao administrador para te adicionar em uma turma.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {turmas.map((turma) => {
                const iconEntry = TECH_ICONS[turma.icon]
                const Icon = iconEntry?.icon
                const start = parseLocalDate(turma.startDate)
                const end = parseLocalDate(turma.endDate)
                const today = new Date(); today.setHours(0, 0, 0, 0)
                const hasEnded = today > end
                const hasStarted = today >= start
                const daysLeft = Math.max(0, Math.round((end.getTime() - today.getTime()) / 86400000))

                return (
                  <Link
                    key={turma.id}
                    href={`/dashboard/turmas/${turma.id}`}
                    className="rounded-2xl border p-5 flex flex-col gap-4 transition-opacity hover:opacity-75"
                    style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
                  >
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

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-subtle)' }}>
                        <HiUsers className="w-3.5 h-3.5" />
                        {turma.students.length} aluno{turma.students.length !== 1 ? 's' : ''}
                      </div>

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
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--c-text)' }}>
                            {aula.title}
                          </p>
                          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--c-subtle)' }}>
                            {aula.turmaName}
                          </p>
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
