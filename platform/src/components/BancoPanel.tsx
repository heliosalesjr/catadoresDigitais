'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiArchiveBox, HiPlus, HiPencilSquare, HiTrash, HiCalendarDays,
  HiLink, HiListBullet, HiCheckCircle,
} from 'react-icons/hi2'
import type { BancoAula, Aula, Turma, UserProfile, Avaliacao } from '@/types'
import { BancoAulaModal } from './BancoAulaModal'
import { AgendarBancoModal } from './AgendarBancoModal'
import { AvaliacaoFormModal } from './AvaliacaoFormModal'
import { TesteAvaliacaoModal } from './TesteAvaliacaoModal'

const ease = [0.32, 0.72, 0, 1] as const

const AVALIACAO_ICON = {
  link: HiLink,
  text: HiPencilSquare,
  quiz: HiListBullet,
} as const

const AVALIACAO_LABEL = {
  link: 'Link',
  text: 'Texto',
  quiz: 'Quiz',
} as const

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

interface PanelProps {
  turma: Turma
  aulas: Aula[]
  currentUser: UserProfile | null
  onRefreshAulas: () => void
}

// ─── BancoCard ────────────────────────────────────────────────────────────────

interface CardProps {
  b: BancoAula
  turma: Turma
  currentUser: UserProfile | null
  isApplied: boolean
  onDelete: () => void
  onRefresh: () => void
  onRefreshAulas: () => void
}

