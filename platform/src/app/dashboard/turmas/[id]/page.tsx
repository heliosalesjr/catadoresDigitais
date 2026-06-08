'use client'

import { useEffect, useState, useCallback } from 'react'
import { use } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { TECH_ICONS } from '@/lib/icons'
import { HiArrowLeft, HiCalendarDays, HiPencilSquare } from 'react-icons/hi2'
import { CalendarGrid } from '@/components/CalendarGrid'
import { ConteudoPanel } from '@/components/ConteudoPanel'
import type { Turma, Aula } from '@/types'

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
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
const CALENDAR_MOBILE_H = 420

export default function TurmaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') ?? undefined
  const [turma, setTurma] = useState<Turma | null>(null)
  const [loading, setLoading] = useState(true)
  const [calendarOpen, setCalendarOpen] = useState(true)
  const [aulas, setAulas] = useState<Aula[]>([])
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null)
  const isMobile = useIsMobile()

  const fetchTurma = useCallback(async () => {
    const res = await fetch(`/api/turmas/${id}`)
    if (!res.ok) return
    const data: Turma = await res.json()
    setTurma(data)
    setLoading(false)
    setSelectedMonth((prev) => prev ?? (() => {
      const [y, m] = data.startDate.split('-').map(Number)
      return new Date(y, m - 1, 1)
    })())
  }, [id])

  useEffect(() => { fetchTurma() }, [fetchTurma])

  const fetchAulas = useCallback(async () => {
    const res = await fetch(`/api/turmas/${id}/aulas`)
    if (res.ok) setAulas(await res.json())
  }, [id])

  useEffect(() => { fetchAulas() }, [fetchAulas])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
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
      <div className="flex-1 flex items-center justify-center">
        <p style={{ color: 'var(--c-subtle)' }}>Turma não encontrada.</p>
      </div>
    )
  }

  const iconEntry = TECH_ICONS[turma.icon]
  const Icon = iconEntry?.icon
  const isAdmin = user?.role === 'admin'
  const canEdit = user?.role === 'admin' || user?.role === 'teacher'

  return (
    <motion.div
      className="flex flex-col flex-1 min-h-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease }}
    >
      {/* Sub-header: turma info */}
      <header
        className="flex items-center justify-between px-4 md:px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={isAdmin ? '/dashboard/admin/turmas' : '/dashboard'}
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
              <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--c-text)' }}>
                {turma.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--c-subtle)' }}>
                {parseLocalDate(turma.startDate).toLocaleDateString('pt-BR')} →{' '}
                {parseLocalDate(turma.endDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <Link
            href={`/dashboard/admin/turmas/${id}/editar`}
            className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors flex-shrink-0"
            style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
            title="Editar turma"
          >
            <HiPencilSquare className="w-4 h-4" />
          </Link>
        )}
      </header>

      {/* Split layout */}
      <div className="relative flex flex-1 min-h-0 flex-col md:flex-row">

        {/* Content panel */}
        <div
          className="flex-1 min-w-0 min-h-0 overflow-y-auto"
          style={{
            borderRight: !isMobile && calendarOpen ? `1px solid var(--c-border)` : 'none',
            borderBottom: isMobile && calendarOpen ? `1px solid var(--c-border)` : 'none',
          }}
        >
          {selectedMonth && (
            <ConteudoPanel
              turma={turma}
              aulas={aulas}
              selectedMonth={selectedMonth}
              canEdit={canEdit}
              currentUser={user}
              onRefresh={fetchAulas}
              onRefreshTurma={fetchTurma}
              initialTab={initialTab}
            />
          )}
        </div>

        {/* Calendar panel */}
        <motion.div
          initial={false}
          animate={
            calendarOpen
              ? isMobile ? { height: CALENDAR_MOBILE_H, opacity: 1 } : { width: '50%', opacity: 1 }
              : isMobile ? { height: 0, opacity: 0 }               : { width: 0, opacity: 0 }
          }
          transition={{ duration: 0.5, ease }}
          className="flex flex-col overflow-hidden flex-shrink-0"
          style={isMobile ? { width: '100%' } : { height: '100%' }}
        >
          {user && turma && (
            <CalendarGrid
              turma={turma}
              aulas={aulas}
              canEdit={canEdit}
              isAdmin={isAdmin}
              currentUserUid={user.uid}
              currentUserEmail={user.email}
              isMobile={isMobile}
              onCollapse={() => setCalendarOpen(false)}
              onRefresh={fetchAulas}
              onMonthChange={setSelectedMonth}
            />
          )}
        </motion.div>

        {/* FAB */}
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
              className="fixed bottom-6 right-6 z-20 w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
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
