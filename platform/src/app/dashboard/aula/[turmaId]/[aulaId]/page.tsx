'use client'

import { useState, useEffect, useMemo } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { HiArrowLeft, HiArrowTopRightOnSquare, HiCheckCircle } from 'react-icons/hi2'
import type { Aula, Avaliacao, Material, Turma } from '@/types'
import { parseLocalDate, fmtFullDate } from '@/lib/date-utils'

const TEXT_LIMIT = 404

function isValidUrl(s: string) {
  try { return Boolean(new URL(s)) } catch { return false }
}

function useShuffledOptions(avaliacoes: Avaliacao[]) {
  return useMemo(() => {
    const out: Record<string, string[]> = {}
    for (const av of avaliacoes) {
      if (av.type === 'quiz' && av.options?.length === 5) {
        const shuffled = [...av.options]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        out[av.id] = shuffled
      }
    }
    return out
  }, [avaliacoes])
}

function isAulaActive(aula: Aula): boolean {
  if (!aula.startTime || !aula.endTime) return false
  const [y, m, d] = aula.date.split('-').map(Number)
  const [sh, sm] = aula.startTime.split(':').map(Number)
  const [eh, em] = aula.endTime.split(':').map(Number)
  const now = new Date()
  return now >= new Date(y, m - 1, d, sh, sm) && now <= new Date(y, m - 1, d, eh, em)
}

function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    let id: string | null = null
    if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1).split('?')[0]
    else if (u.hostname.includes('youtube.com')) id = u.searchParams.get('v')
    return id ? `https://www.youtube.com/embed/${id}?rel=0` : null
  } catch { return null }
}

function getDriveEmbedUrl(url: string): string | null {
  try {
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`
    const openId = new URL(url).searchParams.get('id')
    if (openId && url.includes('drive.google.com')) return `https://drive.google.com/file/d/${openId}/preview`
    return null
  } catch { return null }
}

function getDocsEmbedUrl(url: string): string | null {
  try {
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (!m) return null
    const id = m[1]
    if (url.includes('/presentation/')) return `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false`
    if (url.includes('/document/')) return `https://docs.google.com/document/d/${id}/preview`
    if (url.includes('/spreadsheets/')) return `https://docs.google.com/spreadsheets/d/${id}/htmlembed`
    return null
  } catch { return null }
}

type EmbedKind = 'youtube' | 'drive' | 'docs' | 'link'

function resolveEmbed(url: string): { kind: EmbedKind; embedUrl: string | null } {
  const yt = getYoutubeEmbedUrl(url)
  if (yt) return { kind: 'youtube', embedUrl: yt }
  const drive = getDriveEmbedUrl(url)
  if (drive) return { kind: 'drive', embedUrl: drive }
  const docs = getDocsEmbedUrl(url)
  if (docs) return { kind: 'docs', embedUrl: docs }
  return { kind: 'link', embedUrl: null }
}

// ── MaterialBlock ─────────────────────────────────────────────────────────────

