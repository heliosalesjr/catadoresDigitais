'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import { TECH_ICONS } from '@/lib/icons'
import {
  HiOutlineSun, HiOutlineMoon, HiArrowLeft,
  HiChevronLeft, HiChevronRight, HiChevronDown,
  HiCalendarDays, HiDocumentText, HiPencilSquare,
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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

const ease = [0.32, 0.72, 0, 1] as const
const CALENDAR_MOBILE_H = 400

export default function TurmaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { isDark, toggle } = useTheme()
  const { user } = useAuth()
  const [turma, setTurma] = useState<Turma | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = useState(true)
  const isMobile = useIsMobile()

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
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          style={{ color: 'var(--c-subtle)' }}
        >
          Carregando...
        </motion.p>
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
    <motion.div
      className="flex flex-col h-screen"
      style={{ background: 'var(--c-bg)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease }}
    >
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-4 md:px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard/admin/turmas"
            className="w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0"
            style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
          >
            <HiArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${turma.iconColor}20` }}
              >
                <Icon className="w-4 h-4" style={{ color: turma.iconColor }} />
              </div>
            )}
            <div className="min-w-0">
              <p
                className="text-sm font-semibold leading-tight truncate"
                style={{ color: 'var(--c-text)' }}
              >
                {turma.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--c-subtle)' }}>
                {parseLocalDate(turma.startDate).toLocaleDateString('pt-BR')} → {parseLocalDate(turma.endDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
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

      {/* Main — flex-col on mobile, flex-row on desktop */}
      <div className="relative flex flex-1 overflow-hidden flex-col md:flex-row">

        {/* Content panel — always visible, expands as calendar closes */}
        <div
          className="flex flex-col overflow-y-auto flex-1 min-w-0 min-h-0"
          style={{
            borderRight: !isMobile && calendarOpen ? `1px solid var(--c-border)` : 'none',
            borderBottom: isMobile && calendarOpen ? `1px solid var(--c-border)` : 'none',
          }}
        >
          <div
            className="px-5 py-3 border-b flex items-center gap-2 flex-shrink-0"
            style={{ borderColor: 'var(--c-border)' }}
          >
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

        {/* Calendar panel — animated width (desktop) or height (mobile) */}
        <motion.div
          initial={false}
          animate={
            calendarOpen
              ? isMobile
                ? { height: CALENDAR_MOBILE_H, opacity: 1 }
                : { width: '50%', opacity: 1 }
              : isMobile
                ? { height: 0, opacity: 0 }
                : { width: 0, opacity: 0 }
          }
          transition={{ duration: 0.5, ease }}
          className="flex flex-col overflow-hidden flex-shrink-0"
          style={isMobile ? { width: '100%' } : { height: '100%' }}
        >
          {/* Calendar header */}
          <div
            className="px-5 py-3 border-b flex items-center justify-between flex-shrink-0"
            style={{ borderColor: 'var(--c-border)' }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <HiCalendarDays className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--c-subtle)' }} />
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${currentMonth.getMonth()}-${currentMonth.getFullYear()}`}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.22, ease }}
                  className="text-sm font-medium whitespace-nowrap"
                  style={{ color: 'var(--c-text)' }}
                >
                  {MONTHS_PT[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </motion.span>
              </AnimatePresence>
              <span
                className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: 'var(--c-border)', color: 'var(--c-subtle)' }}
              >
                {currentMonthIndex}/{totalMonths}
              </span>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <motion.button
                onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
                disabled={!canPrev}
                className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
                style={{ color: 'var(--c-muted)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <HiChevronLeft className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                disabled={!canNext}
                className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
                style={{ color: 'var(--c-muted)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <HiChevronRight className="w-4 h-4" />
              </motion.button>

              {/* Collapse button */}
              <motion.button
                onClick={() => setCalendarOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center ml-1 border"
                style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
                title="Ocultar calendário"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                {isMobile
                  ? <HiChevronDown className="w-4 h-4" />
                  : <HiChevronRight className="w-4 h-4" />
                }
              </motion.button>
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
                  transition: 'filter 0.35s ease',
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
        </motion.div>

        {/* FAB — open calendar */}
        <AnimatePresence>
          {!calendarOpen && (
            <motion.button
              key="fab"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setCalendarOpen(true)}
              className="absolute bottom-6 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
              style={{ background: turma.iconColor, color: '#fff' }}
              title="Abrir calendário"
            >
              <HiCalendarDays className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
