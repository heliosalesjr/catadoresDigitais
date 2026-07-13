'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TECH_ICONS } from '@/lib/icons'
import { HiPlus, HiArrowLeft, HiTrash, HiArchiveBox, HiArchiveBoxXMark } from 'react-icons/hi2'
import { Tooltip } from '@/components/Tooltip'
import type { Turma } from '@/types'

function fmt(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR')
}

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [archiving, setArchiving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/turmas')
      .then((r) => r.json())
      .then((data) => { setTurmas(data); setLoading(false) })
  }, [])

  async function handleDelete(id: string) {
    setDeleting(id)
    await fetch(`/api/admin/turmas/${id}`, { method: 'DELETE' })
    setTurmas((prev) => prev.filter((t) => t.id !== id))
    setDeleting(null)
    setConfirmDelete(null)
  }

  async function handleToggleArchive(id: string, archived: boolean) {
    setArchiving(id)
    const res = await fetch(`/api/admin/turmas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: !archived }),
    })
    if (res.ok) {
      setTurmas((prev) => prev.map((t) => t.id === id ? { ...t, archived: !archived } : t))
    }
    setArchiving(null)
  }

  return (
    <main className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Tooltip label="Voltar">
              <Link
                href="/dashboard/admin"
                aria-label="Voltar"
                className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors"
                style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
              >
                <HiArrowLeft className="w-4 h-4" />
              </Link>
            </Tooltip>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>Turmas</h2>
          </div>
          <Link
            href="/dashboard/admin/turmas/nova"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: 'var(--c-gold)', color: 'var(--c-bg)' }}
          >
            <HiPlus className="w-4 h-4" />
            Nova turma
          </Link>
        </div>

        {loading ? (
          <p style={{ color: 'var(--c-subtle)' }}>Carregando...</p>
        ) : turmas.length === 0 ? (
          <div
            className="rounded-2xl border p-12 flex flex-col items-center gap-4 text-center"
            style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
          >
            <p className="text-lg font-semibold" style={{ color: 'var(--c-text)' }}>Nenhuma turma criada ainda</p>
            <Link
              href="/dashboard/admin/turmas/nova"
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--c-gold)', color: 'var(--c-bg)' }}
            >
              Criar primeira turma
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {turmas.map((turma) => {
              const iconEntry = TECH_ICONS[turma.icon]
              const Icon = iconEntry?.icon
              const isConfirming = confirmDelete === turma.id

              return (
                <div
                  key={turma.id}
                  className="relative rounded-2xl border flex flex-col transition-colors"
                  style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
                >
                  {/* Clickable area */}
                  <Link
                    href={`/dashboard/turmas/${turma.id}`}
                    className="flex flex-col gap-4 p-6 flex-1"
                  >
                    <div className="flex items-center gap-3 pr-14">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${turma.iconColor}20`, opacity: turma.archived ? 0.5 : 1 }}
                      >
                        {Icon && <Icon className="w-6 h-6" style={{ color: turma.iconColor }} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate" style={{ color: 'var(--c-text)' }}>{turma.name}</p>
                          {turma.archived && (
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                              style={{ background: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
                            >
                              Arquivada
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--c-subtle)' }}>
                          {turma.students.length} aluno{turma.students.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div
                      className="text-xs pt-3 border-t flex justify-between"
                      style={{ borderColor: 'var(--c-border)', color: 'var(--c-subtle)' }}
                    >
                      <span>{fmt(turma.startDate)}</span>
                      <span>→</span>
                      <span>{fmt(turma.endDate)}</span>
                    </div>
                  </Link>

                  {/* Delete controls */}
                  {isConfirming ? (
                    <div
                      className="flex items-center justify-end gap-2 px-4 py-3 border-t"
                      style={{ borderColor: 'var(--c-border)' }}
                    >
                      <span className="text-xs mr-auto" style={{ color: 'var(--c-subtle)' }}>Deletar turma?</span>
                      <button
                        onClick={() => handleDelete(turma.id)}
                        disabled={deleting === turma.id}
                        className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50"
                        style={{ borderColor: 'var(--c-danger)', color: 'var(--c-danger)' }}
                      >
                        {deleting === turma.id ? '...' : 'Confirmar'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors"
                        style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <Tooltip label={turma.archived ? 'Desarquivar turma' : 'Arquivar turma'}>
                        <button
                          onClick={() => handleToggleArchive(turma.id, !!turma.archived)}
                          disabled={archiving === turma.id}
                          aria-label={turma.archived ? 'Desarquivar turma' : 'Arquivar turma'}
                          className="w-7 h-7 rounded-lg flex items-center justify-center border transition-colors disabled:opacity-50"
                          style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-faint)', background: 'var(--c-bg-alt)' }}
                        >
                          {turma.archived ? <HiArchiveBoxXMark className="w-3.5 h-3.5" /> : <HiArchiveBox className="w-3.5 h-3.5" />}
                        </button>
                      </Tooltip>
                      <Tooltip label="Deletar turma">
                        <button
                          onClick={() => setConfirmDelete(turma.id)}
                          aria-label="Deletar turma"
                          className="w-7 h-7 rounded-lg flex items-center justify-center border transition-colors"
                          style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-faint)', background: 'var(--c-bg-alt)' }}
                        >
                          <HiTrash className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
