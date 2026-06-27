'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiXMark, HiLink, HiPencilSquare, HiListBullet } from 'react-icons/hi2'
import type { AvaliacaoType, Avaliacao } from '@/types'
import { inputStyle } from '@/lib/styles'

const ease = [0.32, 0.72, 0, 1] as const

const TYPE_OPTIONS = [
  {
    type: 'link' as AvaliacaoType,
    icon: HiLink,
    label: 'Resposta com link',
    desc: 'A resposta do aluno deve ser uma URL válida.',
  },
  {
    type: 'text' as AvaliacaoType,
    icon: HiPencilSquare,
    label: 'Resposta em texto',
    desc: 'Resposta aberta, máximo de 404 caracteres.',
  },
  {
    type: 'quiz' as AvaliacaoType,
    icon: HiListBullet,
    label: 'Quiz',
    desc: '5 opções de resposta. A primeira é sempre a correta; as demais são embaralhadas para o aluno.',
  },
]

interface Props {
  accentColor: string
  onSave: (av: Omit<Avaliacao, 'id' | 'createdAt'>) => void
  onClose: () => void
}

export function AvaliacaoFormModal({ accentColor, onSave, onClose }: Props) {
  const [type, setType] = useState<AvaliacaoType | null>(null)
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', '', ''])

  const canSave =
    type !== null &&
    question.trim().length > 0 &&
    (type !== 'quiz' || options.every((o) => o.trim().length > 0))

  function handleSave() {
    if (!canSave || !type) return
    onSave({
      type,
      question: question.trim(),
      ...(type === 'quiz' ? { options: options.map((o) => o.trim()) } : {}),
    })
  }

  function updateOption(i: number, value: string) {
    const next = [...options]
    next[i] = value
    setOptions(next)
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
        initial={{ scale: 0.95, y: 8, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 8, opacity: 0 }}
        transition={{ duration: 0.25, ease }}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col"
        style={{ background: 'var(--c-bg-alt)', border: '1px solid var(--c-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 border-b flex-shrink-0"
          style={{ borderColor: 'var(--c-border)' }}
        >
          <h2 className="font-bold text-base" style={{ color: 'var(--c-text)' }}>
            Nova avaliação
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center border"
            style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
          >
            <HiXMark className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {/* Step 1 — type selection */}
          {!type ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
                Escolha o tipo
              </p>
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setType(opt.type)}
                  className="flex items-start gap-3 p-3.5 rounded-xl border text-left transition-opacity hover:opacity-80"
                  style={{ borderColor: 'var(--c-border-md)', background: 'var(--c-bg)' }}
                >
                  <opt.icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>
                      {opt.label}
                    </p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--c-subtle)' }}>
                      {opt.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <>
              {/* Type badge + change link */}
              <div className="flex items-center gap-2">
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{ background: `${accentColor}18`, color: accentColor }}
                >
                  {TYPE_OPTIONS.find((t) => t.type === type)?.label}
                </span>
                <button
                  className="text-xs underline"
                  style={{ color: 'var(--c-subtle)' }}
                  onClick={() => setType(null)}
                >
                  Trocar tipo
                </button>
              </div>

              {/* Question */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
                  Pergunta
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Digite a pergunta..."
                  rows={3}
                  autoFocus
                  className="rounded-xl px-3 py-2.5 text-sm border outline-none resize-none"
                  style={inputStyle}
                />
              </div>

              {/* Quiz options */}
              {type === 'quiz' && (
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
                      Opções de resposta
                    </label>
                    <p className="text-xs mt-1" style={{ color: 'var(--c-faint)' }}>
                      A <strong style={{ color: accentColor }}>Opção 1</strong> é sempre a resposta correta.
                      Na hora do aluno responder, as opções são embaralhadas.
                    </p>
                  </div>
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: i === 0 ? `${accentColor}22` : 'var(--c-border)',
                          color: i === 0 ? accentColor : 'var(--c-subtle)',
                        }}
                      >
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={i === 0 ? 'Resposta correta...' : `Opção ${i + 1}...`}
                        className="flex-1 rounded-xl px-3 py-2 text-sm border outline-none"
                        style={{
                          ...inputStyle,
                          borderColor: i === 0 ? accentColor : 'var(--c-border-md)',
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm border"
                  style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-muted)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity disabled:opacity-40"
                  style={{ background: accentColor, color: '#fff' }}
                >
                  Salvar avaliação
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
