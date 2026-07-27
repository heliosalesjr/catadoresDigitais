import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { TurmaForm } from '@/components/TurmaForm'
import { getTurmaAdmin } from '@/services/turmas'
import type { Turma } from '@/types'

export default function EditarTurmaPage() {
  const { id } = useParams<{ id: string }>()
  const [turma, setTurma] = useState<Turma | null>(null)

  useEffect(() => {
    if (!id) return
    getTurmaAdmin(id).then(setTurma).catch(console.error)
  }, [id])

  if (!turma || !id) {
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
      archived={turma.archived ?? false}
      initialData={{
        name: turma.name,
        icon: turma.icon,
        iconColor: turma.iconColor,
        startDate: turma.startDate,
        endDate: turma.endDate,
        students: turma.students,
      }}
    />
  )
}
