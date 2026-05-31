'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiArchiveBox, HiPlus, HiPencilSquare, HiTrash, HiCalendarDays,
} from 'react-icons/hi2'
import type { BancoAula, Turma, UserProfile } from '@/types'
import { BancoAulaModal } from './BancoAulaModal'
import { AgendarBancoModal } from './AgendarBancoModal'

const ease = [0.32, 0.72, 0, 1] as const

interface Props {
  turma: Turma
  currentUser: UserProfile | null
  onRefreshAulas: () => void
}

export function BancoPanel({ turma, currentUser, onRefreshAulas }: Props) {
  const isAdmin = currentUser?.role === 'admin'
  const [banco, setBanco] = useState<BancoAula[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<BancoAula | null>(null)
  const [agendando, setAgendando] = useState<BancoAula | null>(null)

  const fetchBanco = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/turmas/${turma.id}/banco`)
    if (res.ok) setBanco(await res.json())
    setLoading(false)
  }, [turma.id])

  useEffect(() => { fetchBanco() }, [fetchBanco])

  async function handleDelete(b: BancoAula) {
    if (!confirm(`Excluir "${b.title}" do banco de aulas?`)) return
    await fetch(`/api/turmas/${turma.id}/banco/${b.id}`, { method: 'DELETE' })
    fetchBanco()
  }

  return (
    <div className="p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiArchiveBox className="w-4 h-4" style={{ color: turma.iconColor }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>
            Banco de Aulas
          </span>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80"
          style={{ borderColor: turma.iconColor, color: turma.iconColor }}
        >
          <HiPlus className="w-3.5 h-3.5" /> Nova aula
        </button>
      </div>

      {loading ? (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--c-faint)' }}>
          Carregando...
        </p>
      ) : banco.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
          <HiArchiveBox className="w-10 h-10" style={{ color: 'var(--c-faint)' }} />
          <p className="font-semibold" style={{ color: 'var(--c-text)' }}>Banco vazio</p>
          <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>
            Crie aulas aqui e agende-as no calendário quando quiser.
          </p>
        </div>
      ) : (
        banco.map((b) => (
          <motion.div
            key={b.id}
            layout
            className="rounded-2xl overflow-hidden border"
            style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
            transition={{ duration: 0.25, ease }}
          >
            <div
              className="px-4 pt-3.5 pb-3"
              style={{ borderLeft: `3px solid ${turma.iconColor}` }}
            >
              <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--c-text)' }}>
                {b.title}
              </p>
              {b.teachers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {b.teachers.map((t) => (
                    <span
                      key={t.uid}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: `${turma.iconColor}12`, color: turma.iconColor }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
              {b.description && (
                <p
                  className="text-xs mt-2 leading-relaxed line-clamp-2"
                  style={{ color: 'var(--c-subtle)' }}
                >
                  {b.description}
                </p>
              )}
              {(b.driveLinks?.length > 0 || (b.avaliacoes?.length ?? 0) > 0) && (
                <div className="flex gap-2 mt-2">
                  {b.driveLinks?.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--c-bg)', color: 'var(--c-subtle)' }}>
                      {b.driveLinks.length} material{b.driveLinks.length !== 1 ? 'is' : ''}
                    </span>
                  )}
                  {(b.avaliacoes?.length ?? 0) > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--c-bg)', color: 'var(--c-subtle)' }}>
                      {b.avaliacoes!.length} avaliação{b.avaliacoes!.length !== 1 ? 'ões' : ''}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div
              className="px-4 py-2.5 flex items-center gap-2 border-t"
              style={{ borderColor: 'var(--c-border)' }}
            >
              <button
                onClick={() => setAgendando(b)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
                style={{ background: turma.iconColor, color: '#fff' }}
              >
                <HiCalendarDays className="w-3.5 h-3.5" /> Agendar
              </button>
              <button
                onClick={() => setEditing(b)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80"
                style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
              >
                <HiPencilSquare className="w-3.5 h-3.5" /> Editar
              </button>
              {(isAdmin || b.createdBy === currentUser?.uid) && (
                <button
                  onClick={() => handleDelete(b)}
                  className="ml-auto flex items-center justify-center w-7 h-7 rounded-lg border transition-opacity hover:opacity-80"
                  style={{ borderColor: 'var(--c-border-md)', color: '#ef444480' }}
                  title="Excluir"
                >
                  <HiTrash className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        ))
      )}

      <AnimatePresence>
        {(creating || editing) && (
          <BancoAulaModal
            turmaId={turma.id}
            turmaIconColor={turma.iconColor}
            banco={editing}
            currentUser={currentUser}
            onClose={() => { setCreating(false); setEditing(null) }}
            onSaved={() => { setCreating(false); setEditing(null); fetchBanco() }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {agendando && (
          <AgendarBancoModal
            turmaId={turma.id}
            turmaIconColor={turma.iconColor}
            turmaStartDate={turma.startDate}
            turmaEndDate={turma.endDate}
            banco={agendando}
            onClose={() => setAgendando(null)}
            onAgendado={() => { setAgendando(null); onRefreshAulas() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
