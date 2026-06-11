'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiCalendarDays, HiChevronLeft, HiChevronRight, HiChevronDown, HiPlus,
} from 'react-icons/hi2'
import type { Turma, Aula } from '@/types'
import { AulaModal } from './AulaModal'

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const DAYS_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const ease = [0.32, 0.72, 0, 1] as const

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function getDaysInGrid(month: Date): (Date | null)[] {
  const first = startOfMonth(month)
  const dow = first.getDay()
  const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = Array(dow).fill(null)
  for (let d = 1; d <= total; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d))
  while (cells.length < 42) cells.push(null)
  return cells
}

interface Props {
  turma: Turma
  aulas: Aula[]
  canEdit: boolean
  isAdmin: boolean
  currentUserUid: string
  currentUserEmail?: string
  isMobile: boolean
  onCollapse: () => void
  onRefresh: () => void
  onMonthChange: (month: Date) => void
}

export function CalendarGrid({ turma, aulas, canEdit, isAdmin, currentUserUid, currentUserEmail, isMobile, onCollapse, onRefresh, onMonthChange }: Props) {
  const startMonth = startOfMonth(parseLocalDate(turma.startDate))
  const endMonth = startOfMonth(parseLocalDate(turma.endDate))
  const totalMonths =
    (endMonth.getFullYear() - startMonth.getFullYear()) * 12 +
    (endMonth.getMonth() - startMonth.getMonth()) + 1

  const initialMonth = (() => {
    const today = new Date()
    const current = new Date(today.getFullYear(), today.getMonth(), 1)
    if (current < startMonth) return startMonth
    if (current > endMonth) return endMonth
    return current
  })()

  const [currentMonth, setCurrentMonth] = useState<Date>(initialMonth)

  useEffect(() => { onMonthChange(initialMonth) }, [])
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedAula, setSelectedAula] = useState<Aula | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [monthDir, setMonthDir] = useState<1 | -1>(1)

  const currentMonthIndex =
    (currentMonth.getFullYear() - startMonth.getFullYear()) * 12 +
    (currentMonth.getMonth() - startMonth.getMonth()) + 1

  const canPrev = !isSameMonth(currentMonth, startMonth)
  const canNext = !isSameMonth(currentMonth, endMonth)

  // Group aulas by date
  const aulasByDate = aulas.reduce<Record<string, Aula[]>>((acc, a) => {
    ;(acc[a.date] ??= []).push(a)
    return acc
  }, {})

  function prevMonth() {
    const next = addMonths(currentMonth, -1)
    setMonthDir(-1)
    setCurrentMonth(next)
    onMonthChange(next)
  }

  function nextMonth() {
    const next = addMonths(currentMonth, 1)
    setMonthDir(1)
    setCurrentMonth(next)
    onMonthChange(next)
  }

  function openModal(day: string, aula: Aula | null) {
    setSelectedDay(day)
    setSelectedAula(aula)
    setModalOpen(true)
  }

  function handleDayClick(day: Date) {
    const iso = toISO(day)
    const dayAulas = aulasByDate[iso] ?? []
    if (dayAulas.length > 0) {
      openModal(iso, dayAulas[0])
    } else if (canEdit) {
      openModal(iso, null)
    }
  }

  const today = toISO(new Date())
  const days = getDaysInGrid(currentMonth)

  return (
    <>
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0"
        style={{ borderColor: 'var(--c-border)' }}
      >
        <div className="flex items-center gap-2">
          <HiCalendarDays className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--c-subtle)' }} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${currentMonth.getMonth()}-${currentMonth.getFullYear()}`}
              initial={{ opacity: 0, y: monthDir * -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: monthDir * 6 }}
              transition={{ duration: 0.2, ease }}
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

        <div className="flex items-center gap-1">
          {canEdit && (
            <motion.button
              onClick={() => openModal(today >= turma.startDate && today <= turma.endDate ? today : turma.startDate, null)}
              className="w-7 h-7 rounded-lg flex items-center justify-center border mr-1"
              style={{ borderColor: turma.iconColor, color: turma.iconColor }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Nova aula"
            >
              <HiPlus className="w-4 h-4" />
            </motion.button>
          )}
          <motion.button
            onClick={prevMonth}
            disabled={!canPrev}
            className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
            style={{ color: 'var(--c-muted)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <HiChevronLeft className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={nextMonth}
            disabled={!canNext}
            className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
            style={{ color: 'var(--c-muted)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <HiChevronRight className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={onCollapse}
            className="w-7 h-7 rounded-lg flex items-center justify-center ml-1 border"
            style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Ocultar calendário"
          >
            {isMobile ? <HiChevronDown className="w-4 h-4" /> : <HiChevronRight className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS_SHORT.map((d, i) => (
            <div
              key={i}
              className="text-center text-xs font-semibold py-1"
              style={{ color: 'var(--c-subtle)' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}`}
            initial={{ opacity: 0, x: monthDir * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: monthDir * -20 }}
            transition={{ duration: 0.25, ease }}
            className="grid grid-cols-7 gap-y-1"
          >
            {days.map((day, i) => {
              if (!day) return <div key={i} />

              const iso = toISO(day)
              const dayAulas = aulasByDate[iso] ?? []
              const isToday = iso === today
              const inCurrentMonth = day.getMonth() === currentMonth.getMonth()
              const inRange = iso >= turma.startDate && iso <= turma.endDate
              const blocked = inCurrentMonth && !inRange
              const clickable = inRange && (dayAulas.length > 0 || canEdit)

              return (
                <button
                  key={i}
                  onClick={() => clickable && handleDayClick(day)}
                  disabled={!clickable}
                  className="flex flex-col items-center rounded-xl py-1.5 px-0.5 min-h-[48px] gap-0.5 transition-colors"
                  style={{
                    opacity: !inCurrentMonth ? 0.18 : blocked ? 0.45 : 1,
                    cursor: clickable ? 'pointer' : blocked ? 'not-allowed' : 'default',
                    background: isToday && inRange
                      ? `${turma.iconColor}15`
                      : blocked
                      ? 'var(--c-bg)'
                      : 'transparent',
                  }}
                >
                  <span
                    className="text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full leading-none"
                    style={{
                      background: isToday && inRange ? turma.iconColor : 'transparent',
                      color: isToday && inRange
                        ? '#fff'
                        : blocked
                        ? 'var(--c-subtle)'
                        : 'var(--c-text)',
                    }}
                  >
                    {day.getDate()}
                  </span>

                  {dayAulas.slice(0, 2).map((a, j) => {
                    const pending = a.status === 'pending'
                    return (
                      <div
                        key={j}
                        className="w-full text-[10px] font-black leading-tight px-1 py-0.5 rounded truncate text-center"
                        style={pending ? {
                          background: 'transparent',
                          color: `${turma.iconColor}99`,
                          border: `1px dashed ${turma.iconColor}88`,
                        } : {
                          background: `${turma.iconColor}22`,
                          color: turma.iconColor,
                        }}
                      >
                        {a.title}
                      </div>
                    )
                  })}
                  {dayAulas.length > 2 && (
                    <span className="text-[9px]" style={{ color: 'var(--c-subtle)' }}>
                      +{dayAulas.length - 2}
                    </span>
                  )}
                </button>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {aulas.length === 0 && (
          <p className="text-center text-sm mt-6" style={{ color: 'var(--c-faint)' }}>
            {canEdit ? 'Clique em um dia ou em + para adicionar a primeira aula.' : 'Nenhuma aula cadastrada.'}
          </p>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && selectedDay && (
          <AulaModal
            turmaId={turma.id}
            turmaIconColor={turma.iconColor}
            date={selectedDay}
            turmaStartDate={turma.startDate}
            turmaEndDate={turma.endDate}
            aula={selectedAula}
            students={turma.students}
            canEdit={canEdit}
            isAdmin={isAdmin}
            currentUserUid={currentUserUid}
            currentUserEmail={currentUserEmail}
            onClose={() => setModalOpen(false)}
            onSaved={() => { onRefresh(); setModalOpen(false) }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
