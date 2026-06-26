'use client'

import { Fragment, use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { HiArrowLeft, HiClipboardDocumentCheck, HiClock, HiAcademicCap, HiUserGroup, HiCheck, HiXMark, HiArrowDownTray } from 'react-icons/hi2'
import { TECH_ICONS } from '@/lib/icons'
import type { Turma, AttendanceStatus } from '@/types'

type Modo = 'geral' | 'periodo'

interface RelatorioAula {
  aulaId: string
  title: string
  date: string
  duracaoMinutos: number
  totalAvaliacoes: number
  alunosConcluiram: number
  percentualConclusao: number | null
  attendance: Record<string, AttendanceStatus>
  completed: string[]
}

interface Relatorio {
  periodo: { from: string; to: string }
  students: string[]
  studentNames: Record<string, string>
  totalAlunos: number
  totalAulas: number
  totalDuracaoMinutos: number
  percentualPresenca: number | null
  aulas: RelatorioAula[]
}

const ATTENDANCE_LABEL: Record<string, string> = { present: 'P', absent: 'F', late: 'A' }
const ATTENDANCE_COLOR: Record<string, string> = {
  present: 'var(--c-success)', absent: 'var(--c-danger)', late: 'var(--c-warning)',
}

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtDateShort(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function fmtDuracao(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

const ATTENDANCE_FULL: Record<string, string> = { present: 'Presente', absent: 'Falta', late: 'Atrasado' }

function downloadCSV(turma: Turma, relatorio: Relatorio) {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`

  const aulaHeaders = relatorio.aulas.flatMap((a) => [
    escape(`${fmtDateShort(a.date)} ${a.title} - Presença`),
    ...(a.totalAvaliacoes > 0 ? [escape(`${fmtDateShort(a.date)} ${a.title} - Conclusão`)] : []),
  ])

  const header = ['Aluno', 'Email', ...aulaHeaders].map(escape).join(',')

  const rows = relatorio.students.map((email) => {
    const name = relatorio.studentNames[email] ?? ''
    const cells = relatorio.aulas.flatMap((a) => {
      const status = a.attendance[email]
      const presenca = status ? ATTENDANCE_FULL[status] ?? status : ''
      if (a.totalAvaliacoes === 0) return [escape(presenca)]
      const concluiu = a.completed.includes(email) ? 'Concluiu' : 'Não concluiu'
      return [escape(presenca), escape(concluiu)]
    })
    return [escape(name), escape(email), ...cells].join(',')
  })

  const periodo = `${relatorio.periodo.from}_${relatorio.periodo.to}`
  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `relatorio_${turma.name.replace(/\s+/g, '_')}_${periodo}.csv`
  a.click()
  URL.revokeObjectURL(url)
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
      <div className="max-w-6xl mx-auto">
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
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold truncate" style={{ color: 'var(--c-text)' }}>Relatório · {turma.name}</h2>
            <p className="text-xs" style={{ color: 'var(--c-subtle)' }}>
              {fmtDate(turma.startDate)} → {fmtDate(turma.endDate)}
            </p>
          </div>
          {relatorio && (
            <button
              onClick={() => downloadCSV(turma, relatorio)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-colors flex-shrink-0"
              style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)', background: 'transparent' }}
              title="Baixar relatório CSV"
            >
              <HiArrowDownTray className="w-4 h-4" />
              <span className="hidden sm:inline">Baixar CSV</span>
            </button>
          )}
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
                  label: 'Presença média',
                  value: relatorio.percentualPresenca === null ? '—' : `${relatorio.percentualPresenca}%`,
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

            {/* Aluno × Aula grid */}
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--c-border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Aluno × Aula</p>
              </div>

              {relatorio.aulas.length === 0 || relatorio.students.length === 0 ? (
                <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--c-faint)' }}>
                  {relatorio.aulas.length === 0 ? 'Nenhuma aula no período selecionado.' : 'Nenhum aluno matriculado.'}
                </p>
              ) : (
                <div className="overflow-auto max-h-[70vh]">
                  <table className="border-collapse text-xs w-full">
                    <thead>
                      <tr>
                        <th
                          rowSpan={2}
                          className="sticky left-0 top-0 z-30 px-3 py-2 text-left font-semibold whitespace-nowrap"
                          style={{ background: 'var(--c-bg-alt)', borderBottom: '1px solid var(--c-border)', borderRight: '1px solid var(--c-border)' }}
                        >
                          Aluno
                        </th>
                        {relatorio.aulas.map((a) => (
                          <th
                            key={a.aulaId}
                            colSpan={2}
                            className="sticky top-0 z-10 px-2 py-1.5 text-center font-medium whitespace-nowrap"
                            style={{ background: 'var(--c-bg-alt)', borderBottom: '1px solid var(--c-border)', borderLeft: '1px solid var(--c-border)', color: 'var(--c-subtle)' }}
                            title={a.title}
                          >
                            {fmtDateShort(a.date)}
                          </th>
                        ))}
                      </tr>
                      <tr>
                        {relatorio.aulas.map((a) => (
                          <Fragment key={a.aulaId}>
                            <th
                              className="sticky top-[29px] z-10 w-9 px-1 py-1 text-center font-normal"
                              style={{ background: 'var(--c-bg-alt)', borderBottom: '1px solid var(--c-border)', borderLeft: '1px solid var(--c-border)', color: 'var(--c-faint)' }}
                              title="Presença"
                            >
                              P
                            </th>
                            <th
                              className="sticky top-[29px] z-10 w-9 px-1 py-1 text-center font-normal"
                              style={{ background: 'var(--c-bg-alt)', borderBottom: '1px solid var(--c-border)', color: 'var(--c-faint)' }}
                              title="Conclusão das atividades"
                            >
                              ✓
                            </th>
                          </Fragment>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {relatorio.students.map((email, i) => {
                        const name = relatorio.studentNames[email]
                        return (
                        <tr key={email}>
                          <td
                            className="sticky left-0 z-20 px-3 py-1.5 max-w-[220px]"
                            title={email}
                            style={{
                              background: 'var(--c-bg-alt)',
                              borderRight: '1px solid var(--c-border)',
                              borderTop: i === 0 ? 'none' : '1px solid var(--c-border)',
                            }}
                          >
                            {name ? (
                              <>
                                <p className="truncate font-medium" style={{ color: 'var(--c-text)' }}>{name}</p>
                                <p className="truncate text-[10px]" style={{ color: 'var(--c-faint)' }}>{email}</p>
                              </>
                            ) : (
                              <p className="truncate" style={{ color: 'var(--c-text)' }}>{email}</p>
                            )}
                          </td>
                          {relatorio.aulas.map((a) => {
                            const status = a.attendance[email] ?? null
                            const concluiu = a.totalAvaliacoes > 0 ? a.completed.includes(email) : null
                            return (
                              <Fragment key={a.aulaId}>
                                <td
                                  className="text-center py-1.5"
                                  style={{ borderLeft: '1px solid var(--c-border)', borderTop: i === 0 ? 'none' : '1px solid var(--c-border)' }}
                                >
                                  {status ? (
                                    <span className="font-bold" style={{ color: ATTENDANCE_COLOR[status] }}>
                                      {ATTENDANCE_LABEL[status]}
                                    </span>
                                  ) : (
                                    <span style={{ color: 'var(--c-faint)' }}>—</span>
                                  )}
                                </td>
                                <td
                                  className="text-center py-1.5"
                                  style={{ borderTop: i === 0 ? 'none' : '1px solid var(--c-border)' }}
                                >
                                  {concluiu === null ? (
                                    <span style={{ color: 'var(--c-faint)' }}>—</span>
                                  ) : concluiu ? (
                                    <HiCheck className="w-3.5 h-3.5 inline" style={{ color: 'var(--c-success)' }} />
                                  ) : (
                                    <HiXMark className="w-3.5 h-3.5 inline" style={{ color: 'var(--c-danger)' }} />
                                  )}
                                </td>
                              </Fragment>
                            )
                          })}
                        </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex items-center gap-4 px-4 py-2.5 border-t text-[11px]" style={{ borderColor: 'var(--c-border)', color: 'var(--c-faint)' }}>
                <span><b style={{ color: 'var(--c-success)' }}>P</b> presente · <b style={{ color: 'var(--c-danger)' }}>F</b> falta</span>
                <span><HiCheck className="w-3 h-3 inline" style={{ color: 'var(--c-success)' }} /> concluiu todas as atividades · <HiXMark className="w-3 h-3 inline" style={{ color: 'var(--c-danger)' }} /> não concluiu</span>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
