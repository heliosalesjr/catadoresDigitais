'use client'

import { use, useEffect, useState } from 'react'
import { TurmaForm } from '@/components/TurmaForm'
import type { Turma } from '@/types'

export default function EditarTurmaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [turma, setTurma] = useState<Turma | null>(null)

  useEffect(() => {
    fetch(`/api/admin/turmas/${id}`)
      .then((r) => r.json())
      .then(setTurma)
  }, [id])

  if (!turma) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--c-bg)' }}>
        <p style={{ color: 'var(--c-subtle)' }}>Carregando...</p>
      </div>
    )
  }

  return (
    <TurmaForm
      mode="edit"
      turmaId={id}
      backHref={`/dashboard/turmas/${id}`}
      initialData={{
        name: turma.name,
        icon: turma.icon,
        iconColor: turma.iconColor,
        startDate: turma.startDate,
        endDate: turma.endDate,
        calendarId: turma.calendarId,
        students: turma.students,
      }}
    />
  )
}
