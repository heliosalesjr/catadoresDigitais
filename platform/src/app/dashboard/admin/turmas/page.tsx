'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'
import { TECH_ICONS } from '@/lib/icons'
import { HiOutlineSun, HiOutlineMoon, HiPlus, HiArrowLeft } from 'react-icons/hi2'
import type { Turma } from '@/types'

function fmt(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR')
}

export default function TurmasPage() {
  const { isDark, toggle } = useTheme()
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/turmas')
      .then((r) => r.json())
      .then((data) => { setTurmas(data); setLoading(false) })
  }, [])

  return (
    <main className="min-h-screen p-8" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/admin"
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors"
              style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
            >
              <HiArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--c-text)' }}>Turmas</h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--c-subtle)' }}>Catadores Digitais</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors"
              style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
            >
              {isDark ? <HiOutlineSun className="w-4 h-4" /> : <HiOutlineMoon className="w-4 h-4" />}
            </button>
            <Link
              href="/dashboard/admin/turmas/nova"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: '#FFC530', color: '#1A0A3C' }}
            >
              <HiPlus className="w-4 h-4" />
              Nova turma
            </Link>
          </div>
        </header>

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
              style={{ background: '#FFC530', color: '#1A0A3C' }}
            >
              Criar primeira turma
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {turmas.map((turma) => {
              const iconEntry = TECH_ICONS[turma.icon]
              const Icon = iconEntry?.icon
              return (
                <Link
                  key={turma.id}
                  href={`/dashboard/turmas/${turma.id}`}
                  className="rounded-2xl border p-6 flex flex-col gap-4 transition-colors hover:border-opacity-60 group"
                  style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${turma.iconColor}20` }}
                    >
                      {Icon && <Icon className="w-6 h-6" style={{ color: turma.iconColor }} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate" style={{ color: 'var(--c-text)' }}>{turma.name}</p>
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
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
