'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import { TECH_ICONS } from '@/lib/icons'
import {
  HiOutlineSun, HiOutlineMoon, HiArrowLeft,
  HiChevronLeft, HiChevronRight, HiCalendarDays,
  HiDocumentText, HiPencilSquare,
} from 'react-icons/hi2'
import type { Turma } from '@/types'

const MONTHS_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toCalendarDate(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2,'0')}01`
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export default function TurmaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { isDark, toggle } = useTheme()
  const { user } = useAuth()
  const [turma, setTurma] = useState<Turma | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/turmas/${id}`)
      .then((r) => r.json())
      .then((data: Turma) => {
        setTurma(data)
        setCurrentMonth(startOfMonth(parseLocalDate(data.startDate)))
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--c-bg)' }}>
        <p style={{ color: 'var(--c-subtle)' }}>Carregando...</p>
      </div>
    )
  }

  if (!turma) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--c-bg)' }}>
        <p style={{ color: 'var(--c-subtle)' }}>Turma não encontrada.</p>
      </div>
    )
  }

  const iconEntry = TECH_ICONS[turma.icon]
  const Icon = iconEntry?.icon
  const startMonth = startOfMonth(parseLocalDate(turma.startDate))
  const endMonth = startOfMonth(parseLocalDate(turma.endDate))
  const canPrev = !isSameMonth(currentMonth, startMonth)
  const canNext = !isSameMonth(currentMonth, endMonth)
  const totalMonths =
    (endMonth.getFullYear() - startMonth.getFullYear()) * 12 +
    (endMonth.getMonth() - startMonth.getMonth()) + 1
  const currentMonthIndex =
    (currentMonth.getFullYear() - startMonth.getFullYear()) * 12 +
    (currentMonth.getMonth() - startMonth.getMonth()) + 1

  const calendarSrc = turma.calendarId
    ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(turma.calendarId)}&ctz=America%2FSao_Paulo&mode=MONTH&showTitle=0&showNav=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0&dates=${toCalendarDate(currentMonth)}%2F${toCalendarDate(addMonths(currentMonth, 1))}`
    : null

  const isAdmin = user?.role === 'admin'

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--c-bg)' }}>

      {/* Top bar */}
      <header
        className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/admin/turmas"
            className="w-8 h-8 rounded-full flex items-center justify-center border"
            style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
          >
            <HiArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${turma.iconColor}20` }}>
                <Icon className="w-4 h-4" style={{ color: turma.iconColor }} />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--c-text)' }}>{turma.name}</p>
              <p className="text-xs" style={{ color: 'var(--c-subtle)' }}>
                {parseLocalDate(turma.startDate).toLocaleDateString('pt-BR')} → {parseLocalDate(turma.endDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href={`/dashboard/admin/turmas/${id}/editar`}
              className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors"
              style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
              title="Editar turma"
            >
              <HiPencilSquare className="w-4 h-4" />
            </Link>
          )}
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-full flex items-center justify-center border"
            style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
          >
            {isDark ? <HiOutlineSun className="w-4 h-4" /> : <HiOutlineMoon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Split layout */}
      <div className="relative flex flex-1 overflow-hidden">

        {/* Left — Content */}
        <div
          className="flex flex-col overflow-y-auto transition-all duration-300"
          style={{ width: calendarOpen ? '50%' : '100%', borderRight: calendarOpen ? `1px solid var(--c-border)` : 'none' }}
        >
          <div className="px-5 py-3 border-b flex items-center gap-2 flex-shrink-0" style={{ borderColor: 'var(--c-border)' }}>
            <HiDocumentText className="w-4 h-4" style={{ color: 'var(--c-subtle)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Conteúdo</span>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center flex flex-col items-center gap-3">
              <HiDocumentText className="w-10 h-10" style={{ color: 'var(--c-faint)' }} />
              <p className="font-semibold" style={{ color: 'var(--c-text)' }}>Conteúdo em breve</p>
              <p className="text-sm max-w-xs" style={{ color: 'var(--c-subtle)' }}>
                O visualizador de PDFs e apresentações será adicionado aqui.
              </p>
            </div>
          </div>
        </div>

        {/* Right — Calendar */}
        {calendarOpen && (
          <div className="flex flex-col overflow-hidden" style={{ width: '50%' }}>
            {/* Calendar header */}
            <div className="px-5 py-3 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: 'var(--c-border)' }}>
              <div className="flex items-center gap-2">
                <HiCalendarDays className="w-4 h-4" style={{ color: 'var(--c-subtle)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
                  {MONTHS_PT[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--c-border)', color: 'var(--c-subtle)' }}>
                  {currentMonthIndex}/{totalMonths}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
                  disabled={!canPrev}
                  className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
                  style={{ color: 'var(--c-muted)' }}
                >
                  <HiChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                  disabled={!canNext}
                  className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
                  style={{ color: 'var(--c-muted)' }}
                >
                  <HiChevronRight className="w-4 h-4" />
                </button>
                {/* Collapse button */}
                <button
                  onClick={() => setCalendarOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center ml-1 border transition-colors"
                  style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
                  title="Ocultar calendário"
                >
                  <HiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar iframe */}
            <div className="flex-1 overflow-hidden">
              {calendarSrc ? (
                <iframe
                  key={`${id}-${toCalendarDate(currentMonth)}`}
                  src={calendarSrc}
                  className="w-full h-full border-0"
                  title="Google Calendar"
                  style={{
                    filter: isDark ? 'invert(1) hue-rotate(180deg)' : 'none',
                    transition: 'filter 0.3s ease',
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="text-center flex flex-col items-center gap-3">
                    <HiCalendarDays className="w-10 h-10" style={{ color: 'var(--c-faint)' }} />
                    <p className="font-semibold" style={{ color: 'var(--c-text)' }}>Calendário não configurado</p>
                    <p className="text-sm max-w-xs" style={{ color: 'var(--c-subtle)' }}>
                      Adicione o ID do Google Calendar ao editar esta turma.
                    </p>
                    {isAdmin && (
                      <Link
                        href={`/dashboard/admin/turmas/${id}/editar`}
                        className="text-sm px-4 py-2 rounded-xl font-medium"
                        style={{ background: '#FFC530', color: '#1A0A3C' }}
                      >
                        Editar turma
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAB — reopen calendar */}
        {!calendarOpen && (
          <button
            onClick={() => setCalendarOpen(true)}
            className="absolute bottom-6 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            style={{ background: turma.iconColor, color: '#fff' }}
            title="Abrir calendário"
          >
            <HiCalendarDays className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  )
}
