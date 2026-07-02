'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/context/ThemeContext'
import { useStudentTurmas } from '@/hooks/useStudentTurmas'
import { useUpcomingAulas } from '@/hooks/useUpcomingAulas'
import { useStudentFrequencia } from '@/hooks/useStudentFrequencia'
import { useStudentLastNota } from '@/hooks/useStudentLastNota'
import { TECH_ICONS } from '@/lib/icons'
import {
  HiCalendarDays, HiClock, HiChartBar,
  HiChevronRight, HiArrowTopRightOnSquare, HiExclamationTriangle, HiBolt,
  HiArrowPath, HiChatBubbleLeftRight, HiMoon,
} from 'react-icons/hi2'
import type { UpcomingAula } from '@/app/api/admin/upcoming-aulas/route'
import { parseLocalDate, formatDateLabel, getWeekISO, todayISO } from '@/lib/date-utils'
import { groupByDate } from '@/lib/utils'

const TIPS = [
  {
    Icon: HiArrowPath,
    headline: 'Revise em intervalos',
    body: 'Reveja o conteúdo 1 dia, 3 dias e 7 dias depois. Seu cérebro fixa muito mais com repetição espaçada.',
    from: '#6366F1',
    to: '#8B5CF6',
  },
  {
    Icon: HiChatBubbleLeftRight,
    headline: 'Ensine o que aprendeu',
    body: 'Explicar em voz alta como se ensinasse outra pessoa é a forma mais rápida de descobrir o que ainda não entendeu.',
    from: '#F97316',
    to: '#EC4899',
  },
  {
    Icon: HiMoon,
    headline: 'Durma para aprender',
    body: 'O sono consolida a memória. Estudar antes de dormir e revisar pela manhã é uma das estratégias mais eficazes.',
    from: '#10B981',
    to: '#06B6D4',
  },
]

const ease = [0.32, 0.72, 0, 1] as const

function Sk({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`sk rounded ${className}`}
      style={style}
    />
  )
}

function isAulaActiveNow(aula: UpcomingAula): boolean {
  if (!aula.startTime || !aula.endTime) return false
  const [y, m, d] = aula.date.split('-').map(Number)
  const [sh, sm] = aula.startTime.split(':').map(Number)
  const [eh, em] = aula.endTime.split(':').map(Number)
  const now = new Date()
  return now >= new Date(y, m - 1, d, sh, sm) && now <= new Date(y, m - 1, d, eh, em)
}

