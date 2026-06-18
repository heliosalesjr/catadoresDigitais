'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconPicker } from '@/components/IconPicker'
import { HiArrowLeft, HiXMark, HiPlus, HiTrash } from 'react-icons/hi2'
import type { Turma } from '@/types'

type FormData = Pick<Turma, 'name' | 'icon' | 'iconColor' | 'startDate' | 'endDate' | 'students'> & { calendarId?: string }

interface Props {
  mode: 'create' | 'edit'
  turmaId?: string
  initialData?: Partial<FormData>
  backHref: string
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

function toInputDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

export function TurmaForm({ mode, turmaId, initialData, backHref }: Props) {
  const router = useRouter()

  const [name, setName] = useState(initialData?.name ?? '')
  const [icon, setIcon] = useState(initialData?.icon ?? 'HiAcademicCap')
  const [iconColor, setIconColor] = useState(initialData?.iconColor ?? '#FFC530')
  const [startDate, setStartDate] = useState(initialData?.startDate ?? '')
  const [endDate, setEndDate] = useState(initialData?.endDate ?? '')
  const [calendarId, setCalendarId] = useState(initialData?.calendarId ?? '')
  const [students, setStudents] = useState<string[]>(initialData?.students ?? [])
  const [studentInput, setStudentInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const maxEndDate = startDate ? toInputDate(addMonths(new Date(startDate), 12)) : undefined
  const isEdit = mode === 'edit'
  const title = isEdit ? 'Editar turma' : 'Nova turma'
  const submitLabel = saving ? (isEdit ? 'Salvando...' : 'Criando...') : (isEdit ? 'Salvar alterações' : 'Criar turma')

  function addStudent() {
    const email = studentInput.trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    if (students.includes(email)) return
    setStudents((prev) => [...prev, email])
    setStudentInput('')
  }

  function removeStudent(email: string) {
    setStudents((prev) => prev.filter((e) => e !== email))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) return setError('Informe o nome da turma.')
    if (!startDate || !endDate) return setError('Informe as datas de início e término.')

    setSaving(true)

    const payload = {
      name: name.trim(),
      icon,
      iconColor,
      startDate,
      endDate,
      calendarId: calendarId.trim() || undefined,
      students,
      ...(isEdit ? {} : { createdBy: '' }),
    }

    const res = await fetch(
      isEdit ? `/api/admin/turmas/${turmaId}` : '/api/admin/turmas',
      {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    const data = await res.json()
    setSaving(false)
    if (!res.ok) return setError(data.error)

    const id = isEdit ? turmaId! : data.id
    router.push(`/dashboard/turmas/${id}`)
  }

  const card = 'rounded-2xl border p-6 flex flex-col gap-3'
  const cardStyle = { background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }
  const inputStyle = { background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }
  const inputClass = 'w-full rounded-xl px-4 py-3 text-sm border outline-none transition-colors'

  return (
    <main className="min-h-screen p-8" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Link
              href={backHref}
              className="w-9 h-9 rounded-full flex items-center justify-center border"
              style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
            >
              <HiArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--c-text)' }}>{title}</h1>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className={card} style={cardStyle}>
            <label className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Nome da turma</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Desenvolvimento Web — Turma A"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div className={card} style={cardStyle}>
            <label className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Ícone e cor</label>
            <IconPicker
              selectedIcon={icon}
              selectedColor={iconColor}
              onIconChange={setIcon}
              onColorChange={setIconColor}
            />
          </div>

          <div className={card} style={{ ...cardStyle, gap: undefined }} >
            <label className="text-sm font-medium mb-1" style={{ color: 'var(--c-text)' }}>Período</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs" style={{ color: 'var(--c-subtle)' }}>Início</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setEndDate('') }}
                  className="rounded-xl px-3 py-2.5 text-sm border outline-none"
                  style={inputStyle}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs" style={{ color: 'var(--c-subtle)' }}>Término (máx. 12 meses)</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={maxEndDate}
                  disabled={!startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-xl px-3 py-2.5 text-sm border outline-none disabled:opacity-40"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div className={card} style={cardStyle}>
            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Google Calendar ID</label>
              <p className="text-xs mt-0.5" style={{ color: 'var(--c-subtle)' }}>
                Opcional. Google Calendar → Configurações da agenda → ID da agenda.
              </p>
            </div>
            <input
              type="text"
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
              placeholder="xxxxx@group.calendar.google.com"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div className={card} style={cardStyle}>
            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Alunos</label>
              <p className="text-xs mt-0.5" style={{ color: 'var(--c-subtle)' }}>Adicione por e-mail.</p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={studentInput}
                onChange={(e) => setStudentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStudent())}
                placeholder="email@exemplo.com"
                className="flex-1 rounded-xl px-4 py-2.5 text-sm border outline-none"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={addStudent}
                className="px-3 py-2.5 rounded-xl border flex items-center gap-1.5 text-sm"
                style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-muted)' }}
              >
                <HiPlus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
            {students.length > 0 && (
              <ul className="flex flex-col gap-1.5 mt-1">
                {students.map((email) => (
                  <li key={email} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'var(--c-bg)', color: 'var(--c-muted)' }}>
                    <span className="text-sm">{email}</span>
                    <button type="button" onClick={() => removeStudent(email)} style={{ color: 'var(--c-faint)' }}>
                      <HiXMark className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--c-danger)' }}>{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-opacity disabled:opacity-50"
            style={{ background: 'var(--c-gold)', color: 'var(--c-bg)' }}
          >
            {submitLabel}
          </button>

          {isEdit && (
            <div
              className="rounded-2xl border p-5 flex flex-col gap-3"
              style={{ borderColor: 'var(--c-danger-strong)', background: 'var(--c-danger-soft)' }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--c-danger)' }}>Zona de perigo</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--c-subtle)' }}>
                  Esta ação é irreversível. A turma e todas as suas aulas serão deletadas permanentemente.
                </p>
              </div>
              {confirmDelete ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setDeleting(true)
                      await fetch(`/api/admin/turmas/${turmaId}`, { method: 'DELETE' })
                      router.push('/dashboard/admin/turmas')
                    }}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity disabled:opacity-50"
                    style={{ background: 'var(--c-danger)', color: 'var(--c-bg)' }}
                  >
                    {deleting ? 'Deletando...' : 'Sim, deletar turma'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm border transition-colors"
                    style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-muted)' }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-2 self-start text-sm px-4 py-2 rounded-xl border transition-colors"
                  style={{ borderColor: 'var(--c-danger-strong)', color: 'var(--c-danger)' }}
                >
                  <HiTrash className="w-4 h-4" />
                  Deletar turma
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </main>
  )
}
