'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiXMark, HiCalendarDays } from 'react-icons/hi2'
import type { BancoAula } from '@/types'

const ease = [0.32, 0.72, 0, 1] as const

const inputStyle = {
  background: 'var(--c-bg)',
  borderColor: 'var(--c-border-md)',
  color: 'var(--c-text)',
} as const

interface Props {
  turmaId: string
  turmaIconColor: string
  turmaStartDate: string
  turmaEndDate: string
  banco: BancoAula
  onClose: () => void
  onAgendado: () => void
}

export function AgendarBancoModal({
  turmaId, turmaIconColor, turmaStartDate, turmaEndDate, banco, onClose, onAgendado,
}: Props) {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('19:00')
  const [endTime, setEndTime] = useState('22:00')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAgendar() {
    if (!date) return setError('Selecione uma data.')
    if (!startTime || !endTime) return setError('Informe o horário.')
    setError(null)
    setSaving(true)

    const res = await fetch(`/api/turmas/${turmaId}/banco/${banco.id}/agendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, startTime, endTime }),
    })

    setSaving(false)
    if (!res.ok) {
      const d = await res.json()
      return setError(d.error ?? 'Erro ao agendar.')
    }
    onAgendado()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ duration: 0.25, ease }}
        className="w-full max-w-sm rounded-2xl shadow-2xl flex flex-col"
        style={{ background: 'var(--c-bg-alt)', border: '1px solid var(--c-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-5 border-b"
          style={{ borderColor: 'var(--c-border)' }}
        >
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-1">
              <HiCalendarDays className="w-4 h-4 flex-shrink-0" style={{ color: turmaIconColor }} />
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: turmaIconColor }}
              >
                Agendar aula
              </span>
            </div>
            <h2 className="text-base font-bold leading-snug" style={{ color: 'var(--c-text)' }}>
              {banco.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center border"
            style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
          >
            <HiXMark className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--c-subtle)' }}>
              Data
            </label>
            <input
              type="date"
              value={date}
              min={turmaStartDate}
              max={turmaEndDate}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm border outline-none"
              style={inputStyle}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-medium" style={{ color: 'var(--c-subtle)' }}>
                Início
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-xl px-3 py-2 text-sm border outline-none"
                style={inputStyle}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-medium" style={{ color: 'var(--c-subtle)' }}>
                Término
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="rounded-xl px-3 py-2 text-sm border outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--c-danger)' }}>{error}</p>}

          <div className="flex gap-2 mt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm border"
              style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-muted)' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleAgendar}
              disabled={saving || !date}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity disabled:opacity-50"
              style={{ background: turmaIconColor, color: '#fff' }}
            >
              {saving ? 'Agendando...' : 'Agendar'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