export default function StudentDashboard() {
  const { isDark } = useTheme()
  const { user, loading: authLoading } = useAuth()

  const { data: turmas = [], isLoading: turmasQueryLoading } = useStudentTurmas(!authLoading)
  const { data: upcomingAulas = [], isLoading: aulasQueryLoading } = useUpcomingAulas('student', !authLoading)
  const { data: frequencia, isLoading: frequenciaQueryLoading } = useStudentFrequencia(!authLoading)
  const { data: lastNota } = useStudentLastNota(!authLoading && !!user ? user.uid : null)

  const turmaId = turmas[0]?.id ?? null

  const turmasLoading = authLoading || turmasQueryLoading
  const aulasLoading = authLoading || aulasQueryLoading
  const frequenciaLoading = authLoading || frequenciaQueryLoading

  const { mon, sun } = getWeekISO()
  const today = todayISO()
  const aulasThisWeek = upcomingAulas.filter((a) => a.date >= mon && a.date <= sun).length
  const upcoming = upcomingAulas.filter((a) => a.date >= today)
  const grouped = groupByDate(upcoming)
  const activeAula = upcomingAulas.find(isAulaActiveNow) ?? null
  const [hoveredTip, setHoveredTip] = useState<number | null>(null)

  const freqPct = frequencia?.percentage ?? null
  const freqLow = freqPct !== null && freqPct < 85

  const stats = [
    { label: 'Aulas esta semana', value: aulasThisWeek, icon: <HiCalendarDays className="w-5 h-5" />, loading: aulasLoading },
    { label: 'Próximas aulas', value: upcoming.length, icon: <HiClock className="w-5 h-5" />, loading: aulasLoading },
  ]

  return (
    <main className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">

        {/* Greeting */}
        <div>
          {authLoading ? (
            <div className="flex flex-col gap-2">
              <Sk className="h-7 w-48" />
              <Sk className="h-4 w-60 mt-1" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>
                Olá, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--c-subtle)' }}>
                Acompanhe suas turmas e próximas aulas.
              </p>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                  {s.loading
                    ? <Sk className="h-8 w-14 mt-0.5" />
                    : <p className="text-3xl font-bold mt-0.5" style={{ color: 'var(--c-text)' }}>{s.value}</p>
                  }
                </div>
              </div>
            ))}

            {/* Frequência */}
            <div
              className="rounded-2xl p-5 border flex flex-col gap-3"
              style={{ background: 'var(--c-bg-alt)', borderColor: freqLow ? 'var(--c-warning-strong)' : 'var(--c-border)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--c-border)', color: 'var(--c-subtle)' }}
              >
                <HiChartBar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--c-subtle)' }}>Frequência</p>
                {frequenciaLoading
                  ? <Sk className="h-8 w-14 mt-0.5" />
                  : (
                    <>
                      <p
                        className="text-3xl font-bold mt-0.5"
                        style={{ color: freqPct === null ? 'var(--c-text)' : freqLow ? 'var(--c-warning)' : 'var(--c-success)' }}
                      >
                        {freqPct === null ? '—' : `${freqPct}%`}
                      </p>
                      {freqPct === null && (
                        <p className="text-xs mt-1" style={{ color: 'var(--c-faint)' }}>Nenhuma aula realizada.</p>
                      )}
                    </>
                  )
                }
              </div>
            </div>
          </div>

          {/* Aviso de frequência baixa */}
          {freqLow && (
            <div
              className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
              style={{ background: 'var(--c-warning-soft)', border: '1px solid var(--c-warning-strong)' }}
            >
              <HiExclamationTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--c-warning)' }} />
              <p className="text-sm leading-snug" style={{ color: 'var(--c-warning)' }}>
                Sua frequência está abaixo de 85%. Entre em contato com seu professor ou com a coordenação.
              </p>
            </div>
          )}
        </div>

        {/* Aula ativa agora */}
        {!aulasLoading && activeAula && (() => {
          const userEmail = user?.email ?? ''
          const status = activeAula.attendance?.[userEmail]
          const alreadyPresent = status === 'present' || status === 'late'
          return (
            <Link
              href={`/dashboard/aula/${activeAula.turmaId}/${activeAula.id}`}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-opacity hover:opacity-85"
              style={{ background: `${activeAula.turmaIconColor}12`, borderColor: `${activeAula.turmaIconColor}50` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: activeAula.turmaIconColor, color: '#fff' }}
              >
                <HiBolt className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: 'var(--c-text)' }}>Aula em andamento</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--c-subtle)' }}>
                  {activeAula.title} · {activeAula.startTime} – {activeAula.endTime}
                </p>
              </div>
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0"
                style={{ background: activeAula.turmaIconColor, color: '#fff' }}
              >
                {alreadyPresent ? 'Acesse a aula' : 'Registrar presença'}
              </span>
            </Link>
          )
        })()}

        {/* Minha turma */}
        <section>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--c-text)' }}>Minha turma</h2>

          {turmasLoading ? (
            <div
              className="rounded-2xl border p-5 flex flex-col gap-4"
              style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
            >
              <div className="flex items-start gap-3">
                <Sk className="w-10 h-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <Sk className="h-4 w-40" />
                  <Sk className="h-3 w-32" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <Sk className="h-3 w-24" />
                  <Sk className="h-4 w-20 rounded-full" />
                </div>
                <Sk className="w-full h-1.5 rounded-full" />
              </div>
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
              <>
                <div className="px-6 py-3" style={{ background: 'var(--c-bg)' }}>
                  <Sk className="h-3 w-12" />
                </div>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-6 py-3.5 border-t"
                    style={{ borderColor: 'var(--c-border)' }}
                  >
                    <Sk className="rounded-full flex-shrink-0" style={{ width: 4, height: 40 }} />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <Sk className="h-4 w-40" />
                        <Sk className="h-4 w-14 rounded-full flex-shrink-0" />
                      </div>
                      <Sk className="h-3 w-28" />
                    </div>
                    <Sk className="h-3 w-12 flex-shrink-0" />
                  </div>
                ))}
              </>
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
                        href={`/dashboard/aula/${aula.turmaId}/${aula.id}`}
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

        {/* Última anotação */}
        {!authLoading && user && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold" style={{ color: 'var(--c-text)' }}>Última anotação</h2>
              {turmaId && (
                <Link
                  href={`/dashboard/turmas/${turmaId}?tab=anotacoes`}
                  className="text-xs transition-opacity hover:opacity-75"
                  style={{ color: 'var(--c-subtle)' }}
                >
                  Ver todas →
                </Link>
              )}
            </div>

            <div
              className="rounded-2xl border p-5"
              style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
            >
              {!lastNota ? (
                <div className="text-center py-2">
                  <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>
                    Nenhuma anotação ainda
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--c-subtle)' }}>
                    Acesse sua turma e crie suas primeiras anotações.
                  </p>
                  {turmaId && (
                    <Link
                      href={`/dashboard/turmas/${turmaId}?tab=anotacoes`}
                      className="inline-block mt-3 text-xs px-4 py-2 rounded-xl font-semibold transition-opacity hover:opacity-75"
                      style={{ background: 'var(--c-border)', color: 'var(--c-text)' }}
                    >
                      Ir para a turma
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--c-text)' }}>
                      {lastNota.title || 'Sem título'}
                    </p>
                    <span className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: 'var(--c-faint)' }}>
                      {new Date(lastNota.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  {lastNota.content && (
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--c-subtle)' }}>
                      {lastNota.content.replace(/[#*_`>\n]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)}
                      {lastNota.content.length > 120 ? '…' : ''}
                    </p>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {/* Dicas para aprender */}
        <section>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--c-text)' }}>Dicas para aprender mais</h2>
          <div className="flex flex-col md:flex-row gap-4">
            {TIPS.map((tip, i) => {
              const TipIcon = tip.Icon
              const isActive = hoveredTip === i
              const isInactive = hoveredTip !== null && hoveredTip !== i
              return (
                <motion.div
                  key={i}
                  onHoverStart={() => setHoveredTip(i)}
                  onHoverEnd={() => setHoveredTip(null)}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0, flexGrow: isActive ? 1.6 : isInactive ? 0.7 : 1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.38, ease }}
                  className="rounded-2xl p-6 flex flex-col gap-4 cursor-default select-none relative overflow-hidden"
                  style={{
                    flexBasis: 0,
                    flexShrink: 1,
                    minWidth: 0,
                    background: `linear-gradient(135deg, ${tip.from}, ${tip.to})`,
                    boxShadow: `0 8px 32px ${tip.from}${isDark ? '28' : '40'}`,
                  }}
                >
                  {isDark && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: 'rgba(0,0,0,0.28)', zIndex: -1 }}
                    />
                  )}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(255,255,255,0.18)',
                      border: '1px solid rgba(255,255,255,0.32)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.25)',
                    }}
                  >
                    <TipIcon className="w-6 h-6" style={{ color: '#fff' }} />
                  </div>
                  <motion.p
                    animate={{ fontSize: isActive ? '1.25rem' : isInactive ? '0.875rem' : '1.125rem' }}
                    transition={{ duration: 0.38, ease }}
                    className="font-bold leading-snug"
                    style={{ color: '#fff' }}
                  >
                    {tip.headline}
                  </motion.p>
                  <motion.p
                    animate={{ fontSize: isActive ? '0.9rem' : isInactive ? '0.7rem' : '0.875rem' }}
                    transition={{ duration: 0.38, ease }}
                    className="leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.82)' }}
                  >
                    {tip.body}
                  </motion.p>
                </motion.div>
              )
            })}
          </div>
        </section>

      </div>
    </main>
  )
}
