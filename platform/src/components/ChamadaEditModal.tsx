'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiXMark } from 'react-icons/hi2'
import type { Aula, AttendanceStatus } from '@/types'

const ease = [0.32, 0.72, 0, 1] as const

const STATUS_OPTIONS: { value: Exclude<AttendanceStatus, null>; label: string; letter: string; color: string }[] = [
  { value: 'present', label: 'Presente', letter: 'P', color: 'var(--c-success)' },
  { value: 'absent', label: 'Falta', letter: 'F', color: 'var(--c-danger)' },
  { value: 'late', label: 'Atrasado', letter: 'A', color: 'var(--c-warning)' },
]

interface Props {
  turmaId: string
  turmaIconColor: string
  aula: Aula
  students: string[]
  onClose: () => void
  onChange: () => void
}

export function ChamadaEditModal({ turmaId, turmaIconColor, aula, students, onClose, onChange }: Props) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(aula.attendance ?? {})
  const [savingEmail, setSavingEmail] = useState<string | null>(null)

  async function setStatus(email: string, status: Exclude<AttendanceStatus, null>) {
    const next = attendance[email] === status ? null : status
    const updated = { ...attendance, [email]: next }
    setAttendance(updated)
    setSavingEmail(email)
    await fetch(`/api/turmas/${turmaId}/aulas/${aula.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendance: updated }),
    })
    setSavingEmail(null)
    onChange()
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
        className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col"
        style={{ background: 'var(--c-bg-alt)', border: '1px solid var(--c-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-5 border-b flex-shrink-0"
          style={{ borderColor: 'var(--c-border)' }}
        >
          <div className="min-w-0 pr-3">
            <h2 className="text-base font-bold leading-snug truncate" style={{ color: 'var(--c-text)' }}>
              Lista de chamada
            </h2>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--c-subtle)' }}>
              {aula.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0"
            style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
          >
            <HiXMark className="w-4 h-4" />
          </button>
        </div>

        {/* Student list */}
        <div className="flex flex-col overflow-y-auto">
          {students.length === 0 ? (
            <p className="text-xs px-5 py-4" style={{ color: 'var(--c-faint)' }}>
              Nenhum aluno matriculado.
            </p>
          ) : (
            students.map((email, i) => {
              const status = attendance[email] ?? null
              const saving = savingEmail === email
              return (
                <div
                  key={email}
                  className="flex items-center gap-2 px-5 py-2.5"
                  style={{ borderTop: i === 0 ? 'none' : '1px solid var(--c-border)' }}
                >
                  <span className="flex-1 text-xs truncate" style={{ color: 'var(--c-text)' }}>
                    {email}
                  </span>
                  <div className="flex gap-1 flex-shrink-0">
                    {STATUS_OPTIONS.map((opt) => {
                      const active = status === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setStatus(email, opt.value)}
                          disabled={saving}
                          title={opt.label}
                          className="text-xs font-bold w-7 h-7 rounded-lg flex items-center justify-center border transition-opacity disabled:opacity-50"
                          style={{
                            borderColor: active ? opt.color : 'var(--c-border-md)',
                            color: active ? '#fff' : opt.color,
                            background: active ? opt.color : 'transparent',
                          }}
                        >
                          {opt.letter}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="p-4 border-t flex-shrink-0" style={{ borderColor: 'var(--c-border)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--c-faint)' }}>
            As alterações são salvas automaticamente.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
