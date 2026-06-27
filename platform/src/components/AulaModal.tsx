'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiXMark, HiPencilSquare, HiTrash } from 'react-icons/hi2'
import type { Aula, AulaTeacher } from '@/types'
import { todayISO, fmtFullDate } from '@/lib/date-utils'
import { inputStyle } from '@/lib/styles'

const ease = [0.32, 0.72, 0, 1] as const

interface Props {
  turmaId: string
  turmaIconColor: string
  date: string
  turmaStartDate: string
  turmaEndDate: string
  aula: Aula | null
  canEdit: boolean
  isAdmin: boolean
  currentUserUid: string
  initialMode?: 'view' | 'edit'
  onClose: () => void
  onSaved: () => void
}

interface FormState {
  date: string
  title: string
  description: string
  teachers: AulaTeacher[]
  startTime: string
  endTime: string
}

export function AulaModal({
  turmaId, turmaIconColor, date, turmaStartDate, turmaEndDate,
  aula, canEdit, isAdmin, currentUserUid,
  initialMode,
  onClose, onSaved,
}: Props) {
  const isCreate = !aula
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode ?? (isCreate ? 'edit' : 'view'))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    date: aula?.date ?? date,
    title: aula?.title ?? '',
    description: aula?.description ?? '',
    teachers: aula?.teachers ?? [],
    startTime: aula?.startTime ?? '19:00',
    endTime: aula?.endTime ?? '22:00',
  })

  const [availableTeachers, setAvailableTeachers] = useState<AulaTeacher[]>([])

  const minDate = isCreate
    ? (turmaStartDate > todayISO() ? turmaStartDate : todayISO())
    : turmaStartDate

  useEffect(() => {
    if (mode !== 'edit') return
    fetch('/api/users/teachers')
      .then((r) => r.ok ? r.json() : [])
      .then(setAvailableTeachers)
      .catch(() => {})
  }, [mode])

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function addTeacher(uid: string) {
    const t = availableTeachers.find((t) => t.uid === uid)
    if (!t || form.teachers.find((ft) => ft.uid === uid)) return
    setField('teachers', [...form.teachers, { uid: t.uid, name: t.name }])
  }

  function removeTeacher(uid: string) {
    setField('teachers', form.teachers.filter((t) => t.uid !== uid))
  }

  async function handleSave() {
    if (!form.title.trim()) return setError('O título é obrigatório.')
    if (!form.date) return setError('Selecione uma data.')
    if (!form.startTime || !form.endTime) return setError('Informe o horário.')
    setError(null)
    setSaving(true)

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      teachers: form.teachers,
      startTime: form.startTime,
      endTime: form.endTime,
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

  async function handleApprove() {
    if (!aula) return
    setSaving(true)
    await fetch(`/api/turmas/${turmaId}/aulas/${aula.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' }),
    })
    setSaving(false)
    onSaved()
  }

  const isPending = aula?.status === 'pending'

  const unselectedTeachers = availableTeachers.filter(
    (t) => !form.teachers.find((ft) => ft.uid === t.uid)
  )

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
              <div className="flex items-start gap-2 flex-wrap">
                <h2 className="text-lg font-bold leading-snug" style={{ color: 'var(--c-text)' }}>
                  {aula?.title ?? 'Nova aula'}
                </h2>
                {isPending && (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 flex-shrink-0"
                    style={{ background: 'var(--c-warning-soft)', color: 'var(--c-warning)' }}
                  >
                    Pendente
                  </span>
                )}
              </div>
            )}
            {mode === 'edit' ? (
              <input
                type="date"
                value={form.date}
                min={minDate}
                max={turmaEndDate}
                onChange={(e) => setField('date', e.target.value)}
                className="mt-1.5 rounded-lg px-2 py-1 text-xs border outline-none"
                style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
              />
            ) : (
              <p className="text-xs mt-1 capitalize" style={{ color: 'var(--c-subtle)' }}>
                {fmtFullDate(aula?.date ?? date)}
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
                {isAdmin && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
                    style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-danger-strong)' }}
                    title="Excluir"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                )}
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

          {/* Time */}
          <div className="flex gap-3">
            {mode === 'edit' ? (
              <>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs" style={{ color: 'var(--c-subtle)' }}>Início</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setField('startTime', e.target.value)}
                    className="rounded-xl px-3 py-2 text-sm border outline-none"
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs" style={{ color: 'var(--c-subtle)' }}>Término</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setField('endTime', e.target.value)}
                    className="rounded-xl px-3 py-2 text-sm border outline-none"
                    style={inputStyle}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>
                {aula?.startTime} – {aula?.endTime}
              </p>
            )}
          </div>

          {/* Teachers */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
              Professores
            </p>

            {mode === 'edit' ? (
              <>
                {/* Chips */}
                {form.teachers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.teachers.map((t) => (
                      <span
                        key={t.uid}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                        style={{
                          borderColor: turmaIconColor,
                          color: turmaIconColor,
                          background: `${turmaIconColor}12`,
                        }}
                      >
                        {t.name}
                        <button
                          type="button"
                          onClick={() => removeTeacher(t.uid)}
                          className="opacity-70 hover:opacity-100"
                        >
                          <HiXMark className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Dropdown */}
                {unselectedTeachers.length > 0 && (
                  <select
                    value=""
                    onChange={(e) => { addTeacher(e.target.value); e.target.value = '' }}
                    className="rounded-xl px-3 py-2 text-sm border outline-none"
                    style={inputStyle}
                  >
                    <option value="">Adicionar professor...</option>
                    {unselectedTeachers.map((t) => (
                      <option key={t.uid} value={t.uid}>{t.name}</option>
                    ))}
                  </select>
                )}

                {availableTeachers.length === 0 && (
                  <p className="text-xs" style={{ color: 'var(--c-faint)' }}>
                    Nenhum professor cadastrado na plataforma.
                  </p>
                )}
              </>
            ) : (
              aula?.teachers && aula.teachers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {aula.teachers.map((t) => (
                    <span
                      key={t.uid}
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: `${turmaIconColor}12`, color: turmaIconColor }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--c-faint)' }}>Sem professor atribuído.</p>
              )
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
                style={inputStyle}
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap" style={{ color: aula?.description ? 'var(--c-text)' : 'var(--c-faint)' }}>
                {aula?.description || 'Sem descrição.'}
              </p>
            )}
          </div>

          {/* Approve banner */}
          {mode === 'view' && isPending && isAdmin && (
            <div
              className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
              style={{ background: 'var(--c-warning-soft)', border: '1px solid var(--c-warning-strong)' }}
            >
              <p className="text-xs leading-snug" style={{ color: 'var(--c-warning)' }}>
                Esta aula foi criada por um professor e aguarda sua aprovação.
              </p>
              <button
                onClick={handleApprove}
                disabled={saving}
                className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-opacity disabled:opacity-50"
                style={{ background: 'var(--c-warning)', color: 'var(--c-bg)' }}
              >
                {saving ? '...' : 'Aprovar'}
              </button>
            </div>
          )}

          {/* Pending notice for teacher */}
          {mode === 'view' && isPending && !isAdmin && (
            <div
              className="rounded-xl px-4 py-3"
              style={{ background: 'var(--c-warning-soft)', border: '1px solid var(--c-warning-strong)' }}
            >
              <p className="text-xs" style={{ color: 'var(--c-warning)' }}>
                Aula aguardando aprovação do administrador.
              </p>
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