function MaterialBlock({ link, accentColor }: { link: Material; accentColor: string }) {
  if (link.type === 'text') {
    return (
      <div
        className="rounded-2xl border px-4 py-3.5"
        style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
      >
        {link.label && link.label !== 'Bloco de texto' && (
          <p className="text-base font-semibold mb-2" style={{ color: 'var(--c-subtle)' }}>
            {link.label}
          </p>
        )}
        <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--c-text)' }}>
          {link.content}
        </p>
      </div>
    )
  }

  const { kind, embedUrl } = resolveEmbed(link.url ?? '')

  if (embedUrl) {
    const isVideo = kind === 'youtube'
    return (
      <div className="flex flex-col gap-2">
        {link.label && (
          <p className="text-base font-semibold" style={{ color: 'var(--c-subtle)' }}>
            {link.label}
          </p>
        )}
        <div
          className={`w-full rounded-2xl overflow-hidden border ${isVideo ? 'aspect-video' : ''}`}
          style={{ borderColor: 'var(--c-border)', ...(isVideo ? {} : { height: '520px' }) }}
        >
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    )
  }

  return (
    <a
      href={link.url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-opacity hover:opacity-75"
      style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accentColor}15`, color: accentColor }}
      >
        <HiArrowTopRightOnSquare className="w-[1.125rem] h-[1.125rem]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold truncate" style={{ color: 'var(--c-text)' }}>
          {link.label || link.url}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--c-faint)' }}>
          {link.url}
        </p>
      </div>
      <HiArrowTopRightOnSquare className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--c-faint)' }} />
    </a>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ModoAulaPage({
  params,
}: {
  params: Promise<{ turmaId: string; aulaId: string }>
}) {
  const { turmaId, aulaId } = use(params)
  const { user } = useAuth()
  const router = useRouter()

  const [turma, setTurma] = useState<Turma | null>(null)
  const [aula, setAula] = useState<Aula | null>(null)
  const [loading, setLoading] = useState(true)

  const [chamadaCode, setChamadaCode] = useState('')
  const [chamadaState, setChamadaState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [chamadaError, setChamadaError] = useState<string | null>(null)

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [avalSubmitting, setAvalSubmitting] = useState(false)
  const [avalSubmitted, setAvalSubmitted] = useState(false)
  const [avalError, setAvalError] = useState<string | null>(null)

  const avaliacoes = aula?.avaliacoes ?? []
  const shuffledOptions = useShuffledOptions(avaliacoes)

  useEffect(() => {
    async function load() {
      const [tr, ar, rr] = await Promise.all([
        fetch(`/api/turmas/${turmaId}`),
        fetch(`/api/turmas/${turmaId}/aulas/${aulaId}`),
        fetch(`/api/turmas/${turmaId}/aulas/${aulaId}/respostas`),
      ])
      if (tr.ok) setTurma(await tr.json())
      if (ar.ok) setAula(await ar.json())
      if (rr.ok) {
        const resposta = await rr.json()
        if (resposta?.answers) {
          setAnswers(resposta.answers)
          setAvalSubmitted(true)
        }
      }
      setLoading(false)
    }
    load()
  }, [turmaId, aulaId])

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p style={{ color: 'var(--c-subtle)' }}>Carregando...</p>
      </main>
    )
  }

  if (!aula || !turma) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p style={{ color: 'var(--c-subtle)' }}>Aula não encontrada.</p>
      </main>
    )
  }

  const canEdit = user?.role === 'admin' || user?.role === 'teacher'
  const userEmail = user?.email

  async function submitChamada() {
    if (chamadaCode.length !== 4 || chamadaState === 'loading') return
    setChamadaState('loading')
    setChamadaError(null)
    const res = await fetch(`/api/turmas/${turmaId}/aulas/${aulaId}/chamada`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: chamadaCode.trim() }),
    })
    if (res.ok) {
      setChamadaState('ok')
      const ar = await fetch(`/api/turmas/${turmaId}/aulas/${aulaId}`)
      if (ar.ok) setAula(await ar.json())
    } else {
      const d = await res.json()
      setChamadaError(d.error ?? 'Erro ao registrar presença.')
      setChamadaState('error')
    }
  }

  async function submitAvaliacoes() {
    setAvalSubmitting(true)
    setAvalError(null)
    const res = await fetch(`/api/turmas/${turmaId}/aulas/${aulaId}/respostas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
    setAvalSubmitting(false)
    if (res.ok) {
      setAvalSubmitted(true)
    } else {
      setAvalError('Erro ao enviar respostas. Tente novamente.')
    }
  }

  const allAnswered = avaliacoes.length > 0 && avaliacoes.every((av) => {
    const ans = answers[av.id] ?? ''
    if (av.type === 'link') return isValidUrl(ans)
    return ans.trim().length > 0
  })

  const aulaDate = parseLocalDate(aula.date)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const unlockDate = new Date(aulaDate); unlockDate.setDate(aulaDate.getDate() - 7)
  const materialsLocked = !canEdit && aulaDate > today && unlockDate > today

  const alreadyPresent = userEmail
    ? aula.attendance?.[userEmail] === 'present' || aula.attendance?.[userEmail] === 'late'
    : false
  const aulaAtiva = isAulaActive(aula)
  const accentColor = turma.iconColor

  return (
    <main className="max-w-2xl mx-auto px-5 py-8 flex flex-col gap-10">

      {/* Top nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
          style={{ color: 'var(--c-subtle)' }}
        >
          <HiArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: `${accentColor}18`, color: accentColor }}
        >
          {turma.name}
        </span>
      </div>

      {/* Hero */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold leading-tight" style={{ color: 'var(--c-text)' }}>
          {aula.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-base" style={{ color: 'var(--c-subtle)' }}>
          <span className="capitalize">{fmtFullDate(aula.date)}</span>
          {aula.startTime && (
            <>
              <span style={{ color: 'var(--c-faint)' }}>·</span>
              <span>{aula.startTime}{aula.endTime ? ` – ${aula.endTime}` : ''}</span>
            </>
          )}
        </div>
        {aula.teachers && aula.teachers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {aula.teachers.map((t) => (
              <span
                key={t.uid}
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${accentColor}12`, color: accentColor }}
              >
                {t.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="w-full h-px" style={{ background: 'var(--c-border)' }} />

      {/* Description */}
      {aula.description && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--c-subtle)' }}>
            Sobre esta aula
          </p>
          <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--c-text)' }}>
            {aula.description}
          </p>
        </div>
      )}

      {aula.description && <div className="w-full h-px" style={{ background: 'var(--c-border)' }} />}

      {/* Materials */}
      {materialsLocked ? (
        <div
          className="rounded-2xl px-5 py-8 text-center border"
          style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>
            Materiais ainda não disponíveis
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--c-subtle)' }}>
            Disponível a partir de {unlockDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}.
          </p>
        </div>
      ) : (aula.driveLinks ?? []).length > 0 ? (
        <div className="flex flex-col gap-6">
          {aula.driveLinks.map((link, i) => (
            <MaterialBlock key={i} link={link} accentColor={accentColor} />
          ))}
        </div>
      ) : (
        <p className="text-sm" style={{ color: 'var(--c-faint)' }}>
          Nenhum material adicionado para esta aula.
        </p>
      )}

      {/* Avaliações */}
      {!canEdit && avaliacoes.length > 0 && (
        <>
          <div className="w-full h-px" style={{ background: 'var(--c-border)' }} />
          <div className="flex flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--c-subtle)' }}>
              Avaliações
            </p>

            {avaliacoes.map((av, i) => {
              const ans = answers[av.id] ?? ''
              const opts = shuffledOptions[av.id]
              const nearLimit = av.type === 'text' && ans.length > TEXT_LIMIT * 0.85

              return (
                <div key={av.id} className="flex flex-col gap-3">
                  {/* Question header */}
                  <div className="flex items-start gap-2.5">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ background: `${accentColor}20`, color: accentColor }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-base font-semibold leading-snug pt-0.5" style={{ color: 'var(--c-text)' }}>
                      {av.question}
                    </p>
                  </div>

                  {/* Link */}
                  {av.type === 'link' && (
                    <input
                      type="url"
                      value={ans}
                      onChange={(e) => !avalSubmitted && setAnswers((p) => ({ ...p, [av.id]: e.target.value }))}
                      placeholder="https://..."
                      disabled={avalSubmitted}
                      className="rounded-xl px-3 py-2.5 text-base border outline-none disabled:opacity-60"
                      style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                    />
                  )}

                  {/* Text */}
                  {av.type === 'text' && (
                    <div className="flex flex-col gap-1">
                      <textarea
                        value={ans}
                        onChange={(e) => {
                          if (avalSubmitted || e.target.value.length > TEXT_LIMIT) return
                          setAnswers((p) => ({ ...p, [av.id]: e.target.value }))
                        }}
                        placeholder="Digite sua resposta..."
                        rows={4}
                        disabled={avalSubmitted}
                        className="rounded-xl px-3 py-2.5 text-base border outline-none resize-none disabled:opacity-60"
                        style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                      />
                      <div className="flex justify-between px-1">
                        <span className="text-xs" style={{ color: 'var(--c-faint)' }}>Máximo {TEXT_LIMIT} caracteres</span>
                        <span className="text-xs font-semibold tabular-nums" style={{ color: nearLimit ? 'var(--c-danger)' : 'var(--c-faint)' }}>
                          {TEXT_LIMIT - ans.length}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Quiz */}
                  {av.type === 'quiz' && opts && (
                    <div className="flex flex-col gap-2">
                      {opts.map((opt, j) => {
                        const selected = ans === opt
                        return (
                          <button
                            key={j}
                            onClick={() => !avalSubmitted && setAnswers((p) => ({ ...p, [av.id]: opt }))}
                            disabled={avalSubmitted}
                            className="text-left px-3.5 py-2.5 rounded-xl border text-base transition-colors disabled:cursor-default"
                            style={{
                              borderColor: selected ? accentColor : 'var(--c-border)',
                              background: selected ? `${accentColor}12` : 'transparent',
                              color: selected ? accentColor : 'var(--c-text)',
                            }}
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

            {/* Submit */}
            {avalSubmitted ? (
              <div className="flex items-center gap-2">
                <HiCheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--c-success)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--c-success)' }}>
                  Respostas enviadas
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={submitAvaliacoes}
                  disabled={!allAnswered || avalSubmitting}
                  className="self-start px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity disabled:opacity-40"
                  style={{ background: accentColor, color: '#fff' }}
                >
                  {avalSubmitting ? 'Enviando...' : 'Enviar respostas'}
                </button>
                {avalError && <p className="text-xs" style={{ color: 'var(--c-danger)' }}>{avalError}</p>}
                {!allAnswered && (
                  <p className="text-xs" style={{ color: 'var(--c-faint)' }}>
                    Responda todas as questões para enviar.
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Chamada — students only */}
      {!canEdit && (
        <>
          <div className="w-full h-px" style={{ background: 'var(--c-border)' }} />
          <div className="flex flex-col gap-3 pb-8">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--c-subtle)' }}>
              Chamada
            </p>
            {alreadyPresent || chamadaState === 'ok' ? (
              <div className="flex items-center gap-2">
                <HiCheckCircle className="w-5 h-5" style={{ color: 'var(--c-success)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--c-success)' }}>
                  Presença registrada
                </span>
              </div>
            ) : !aulaAtiva ? (
              <p className="text-sm" style={{ color: 'var(--c-faint)' }}>
                Disponível somente durante o horário da aula.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 max-w-xs">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={chamadaCode}
                    onChange={(e) => {
                      setChamadaCode(e.target.value.replace(/\D/g, ''))
                      setChamadaState('idle')
                      setChamadaError(null)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && submitChamada()}
                    placeholder="Código de 4 dígitos"
                    className="flex-1 rounded-xl px-3 py-2.5 text-sm border outline-none font-mono tracking-widest"
                    style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                  />
                  <button
                    onClick={submitChamada}
                    disabled={chamadaCode.length !== 4 || chamadaState === 'loading'}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity disabled:opacity-40"
                    style={{ background: accentColor, color: '#fff' }}
                  >
                    {chamadaState === 'loading' ? '...' : 'Confirmar'}
                  </button>
                </div>
                {chamadaState === 'error' && chamadaError && (
                  <p className="text-xs" style={{ color: 'var(--c-danger)' }}>{chamadaError}</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  )
}
