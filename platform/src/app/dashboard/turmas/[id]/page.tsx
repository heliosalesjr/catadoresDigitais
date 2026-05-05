'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { TECH_ICONS } from '@/lib/icons'
import { HiArrowLeft, HiCalendarDays, HiDocumentText, HiPencilSquare } from 'react-icons/hi2'
import { CalendarGrid } from '@/components/CalendarGrid'
import type { Turma } from '@/types'

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
  const [turma, setTurma] = useState<Turma | null>(null)
  const [loading, setLoading] = useState(true)
  const [calendarOpen, setCalendarOpen] = useState(true)
  const isMobile = useIsMobile()

  useEffect(() => {
    fetch(`/api/admin/turmas/${id}`)
      .then((r) => r.json())
      .then((data: Turma) => { setTurma(data); setLoading(false) })
  }, [id])

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
      className="flex flex-col flex-1"
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
      <div className="relative flex flex-1 overflow-hidden flex-col md:flex-row">

        {/* Content panel */}
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
              canEdit={canEdit}
              currentUserUid={user.uid}
              isMobile={isMobile}
              onCollapse={() => setCalendarOpen(false)}
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
