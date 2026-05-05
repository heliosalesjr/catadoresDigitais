'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiDocumentText, HiVideoCamera, HiArrowTopRightOnSquare, HiPlus, HiXMark,
} from 'react-icons/hi2'
import type { Turma, Aula, DriveLink } from '@/types'

const MONTHS_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

const ease = [0.32, 0.72, 0, 1] as const

const inputStyle = {
  background: 'var(--c-bg)',
  borderColor: 'var(--c-border-md)',
  color: 'var(--c-text)',
} as const

function detectType(url: string): 'video' | 'file' {
  try {
    const h = new URL(url).hostname
    if (h.includes('youtube.com') || h.includes('youtu.be') || h.includes('vimeo.com')) return 'video'
  } catch {}
  return 'file'
}

function parseLocalDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

interface Props {
  turma: Turma
  aulas: Aula[]
  selectedMonth: Date
  canEdit: boolean
  onRefresh: () => void
}

interface AddState {
  aulaId: string
  label: string
  url: string
  saving: boolean
}

export function ConteudoPanel({ turma, aulas, selectedMonth, canEdit, onRefresh }: Props) {
  const [adding, setAdding] = useState<AddState | null>(null)

  const monthAulas = aulas
    .filter((a) => {
      const [y, m] = a.date.split('-').map(Number)
      return y === selectedMonth.getFullYear() && m === selectedMonth.getMonth() + 1
    })
    .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))

  async function submitMaterial(aula: Aula) {
    if (!adding || !adding.url.trim()) return
    setAdding((s) => s ? { ...s, saving: true } : null)
    const newLinks: DriveLink[] = [
      ...aula.driveLinks,
      { label: adding.label.trim() || adding.url.trim(), url: adding.url.trim() },
    ]
    await fetch(`/api/turmas/${turma.id}/aulas/${aula.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driveLinks: newLinks }),
    })
    setAdding(null)
    onRefresh()
  }

  return (
    <>
      {/* Panel header */}
      <div
        className="px-5 py-3 border-b flex items-center gap-2 flex-shrink-0"
        style={{ borderColor: 'var(--c-border)' }}
      >
        <HiDocumentText className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--c-subtle)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Conteúdo</span>
        <span className="text-xs" style={{ color: 'var(--c-subtle)' }}>
          — {MONTHS_PT[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
        </span>
      </div>

      {/* Aula list */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {monthAulas.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-16 text-center flex-col gap-2">
            <HiDocumentText className="w-10 h-10" style={{ color: 'var(--c-faint)' }} />
            <p className="font-semibold" style={{ color: 'var(--c-text)' }}>Nenhuma aula este mês</p>
            <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>
              Use o calendário para criar aulas neste período.
            </p>
          </div>
        ) : (
          monthAulas.map((aula) => (
            <AulaCard
              key={aula.id}
              aula={aula}
              turma={turma}
              canEdit={canEdit}
              adding={adding?.aulaId === aula.id ? adding : null}
              onStart={() => setAdding({ aulaId: aula.id, label: '', url: '', saving: false })}
              onCancel={() => setAdding(null)}
              onChange={(f, v) => setAdding((s) => s ? { ...s, [f]: v } : null)}
              onSubmit={() => submitMaterial(aula)}
            />
          ))
        )}
      </div>
    </>
  )
}

interface CardProps {
  aula: Aula
  turma: Turma
  canEdit: boolean
  adding: AddState | null
  onStart: () => void
  onCancel: () => void
  onChange: (field: 'label' | 'url', value: string) => void
  onSubmit: () => void
}

function AulaCard({ aula, turma, canEdit, adding, onStart, onCancel, onChange, onSubmit }: CardProps) {
  const date = parseLocalDate(aula.date)
  const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  const detectedType = adding?.url ? detectType(adding.url) : null

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
      transition={{ duration: 0.25, ease }}
    >
      {/* Aula info — read-only */}
      <div
        className="px-4 pt-3.5 pb-3"
        style={{ borderLeft: `3px solid ${turma.iconColor}` }}
      >
        <p className="text-sm font-semibold leading-snug truncate" style={{ color: 'var(--c-text)' }}>
          {aula.title}
        </p>
        <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--c-subtle)' }}>
          {dateStr} · {aula.startTime} – {aula.endTime}
        </p>

        {aula.teachers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {aula.teachers.map((t) => (
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

        {aula.description && (
          <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--c-muted)' }}>
            {aula.description}
          </p>
        )}
      </div>

      {/* Materials */}
      <div
        className="px-4 py-2.5 flex flex-col gap-1.5 border-t"
        style={{ borderColor: 'var(--c-border)' }}
      >
        {/* Section header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
            Materiais
          </span>
          {canEdit && !adding && (
            <button
              onClick={onStart}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg border transition-opacity hover:opacity-80"
              style={{ borderColor: turma.iconColor, color: turma.iconColor }}
            >
              <HiPlus className="w-3 h-3" /> Adicionar
            </button>
          )}
        </div>
        {aula.driveLinks.length === 0 && !adding && (
          <p className="text-xs py-0.5" style={{ color: 'var(--c-faint)' }}>Nenhum material.</p>
        )}

        {aula.driveLinks.map((link, i) => {
          const type = detectType(link.url)
          return (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5 transition-opacity hover:opacity-75"
              style={{ background: 'var(--c-bg)', color: 'var(--c-text)' }}
            >
              {type === 'video'
                ? <HiVideoCamera className="w-3.5 h-3.5 flex-shrink-0" style={{ color: turma.iconColor }} />
                : <HiArrowTopRightOnSquare className="w-3.5 h-3.5 flex-shrink-0" style={{ color: turma.iconColor }} />
              }
              <span className="truncate">{link.label || link.url}</span>
            </a>
          )
        })}

        {/* Inline add form */}
        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: 'var(--c-subtle)' }}>
                    Novo material
                  </span>
                  {detectedType === 'video' && (
                    <span
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: `${turma.iconColor}18`, color: turma.iconColor }}
                    >
                      <HiVideoCamera className="w-3 h-3" /> Vídeo
                    </span>
                  )}
                </div>

                <input
                  type="url"
                  value={adding.url}
                  onChange={(e) => onChange('url', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                  placeholder="URL (YouTube, Vimeo, Drive...)"
                  className="rounded-lg px-2.5 py-1.5 text-xs border outline-none"
                  style={inputStyle}
                  autoFocus
                />
                <input
                  type="text"
                  value={adding.label}
                  onChange={(e) => onChange('label', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                  placeholder="Nome do material (opcional)"
                  className="rounded-lg px-2.5 py-1.5 text-xs border outline-none"
                  style={inputStyle}
                />

                <div className="flex gap-2">
                  <button
                    onClick={onCancel}
                    className="flex-1 py-1.5 rounded-lg text-xs border"
                    style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-muted)' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={onSubmit}
                    disabled={!adding.url.trim() || adding.saving}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-opacity disabled:opacity-40"
                    style={{ background: turma.iconColor, color: '#fff' }}
                  >
                    {adding.saving ? 'Salvando...' : 'Adicionar'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
