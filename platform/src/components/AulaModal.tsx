'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HiXMark, HiPencilSquare, HiTrash, HiPlus, HiArrowTopRightOnSquare,
  HiCheckCircle, HiXCircle, HiClock,
} from 'react-icons/hi2'
import type { Aula, DriveLink, AttendanceStatus } from '@/types'

const ease = [0.32, 0.72, 0, 1] as const

const STATUS_CONFIG: Record<
  NonNullable<AttendanceStatus>,
  { label: string; color: string; bg: string }
> = {
  present: { label: 'P', color: '#22c55e', bg: '#22c55e18' },
  absent:  { label: 'F', color: '#ef4444', bg: '#ef444418' },
  late:    { label: 'A', color: '#f59e0b', bg: '#f59e0b18' },
}

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })
}

interface Props {
  turmaId: string
  turmaIconColor: string
  date: string
  turmaStartDate: string
  turmaEndDate: string
  aula: Aula | null
  students: string[]
  canEdit: boolean
  currentUserUid: string
  onClose: () => void
  onSaved: () => void
}

interface FormState {
  date: string
  title: string
  description: string
  teacherName: string
  startTime: string
  endTime: string
  driveLinks: DriveLink[]
}

export function AulaModal({
  turmaId, turmaIconColor, date, turmaStartDate, turmaEndDate,
  aula, students, canEdit, currentUserUid,
  onClose, onSaved,
}: Props) {
  const isCreate = !aula
  const [mode, setMode] = useState<'view' | 'edit'>(isCreate ? 'edit' : 'view')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    date: aula?.date ?? date,
    title: aula?.title ?? '',
    description: aula?.description ?? '',
    teacherName: aula?.teacherName ?? '',
    startTime: aula?.startTime ?? '19:00',
    endTime: aula?.endTime ?? '22:00',
    driveLinks: aula?.driveLinks ?? [],
  })

  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    aula?.attendance ?? {}
  )

  const canMarkAttendance = canEdit

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function addLink() {
    setForm((f) => ({ ...f, driveLinks: [...f.driveLinks, { label: '', url: '' }] }))
  }

  function updateLink(i: number, field: keyof DriveLink, value: string) {
    setForm((f) => {
      const links = [...f.driveLinks]
      links[i] = { ...links[i], [field]: value }
      return { ...f, driveLinks: links }
    })
  }

  function removeLink(i: number) {
    setForm((f) => ({ ...f, driveLinks: f.driveLinks.filter((_, j) => j !== i) }))
  }

  async function handleSave() {
    if (!form.title.trim()) return setError('O título é obrigatório.')
    if (!form.startTime || !form.endTime) return setError('Informe o horário.')
    setSaving(true)
    setError(null)

    if (!form.date) return setError('Selecione uma data.')

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      teacherName: form.teacherName.trim(),
      startTime: form.startTime,
      endTime: form.endTime,
      driveLinks: form.driveLinks.filter((l) => l.url.trim()),
      date: form.date,
    }

    const url = isCreate
      ? `/api/turmas/${turmaId}/aulas`
      : `/api/turmas/${turmaId}/aulas/${aula!.id}`

    const res = await fetch(url, {
      method: isCreate ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setSaving(false)
    if (!res.ok) {
      const d = await res.json()
      return setError(d.error ?? 'Erro ao salvar.')
    }
    onSaved()
  }

  async function handleDelete() {
    if (!aula || !confirm('Excluir esta aula?')) return
    setDeleting(true)
    await fetch(`/api/turmas/${turmaId}/aulas/${aula.id}`, { method: 'DELETE' })
    setDeleting(false)
    onSaved()
  }

  async function handleAttendance(email: string, status: AttendanceStatus) {
    const next = attendance[email] === status ? null : status
    const updated = { ...attendance, [email]: next }
    setAttendance(updated)
    if (!aula) return
    await fetch(`/api/turmas/${turmaId}/aulas/${aula.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendance: updated }),
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && mode === 'view') onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
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
          <div className="flex-1 min-w-0 pr-3">
            {mode === 'edit' ? (
              <input
                type="text"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="Título da aula"
                className="w-full text-lg font-bold bg-transparent border-b outline-none pb-1"
                style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
                autoFocus
              />
            ) : (
              <h2 className="text-lg font-bold leading-snug" style={{ color: 'var(--c-text)' }}>
                {aula?.title ?? 'Nova aula'}
              </h2>
            )}
            {mode === 'edit' ? (
              <input
                type="date"
                value={form.date}
                min={turmaStartDate}
                max={turmaEndDate}
                onChange={(e) => setField('date', e.target.value)}
                className="mt-1.5 rounded-lg px-2 py-1 text-xs border outline-none"
                style={{
                  background: 'var(--c-bg)',
                  borderColor: 'var(--c-border-md)',
                  color: 'var(--c-subtle)',
                }}
              />
            ) : (
              <p className="text-xs mt-1 capitalize" style={{ color: 'var(--c-subtle)' }}>
                {fmtDate(aula?.date ?? date)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {mode === 'view' && canEdit && (
              <>
                <button
                  onClick={() => setMode('edit')}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
                  style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
                  title="Editar"
                >
                  <HiPencilSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
                  style={{ borderColor: 'var(--c-border-md)', color: '#ef444480' }}
                  title="Excluir"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
              style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
            >
              <HiXMark className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 p-5 overflow-y-auto">

          {/* Time + Teacher row */}
          <div className="flex flex-col gap-3">
            {mode === 'edit' ? (
              <>
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs" style={{ color: 'var(--c-subtle)' }}>Início</label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => setField('startTime', e.target.value)}
                      className="rounded-xl px-3 py-2 text-sm border outline-none"
                      style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs" style={{ color: 'var(--c-subtle)' }}>Término</label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => setField('endTime', e.target.value)}
                      className="rounded-xl px-3 py-2 text-sm border outline-none"
                      style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--c-subtle)' }}>Professor(a)</label>
                  <input
                    type="text"
                    value={form.teacherName}
                    onChange={(e) => setField('teacherName', e.target.value)}
                    placeholder="Nome do professor"
                    className="rounded-xl px-3 py-2 text-sm border outline-none"
                    style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-1">
                {aula?.teacherName && (
                  <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
                    Prof. {aula.teacherName}
                  </p>
                )}
                <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>
                  {aula?.startTime} – {aula?.endTime}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
              Descrição
            </p>
            {mode === 'edit' ? (
              <textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Sobre o que é esta aula..."
                rows={3}
                className="rounded-xl px-3 py-2.5 text-sm border outline-none resize-none"
                style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--c-text)' }}>
                {aula?.description || <span style={{ color: 'var(--c-faint)' }}>Sem descrição.</span>}
              </p>
            )}
          </div>

          {/* Drive Links */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
                Arquivos
              </p>
              {mode === 'edit' && (
                <button
                  type="button"
                  onClick={addLink}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors"
                  style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
                >
                  <HiPlus className="w-3 h-3" /> Adicionar
                </button>
              )}
            </div>

            {mode === 'edit' ? (
              form.driveLinks.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--c-faint)' }}>Nenhum arquivo adicionado.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {form.driveLinks.map((link, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateLink(i, 'label', e.target.value)}
                        placeholder="Nome do arquivo"
                        className="flex-1 rounded-xl px-3 py-2 text-sm border outline-none"
                        style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(i, 'url', e.target.value)}
                        placeholder="URL do Drive"
                        className="flex-1 rounded-xl px-3 py-2 text-sm border outline-none"
                        style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeLink(i)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border flex-shrink-0"
                        style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-faint)' }}
                      >
                        <HiXMark className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              (aula?.driveLinks ?? []).length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--c-faint)' }}>Nenhum arquivo.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {aula!.driveLinks.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm rounded-xl px-3 py-2 transition-colors"
                        style={{ background: 'var(--c-bg)', color: turmaIconColor }}
                      >
                        <HiArrowTopRightOnSquare className="w-4 h-4 flex-shrink-0" />
                        {link.label || link.url}
                      </a>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>

          {/* Attendance — only in view mode and when aula exists */}
          {mode === 'view' && aula && students.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
                Chamada
              </p>
              <div
                className="rounded-xl overflow-hidden border"
                style={{ borderColor: 'var(--c-border)' }}
              >
                {students.map((email, i) => {
                  const status = attendance[email] ?? null
                  return (
                    <div
                      key={email}
                      className="flex items-center gap-3 px-3 py-2.5"
                      style={{ borderTop: i === 0 ? 'none' : `1px solid var(--c-border)` }}
                    >
                      <span className="flex-1 text-sm truncate" style={{ color: 'var(--c-text)' }}>
                        {email}
                      </span>
                      <div className="flex gap-1 flex-shrink-0">
                        {(['present', 'absent', 'late'] as const).map((s) => {
                          const cfg = STATUS_CONFIG[s]
                          const active = status === s
                          return (
                            <button
                              key={s}
                              onClick={() => canMarkAttendance && handleAttendance(email, s)}
                              disabled={!canMarkAttendance}
                              className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border transition-colors disabled:cursor-default"
                              style={{
                                background: active ? cfg.bg : 'transparent',
                                borderColor: active ? cfg.color : 'var(--c-border-md)',
                                color: active ? cfg.color : 'var(--c-faint)',
                              }}
                              title={s === 'present' ? 'Presente' : s === 'absent' ? 'Falta' : 'Atraso'}
                            >
                              {cfg.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          {/* Actions */}
          {mode === 'edit' && (
            <div className="flex gap-2">
              {!isCreate && (
                <button
                  type="button"
                  onClick={() => { setMode('view'); setError(null) }}
                  className="flex-1 py-2.5 rounded-xl text-sm border"
                  style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-muted)' }}
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity disabled:opacity-50"
                style={{ background: turmaIconColor, color: '#fff' }}
              >
                {saving ? 'Salvando...' : isCreate ? 'Criar aula' : 'Salvar alterações'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
