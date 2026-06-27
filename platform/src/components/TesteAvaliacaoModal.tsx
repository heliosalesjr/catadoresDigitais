'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HiXMark, HiCheckCircle, HiXCircle } from 'react-icons/hi2'
import type { Avaliacao } from '@/types'
import { inputStyle } from '@/lib/styles'

const ease = [0.32, 0.72, 0, 1] as const
const TEXT_LIMIT = 404

const TYPE_LABEL: Record<string, string> = {
  link: 'Link',
  text: 'Texto',
  quiz: 'Quiz',
}

function isValidUrl(s: string) {
  try { return Boolean(new URL(s)) } catch { return false }
}

interface QuizState {
  shuffled: string[]
  correctIdx: number
}

interface Props {
  avaliacoes: Avaliacao[]
  accentColor: string
  onClose: () => void
  turmaId?: string
  aulaId?: string
  onSubmitted?: () => void
}

export function TesteAvaliacaoModal({ avaliacoes, accentColor, onClose, turmaId, aulaId, onSubmitted }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isStudentMode = !!(turmaId && aulaId)
  const answeredCount = Object.keys(answers).length

  // Shuffle quiz options once on mount, stable per session
  const quizStates = useMemo<Record<string, QuizState>>(() => {
    const out: Record<string, QuizState> = {}
    for (const av of avaliacoes) {
      if (av.type === 'quiz' && av.options?.length === 5) {
        const shuffled = [...av.options]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        out[av.id] = { shuffled, correctIdx: shuffled.indexOf(av.options[0]) }
      }
    }
    return out
  }, [avaliacoes])

  function isCorrect(av: Avaliacao): boolean {
    const ans = answers[av.id] ?? ''
    if (av.type === 'link') return isValidUrl(ans)
    if (av.type === 'text') return ans.trim().length > 0
    const qs = quizStates[av.id]
    if (!qs) return false
    return qs.shuffled.indexOf(ans) === qs.correctIdx
  }

  const correctCount = submitted && !isStudentMode ? avaliacoes.filter(isCorrect).length : 0

  async function handleSubmit() {
    if (isStudentMode) {
      setSubmitting(true)
      await fetch(`/api/turmas/${turmaId}/aulas/${aulaId}/respostas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      setSubmitting(false)
    }
    setSubmitted(true)
  }

  function handleClose() {
    if (submitted && isStudentMode) onSubmitted?.()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 8, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 8, opacity: 0 }}
        transition={{ duration: 0.25, ease }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col"
        style={{ background: 'var(--c-bg-alt)', border: '1px solid var(--c-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-5 border-b flex-shrink-0"
          style={{ borderColor: 'var(--c-border)' }}
        >
          <div>
            <h2 className="font-bold text-base" style={{ color: 'var(--c-text)' }}>
              {isStudentMode ? 'Avaliação' : 'Teste de Avaliação'}
            </h2>
            {!isStudentMode && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--c-subtle)' }}>
                Simulação da experiência do aluno
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0"
            style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
          >
            <HiXMark className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-0 p-5 divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
          {avaliacoes.map((av, i) => {
            const ans = answers[av.id] ?? ''
            const qs = quizStates[av.id]
            const correct = submitted && !isStudentMode ? isCorrect(av) : null
            const textRemaining = TEXT_LIMIT - ans.length
            const nearLimit = ans.length > TEXT_LIMIT * 0.85

            return (
              <div key={av.id} className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0">
                {/* Question */}
                <div className="flex items-start gap-2.5">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: `${accentColor}20`, color: accentColor }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--c-text)' }}>
                      {av.question}
                    </p>
                    <span
                      className="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mt-1"
                      style={{ background: 'var(--c-border)', color: 'var(--c-subtle)' }}
                    >
                      {TYPE_LABEL[av.type]}
                    </span>
                  </div>
                  {submitted && !isStudentMode && (
                    correct
                      ? <HiCheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--c-success)' }} />
                      : <HiXCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--c-danger)' }} />
                  )}
                </div>

                {/* Link input */}
                {av.type === 'link' && (
                  <input
                    type="url"
                    value={ans}
                    onChange={(e) => !submitted && setAnswers((p) => ({ ...p, [av.id]: e.target.value }))}
                    placeholder="https://..."
                    disabled={submitted}
                    className="rounded-xl px-3 py-2.5 text-sm border outline-none disabled:opacity-60"
                    style={{
                      ...inputStyle,
                      borderColor: submitted && !isStudentMode
                        ? correct ? 'var(--c-success)' : 'var(--c-danger)'
                        : 'var(--c-border-md)',
                    }}
                  />
                )}

                {/* Text input */}
                {av.type === 'text' && (
                  <div className="flex flex-col gap-1">
                    <textarea
                      value={ans}
                      onChange={(e) => {
                        if (submitted) return
                        if (e.target.value.length <= TEXT_LIMIT)
                          setAnswers((p) => ({ ...p, [av.id]: e.target.value }))
                      }}
                      placeholder="Digite sua resposta..."
                      rows={4}
                      disabled={submitted}
                      className="rounded-xl px-3 py-2.5 text-sm border outline-none resize-none disabled:opacity-60"
                      style={{
                        ...inputStyle,
                        borderColor: submitted && !isStudentMode
                          ? correct ? 'var(--c-success)' : 'var(--c-danger)'
                          : 'var(--c-border-md)',
                      }}
                    />
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs" style={{ color: 'var(--c-faint)' }}>
                        Máximo de {TEXT_LIMIT} caracteres
                      </span>
                      <span
                        className="text-xs font-semibold tabular-nums transition-colors"
                        style={{ color: nearLimit ? 'var(--c-danger)' : 'var(--c-subtle)' }}
                      >
                        {textRemaining}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quiz options */}
                {av.type === 'quiz' && qs && (
                  <div className="flex flex-col gap-2">
                    {qs.shuffled.map((opt, j) => {
                      const selected = ans === opt
                      const isCorrectOpt = j === qs.correctIdx
                      const wrongSelected = submitted && !isStudentMode && selected && !correct

                      let border = 'var(--c-border-md)'
                      let bg = 'transparent'
                      let color = 'var(--c-text)'

                      if (submitted && !isStudentMode && isCorrectOpt) {
                        border = 'var(--c-success)'; bg = 'var(--c-success-soft)'; color = 'var(--c-success)'
                      } else if (wrongSelected) {
                        border = 'var(--c-danger)'; bg = 'var(--c-danger-soft)'; color = 'var(--c-danger)'
                      } else if (selected) {
                        border = accentColor; bg = `${accentColor}12`; color = accentColor
                      }

                      return (
                        <button
                          key={j}
                          onClick={() => !submitted && setAnswers((p) => ({ ...p, [av.id]: opt }))}
                          disabled={submitted}
                          className="text-left px-3.5 py-2.5 rounded-xl border text-sm transition-colors disabled:cursor-default"
                          style={{ borderColor: border, background: bg, color }}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-5 pt-0 flex flex-col gap-2">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
              style={{ background: accentColor, color: '#fff' }}
            >
              {submitting ? 'Enviando...' : 'Enviar respostas'}
            </button>
          ) : (
            <>
              <div
                className="rounded-xl p-3 text-center text-sm font-semibold"
                style={{ background: `${accentColor}15`, color: accentColor }}
              >
                {isStudentMode
                  ? `${answeredCount} de ${avaliacoes.length} ${avaliacoes.length === 1 ? 'questão' : 'questões'} enviadas`
                  : `${correctCount} de ${avaliacoes.length} ${avaliacoes.length === 1 ? 'questão' : 'questões'} corretas`
                }
              </div>
              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl text-sm border"
                style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-muted)' }}
              >
                Fechar
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