function BancoCard({ b, turma, currentUser, isApplied, onDelete, onRefresh, onRefreshAulas }: CardProps) {
  const isAdmin = currentUser?.role === 'admin'
  const canDelete = isAdmin || b.createdBy === currentUser?.uid

  const [editingBanco, setEditingBanco] = useState(false)
  const [agendando, setAgendando] = useState(false)
  const [creatingAvaliacao, setCreatingAvaliacao] = useState(false)
  const [testingAvaliacao, setTestingAvaliacao] = useState(false)

  const avaliacoes = b.avaliacoes ?? []
  const borderColor = isApplied ? `${turma.iconColor}55` : turma.iconColor

  async function saveAvaliacao(data: Omit<Avaliacao, 'id' | 'createdAt'>) {
    const newAv: Avaliacao = { ...data, id: genId(), createdAt: new Date().toISOString() }
    await fetch(`/api/turmas/${turma.id}/banco/${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avaliacoes: [...avaliacoes, newAv] }),
    })
    setCreatingAvaliacao(false)
    onRefresh()
  }

  async function deleteAvaliacao(id: string) {
    if (!confirm('Excluir esta avaliação?')) return
    await fetch(`/api/turmas/${turma.id}/banco/${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avaliacoes: avaliacoes.filter((a) => a.id !== id) }),
    })
    onRefresh()
  }

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
      transition={{ duration: 0.25, ease }}
    >
      {/* Header */}
      <div
        className="px-4 pt-3.5 pb-3"
        style={{ borderLeft: `3px solid ${borderColor}` }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className="text-sm font-semibold leading-snug truncate"
                style={{ color: isApplied ? 'var(--c-subtle)' : 'var(--c-text)' }}
              >
                {b.title}
              </p>
              {isApplied && (
                <span
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                  style={{ background: `${turma.iconColor}12`, color: turma.iconColor, border: `1px solid ${turma.iconColor}30` }}
                >
                  <HiCheckCircle className="w-3 h-3" /> Já aplicada
                </span>
              )}
            </div>
            {b.teachers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {b.teachers.map((t) => (
                  <span
                    key={t.uid}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{
                      background: `${turma.iconColor}12`,
                      color: isApplied ? 'var(--c-subtle)' : turma.iconColor,
                    }}
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            )}
            {b.description && (
              <p
                className="text-xs mt-2 leading-relaxed line-clamp-2"
                style={{ color: 'var(--c-faint)' }}
              >
                {b.description}
              </p>
            )}
          </div>
          <button
            onClick={() => setEditingBanco(true)}
            className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 transition-opacity hover:opacity-80 mt-0.5"
            style={{ color: 'var(--c-subtle)' }}
            title="Editar aula"
          >
            <HiPencilSquare className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Avaliações ── */}
      <div
        className="px-4 py-2.5 flex flex-col gap-1.5 border-t"
        style={{ borderColor: 'var(--c-border)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
            Avaliações
          </span>
          <button
            onClick={() => setCreatingAvaliacao(true)}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg border transition-opacity hover:opacity-80"
            style={{ borderColor: turma.iconColor, color: turma.iconColor }}
          >
            <HiPlus className="w-3 h-3" /> Criar
          </button>
        </div>

        {avaliacoes.length === 0 ? (
          <p className="text-xs py-0.5" style={{ color: 'var(--c-faint)' }}>Nenhuma avaliação.</p>
        ) : (
          <>
            {avaliacoes.map((av) => {
              const TypeIcon = AVALIACAO_ICON[av.type]
              return (
                <div
                  key={av.id}
                  className="flex items-start gap-2 rounded-lg px-2.5 py-2"
                  style={{ background: 'var(--c-bg)' }}
                >
                  <TypeIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: turma.iconColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug" style={{ color: 'var(--c-text)' }}>
                      {av.question}
                    </p>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-1 inline-block"
                      style={{ background: `${turma.iconColor}12`, color: turma.iconColor }}
                    >
                      {AVALIACAO_LABEL[av.type]}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteAvaliacao(av.id)}
                    className="w-6 h-6 flex items-center justify-center rounded flex-shrink-0 transition-opacity hover:opacity-80"
                    style={{ color: 'var(--c-faint)' }}
                    title="Excluir avaliação"
                  >
                    <HiTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
            <button
              onClick={() => setTestingAvaliacao(true)}
              className="mt-1 w-full py-1.5 rounded-lg text-xs font-semibold border transition-opacity hover:opacity-80"
              style={{ borderColor: turma.iconColor, color: turma.iconColor }}
            >
              Testar avaliação
            </button>
          </>
        )}
      </div>

      {/* ── Actions ── */}
      <div
        className="px-4 py-2.5 flex items-center gap-2 border-t"
        style={{ borderColor: 'var(--c-border)' }}
      >
        <button
          onClick={() => setAgendando(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
          style={{ background: isApplied ? `${turma.iconColor}80` : turma.iconColor, color: '#fff' }}
        >
          <HiCalendarDays className="w-3.5 h-3.5" /> Agendar novamente
        </button>
        {canDelete && (
          <button
            onClick={onDelete}
            className="ml-auto flex items-center justify-center w-7 h-7 rounded-lg border transition-opacity hover:opacity-80"
            style={{ borderColor: 'var(--c-border-md)', color: '#ef444480' }}
            title="Excluir"
          >
            <HiTrash className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {editingBanco && (
          <BancoAulaModal
            turmaId={turma.id}
            turmaIconColor={turma.iconColor}
            banco={b}
            currentUser={currentUser}
            onClose={() => setEditingBanco(false)}
            onSaved={() => { setEditingBanco(false); onRefresh() }}
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
            banco={b}
            onClose={() => setAgendando(false)}
            onAgendado={() => { setAgendando(false); onRefreshAulas() }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {creatingAvaliacao && (
          <AvaliacaoFormModal
            accentColor={turma.iconColor}
            onSave={saveAvaliacao}
            onClose={() => setCreatingAvaliacao(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {testingAvaliacao && avaliacoes.length > 0 && (
          <TesteAvaliacaoModal
            avaliacoes={avaliacoes}
            accentColor={turma.iconColor}
            onClose={() => setTestingAvaliacao(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── BancoPanel ───────────────────────────────────────────────────────────────

export function BancoPanel({ turma, aulas, currentUser, onRefreshAulas }: PanelProps) {
  const [banco, setBanco] = useState<BancoAula[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

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
        banco.map((b) => {
          const isApplied = aulas.some((a) => a.bancoAulaId === b.id)
          return (
            <BancoCard
              key={b.id}
              b={b}
              turma={turma}
              currentUser={currentUser}
              isApplied={isApplied}
              onDelete={() => handleDelete(b)}
              onRefresh={fetchBanco}
              onRefreshAulas={onRefreshAulas}
            />
          )
        })
      )}

      <AnimatePresence>
        {creating && (
          <BancoAulaModal
            turmaId={turma.id}
            turmaIconColor={turma.iconColor}
            banco={null}
            currentUser={currentUser}
            onClose={() => setCreating(false)}
            onSaved={() => { setCreating(false); fetchBanco() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
