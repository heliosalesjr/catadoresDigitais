'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconPicker } from '@/components/IconPicker'
import { useTheme } from '@/context/ThemeContext'
import { HiOutlineSun, HiOutlineMoon, HiArrowLeft, HiXMark, HiPlus } from 'react-icons/hi2'

function addMonths(date: Date, n: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

function toInputDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

export default function NovaTurmaPage() {
  const { isDark, toggle } = useTheme()
  const router = useRouter()

  const [name, setName] = useState('')
  const [icon, setIcon] = useState('HiAcademicCap')
  const [iconColor, setIconColor] = useState('#FFC530')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [calendarId, setCalendarId] = useState('')
  const [students, setStudents] = useState<string[]>([])
  const [studentInput, setStudentInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const maxEndDate = startDate ? toInputDate(addMonths(new Date(startDate), 12)) : undefined

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
    const res = await fetch('/api/admin/turmas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        icon,
        iconColor,
        startDate,
        endDate,
        calendarId: calendarId.trim() || undefined,
        students,
        createdBy: '',
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) return setError(data.error)
    router.push(`/dashboard/turmas/${data.id}`)
  }

  return (
    <main className="min-h-screen p-8" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/admin/turmas"
              className="w-9 h-9 rounded-full flex items-center justify-center border"
              style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
            >
              <HiArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--c-text)' }}>Nova turma</h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--c-subtle)' }}>Catadores Digitais</p>
            </div>
          </div>
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full flex items-center justify-center border"
            style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
          >
            {isDark ? <HiOutlineSun className="w-4 h-4" /> : <HiOutlineMoon className="w-4 h-4" />}
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Nome */}
          <div className="rounded-2xl border p-6 flex flex-col gap-3" style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}>
            <label className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Nome da turma</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Desenvolvimento Web — Turma A"
              className="w-full rounded-xl px-4 py-3 text-sm border outline-none transition-colors"
              style={{
                background: 'var(--c-bg)',
                borderColor: 'var(--c-border-md)',
                color: 'var(--c-text)',
              }}
            />
          </div>

          {/* Ícone */}
          <div className="rounded-2xl border p-6 flex flex-col gap-3" style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}>
            <label className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Ícone e cor</label>
            <IconPicker
              selectedIcon={icon}
              selectedColor={iconColor}
              onIconChange={setIcon}
              onColorChange={setIconColor}
            />
          </div>

          {/* Datas */}
          <div className="rounded-2xl border p-6 flex flex-col gap-4" style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}>
            <label className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Período</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs" style={{ color: 'var(--c-subtle)' }}>Início</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setEndDate('') }}
                  className="rounded-xl px-3 py-2.5 text-sm border outline-none"
                  style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
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
                  style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
                />
              </div>
            </div>
          </div>

          {/* Google Calendar ID */}
          <div className="rounded-2xl border p-6 flex flex-col gap-3" style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}>
            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Google Calendar ID</label>
              <p className="text-xs mt-0.5" style={{ color: 'var(--c-subtle)' }}>
                Opcional. Encontre em: Google Calendar → Configurações da agenda → ID da agenda.
              </p>
            </div>
            <input
              type="text"
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
              placeholder="xxxxx@group.calendar.google.com"
              className="w-full rounded-xl px-4 py-3 text-sm border outline-none"
              style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
            />
          </div>

          {/* Alunos */}
          <div className="rounded-2xl border p-6 flex flex-col gap-3" style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}>
            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Alunos</label>
              <p className="text-xs mt-0.5" style={{ color: 'var(--c-subtle)' }}>Adicione por e-mail. Pode adicionar mais depois.</p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={studentInput}
                onChange={(e) => setStudentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStudent())}
                placeholder="email@exemplo.com"
                className="flex-1 rounded-xl px-4 py-2.5 text-sm border outline-none"
                style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
              />
              <button
                type="button"
                onClick={addStudent}
                className="px-3 py-2.5 rounded-xl border flex items-center gap-1.5 text-sm transition-colors"
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

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-opacity disabled:opacity-50"
            style={{ background: '#FFC530', color: '#1A0A3C' }}
          >
            {saving ? 'Criando...' : 'Criar turma'}
          </button>
        </form>
      </div>
    </main>
  )
}
