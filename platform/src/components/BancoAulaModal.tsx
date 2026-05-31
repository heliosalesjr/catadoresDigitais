'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiXMark, HiPlus, HiTrash } from 'react-icons/hi2'
import type { BancoAula, AulaTeacher, DriveLink, UserProfile } from '@/types'

const ease = [0.32, 0.72, 0, 1] as const

const inputStyle = {
  background: 'var(--c-bg)',
  borderColor: 'var(--c-border-md)',
  color: 'var(--c-text)',
} as const

interface Props {
  turmaId: string
  turmaIconColor: string
  banco: BancoAula | null
  currentUser: UserProfile | null
  onClose: () => void
  onSaved: () => void
}

interface FormState {
  title: string
  description: string
  teachers: AulaTeacher[]
  driveLinks: DriveLink[]
}

export function BancoAulaModal({ turmaId, turmaIconColor, banco, currentUser, onClose, onSaved }: Props) {
  const isCreate = !banco
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableTeachers, setAvailableTeachers] = useState<AulaTeacher[]>([])

  const [form, setForm] = useState<FormState>(() => {
    if (banco) {
      return {
        title: banco.title,
        description: banco.description,
        teachers: banco.teachers,
        driveLinks: banco.driveLinks,
      }
    }
    const initialTeachers: AulaTeacher[] = []
    if (currentUser?.role === 'teacher') {
      initialTeachers.push({ uid: currentUser.uid, name: currentUser.name })
    }
    return { title: '', description: '', teachers: initialTeachers, driveLinks: [] }
  })

  useEffect(() => {
    fetch('/api/users/teachers')
      .then((r) => r.ok ? r.json() : [])
      .then(setAvailableTeachers)
      .catch(() => {})
  }, [])

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

  function addLink() {
    setField('driveLinks', [...form.driveLinks, { label: '', url: '' }])
  }

  function updateLink(i: number, field: keyof DriveLink, value: string) {
    const links = [...form.driveLinks]
    links[i] = { ...links[i], [field]: value }
    setField('driveLinks', links)
  }

  function removeLink(i: number) {
    setField('driveLinks', form.driveLinks.filter((_, j) => j !== i))
  }

  async function handleSave() {
    if (!form.title.trim()) return setError('O título é obrigatório.')
    setError(null)
    setSaving(true)

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      teachers: form.teachers,
      driveLinks: form.driveLinks.filter((l) => l.url.trim()),
    }

    const url = isCreate
      ? `/api/turmas/${turmaId}/banco`
      : `/api/turmas/${turmaId}/banco/${banco!.id}`

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
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
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
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Título da aula"
              className="w-full text-lg font-bold bg-transparent border-b outline-none pb-1"
              style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
              autoFocus
            />
            <p className="text-xs mt-1" style={{ color: 'var(--c-subtle)' }}>
              Banco de aulas — sem data definida
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center border"
            style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
          >
            <HiXMark className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 p-5 overflow-y-auto">

          {/* Teachers */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
              Professores
            </p>
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
            {availableTeachers.length === 0 && form.teachers.length === 0 && (
              <p className="text-xs" style={{ color: 'var(--c-faint)' }}>
                Nenhum professor cadastrado na plataforma.
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
              Descrição
            </p>
            <textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Sobre o que é esta aula..."
              rows={3}
              className="rounded-xl px-3 py-2.5 text-sm border outline-none resize-none"
              style={inputStyle}
            />
          </div>

          {/* Drive Links */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
                Materiais
              </p>
              <button
                type="button"
                onClick={addLink}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border"
                style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
              >
                <HiPlus className="w-3 h-3" /> Adicionar
              </button>
            </div>
            {form.driveLinks.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--c-faint)' }}>Nenhum material adicionado.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {form.driveLinks.map((link, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => updateLink(i, 'label', e.target.value)}
                      placeholder="Nome do material"
                      className="flex-1 rounded-xl px-3 py-2 text-sm border outline-none"
                      style={inputStyle}
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLink(i, 'url', e.target.value)}
                      placeholder="URL"
                      className="flex-1 rounded-xl px-3 py-2 text-sm border outline-none"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => removeLink(i)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border flex-shrink-0"
                      style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-faint)' }}
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm border"
              style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-muted)' }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity disabled:opacity-50"
              style={{ background: turmaIconColor, color: '#fff' }}
            >
              {saving ? 'Salvando...' : isCreate ? 'Criar aula' : 'Salvar'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
