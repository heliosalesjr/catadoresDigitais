'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { HiArrowLeft, HiClipboardDocumentCheck, HiClock, HiAcademicCap, HiUserGroup } from 'react-icons/hi2'
import { TECH_ICONS } from '@/lib/icons'
import type { Turma } from '@/types'

type Modo = 'geral' | 'periodo'

interface RelatorioAula {
  aulaId: string
  title: string
  date: string
  duracaoMinutos: number
  totalAvaliacoes: number
  alunosConcluiram: number
  percentualConclusao: number | null
}

interface Relatorio {
  periodo: { from: string; to: string }
  totalAlunos: number
  totalAulas: number
  totalDuracaoMinutos: number
  mediaConclusao: number | null
  aulas: RelatorioAula[]
}

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtDuracao(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export default function RelatorioTurmaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [turma, setTurma] = useState<Turma | null>(null)
  const [modo, setModo] = useState<Modo>('geral')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/turmas/${id}`)
      .then((r) => r.json())
      .then((data: Turma) => {
        setTurma(data)
        setFrom(data.startDate)
        setTo(data.endDate)
      })
  }, [id])

  const fetchRelatorio = useCallback((query: string) => {
    setLoading(true)
    fetch(`/api/admin/turmas/${id}/relatorio${query}`)
      .then((r) => r.json())
      .then(setRelatorio)
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!turma) return
    if (modo === 'geral') {
      fetchRelatorio('')
    } else if (from && to) {
      fetchRelatorio(`?from=${from}&to=${to}`)
    }
  }, [turma, modo, from, to, fetchRelatorio])

  if (!turma) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--c-bg)' }}>
        <p style={{ color: 'var(--c-subtle)' }}>Carregando...</p>
      </div>
    )
  }

  const iconEntry = TECH_ICONS[turma.icon]
  const Icon = iconEntry?.icon

  return (
    <main className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/dashboard/turmas/${id}`}
            className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors flex-shrink-0"
            style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
          >
            <HiArrowLeft className="w-4 h-4" />
          </Link>
          {Icon && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${turma.iconColor}20` }}
            >
              <Icon className="w-5 h-5" style={{ color: turma.iconColor }} />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate" style={{ color: 'var(--c-text)' }}>Relatório · {turma.name}</h2>
            <p className="text-xs" style={{ color: 'var(--c-subtle)' }}>
              {fmtDate(turma.startDate)} → {fmtDate(turma.endDate)}
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {([
            { key: 'geral' as const, label: 'Geral completo' },
            { key: 'periodo' as const, label: 'Período específico' },
          ]).map(({ key, label }) => {
            const active = modo === key
            return (
              <button
                key={key}
                onClick={() => setModo(key)}
                className="px-3.5 py-2 rounded-xl text-sm font-medium border transition-colors"
                style={{
                  background: active ? turma.iconColor : 'transparent',
                  color: active ? '#fff' : 'var(--c-subtle)',
                  borderColor: active ? turma.iconColor : 'var(--c-border-md)',
                }}
              >
                {label}
              </button>
            )
          })}

          {modo === 'periodo' && (
            <div className="flex items-center gap-2 ml-1">
              <input
                type="date"
                value={from}
                min={turma.startDate}
                max={to || turma.endDate}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-lg px-2.5 py-1.5 text-sm border outline-none"
                style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
              />
              <span style={{ color: 'var(--c-faint)' }}>→</span>
              <input
                type="date"
                value={to}
                min={from || turma.startDate}
                max={turma.endDate}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-lg px-2.5 py-1.5 text-sm border outline-none"
                style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
              />
            </div>
          )}
        </div>

        {loading || !relatorio ? (
          <p style={{ color: 'var(--c-subtle)' }}>Carregando relatório...</p>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {([
                { icon: HiClipboardDocumentCheck, label: 'Aulas no período', value: String(relatorio.totalAulas) },
                { icon: HiClock, label: 'Duração total', value: fmtDuracao(relatorio.totalDuracaoMinutos) },
                { icon: HiUserGroup, label: 'Alunos matriculados', value: String(relatorio.totalAlunos) },
                {
                  icon: HiAcademicCap,
                  label: 'Conclusão média',
                  value: relatorio.mediaConclusao === null ? '—' : `${relatorio.mediaConclusao}%`,
                },
              ]).map(({ icon: CardIcon, label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl border p-4 flex flex-col gap-2"
                  style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
                >
                  <CardIcon className="w-4 h-4" style={{ color: turma.iconColor }} />
                  <p className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>{value}</p>
                  <p className="text-xs" style={{ color: 'var(--c-subtle)' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Per-aula breakdown */}
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--c-border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Aulas no período</p>
              </div>

              {relatorio.aulas.length === 0 ? (
                <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--c-faint)' }}>
                  Nenhuma aula no período selecionado.
                </p>
              ) : (
                relatorio.aulas.map((a, i) => (
                  <div
                    key={a.aulaId}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderTop: i === 0 ? 'none' : `1px solid var(--c-border)` }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--c-text)' }}>{a.title}</p>
                      <p className="text-xs capitalize" style={{ color: 'var(--c-subtle)' }}>
                        {fmtDate(a.date)} · {fmtDuracao(a.duracaoMinutos)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {a.totalAvaliacoes === 0 ? (
                        <span className="text-xs" style={{ color: 'var(--c-faint)' }}>Sem avaliações</span>
                      ) : (
                        <>
                          <p className="text-sm font-bold" style={{ color: turma.iconColor }}>
                            {a.alunosConcluiram}/{relatorio.totalAlunos}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--c-subtle)' }}>
                            concluíram ({a.percentualConclusao}%)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
