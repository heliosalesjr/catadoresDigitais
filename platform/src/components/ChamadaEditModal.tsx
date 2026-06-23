'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiXMark, HiChevronDown, HiCheckCircle, HiXCircle, HiLink } from 'react-icons/hi2'
import type { Aula, AttendanceStatus } from '@/types'

const ease = [0.32, 0.72, 0, 1] as const

const STATUS_OPTIONS: { value: Exclude<AttendanceStatus, null | 'late'>; label: string; letter: string; color: string }[] = [
  { value: 'present', label: 'Presente', letter: 'P', color: 'var(--c-success)' },
  { value: 'absent', label: 'Falta', letter: 'F', color: 'var(--c-danger)' },
]

interface RespostaDoc {
  studentEmail: string
  studentName?: string
  answers: Record<string, string>
  submittedAt: string
}

interface Props {
  turmaId: string
  turmaIconColor: string
  aula: Aula
  students: string[]
  onClose: () => void
  onChange: () => void
}

function initials(email: string) {
  return email.slice(0, 2).toUpperCase()
}

export function ChamadaEditModal({ turmaId, turmaIconColor, aula, students, onClose, onChange }: Props) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(aula.attendance ?? {})
  const [savingEmail, setSavingEmail] = useState<string | null>(null)
  const [responses, setResponses] = useState<Record<string, RespostaDoc>>({})
  const [loadingResponses, setLoadingResponses] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const avaliacoes = aula.avaliacoes ?? []
  const hasAvaliacoes = avaliacoes.length > 0

  useEffect(() => {
    if (!hasAvaliacoes) return
    setLoadingResponses(true)
    fetch(`/api/turmas/${turmaId}/aulas/${aula.id}/respostas`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: RespostaDoc[]) => {
        const map: Record<string, RespostaDoc> = {}
        for (const r of data) map[r.studentEmail] = r
        setResponses(map)
      })
      .finally(() => setLoadingResponses(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turmaId, aula.id, hasAvaliacoes])

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

  function toggleExpanded(email: string) {
    setExpanded((p) => ({ ...p, [email]: !p[email] }))
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
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col"
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
        <div className="flex flex-col gap-2.5 p-4 overflow-y-auto">
          {students.length === 0 ? (
            <p className="text-xs px-1 py-3" style={{ color: 'var(--c-faint)' }}>
              Nenhum aluno matriculado.
            </p>
          ) : (
            students.map((email) => {
              const status = attendance[email] ?? null
              const saving = savingEmail === email
              const response = responses[email]
              const isOpen = !!expanded[email]

              return (
                <div
                  key={email}
                  className="rounded-xl border overflow-hidden flex-shrink-0"
                  style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg)' }}
                >
                  {/* Student header + attendance selector */}
                  <div className="flex items-center gap-3 px-3.5 py-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                      style={{ background: `${turmaIconColor}18`, color: turmaIconColor }}
                    >
                      {initials(response?.studentName ?? email)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--c-text)' }}>
                        {response?.studentName ?? email}
                      </p>
                      {response?.studentName && (
                        <p className="text-[11px] truncate" style={{ color: 'var(--c-faint)' }}>{email}</p>
                      )}
                    </div>
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

                  {/* Avaliação responses */}
                  {hasAvaliacoes && (
                    <>
                      <button
                        onClick={() => toggleExpanded(email)}
                        disabled={loadingResponses}
                        className="w-full flex items-center justify-between gap-2 px-3.5 py-2 text-[11px] font-medium border-t transition-colors disabled:opacity-60"
                        style={{ borderColor: 'var(--c-border)', color: response ? 'var(--c-subtle)' : 'var(--c-faint)' }}
                      >
                        <span>
                          {loadingResponses
                            ? 'Carregando respostas...'
                            : response
                              ? `Respostas (${Object.keys(response.answers ?? {}).length}/${avaliacoes.length})`
                              : 'Sem respostas enviadas'}
                        </span>
                        <HiChevronDown
                          className="w-3.5 h-3.5 transition-transform flex-shrink-0"
                          style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
                        />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease }}
                            className="overflow-hidden"
                          >
                            <div
                              className="flex flex-col gap-3 px-3.5 py-3 border-t"
                              style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
                            >
                              {avaliacoes.map((av, i) => {
                                const ans = response?.answers?.[av.id]
                                const isQuiz = av.type === 'quiz'
                                const correct = isQuiz && ans ? ans === av.options?.[0] : null

                                return (
                                  <div key={av.id} className="flex flex-col gap-1.5">
                                    <div className="flex items-start gap-1.5">
                                      <span className="text-[11px] font-semibold flex-1 leading-snug" style={{ color: 'var(--c-text)' }}>
                                        {i + 1}. {av.question}
                                      </span>
                                      {correct !== null && (
                                        correct
                                          ? <HiCheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--c-success)' }} />
                                          : <HiXCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--c-danger)' }} />
                                      )}
                                    </div>

                                    {!ans ? (
                                      <p className="text-[11px] italic" style={{ color: 'var(--c-faint)' }}>
                                        Não respondido
                                      </p>
                                    ) : av.type === 'link' ? (
                                      <a
                                        href={ans}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] flex items-center gap-1.5 truncate hover:underline"
                                        style={{ color: turmaIconColor }}
                                      >
                                        <HiLink className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{ans}</span>
                                      </a>
                                    ) : (
                                      <p
                                        className="text-[11px] leading-snug rounded-lg px-2.5 py-1.5 border"
                                        style={{
                                          background: isQuiz ? (correct ? 'var(--c-success-soft)' : 'var(--c-danger-soft)') : 'var(--c-bg)',
                                          color: isQuiz ? (correct ? 'var(--c-success)' : 'var(--c-danger)') : 'var(--c-text)',
                                          borderColor: isQuiz ? 'transparent' : 'var(--c-border)',
                                        }}
                                      >
                                        {ans}
                                      </p>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
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
