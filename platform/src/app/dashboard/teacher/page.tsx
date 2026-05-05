'use client'

export default function TeacherDashboard() {
  return (
    <main className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Minhas turmas', value: '—' },
            { label: 'Alunos ativos', value: '—' },
            { label: 'Aulas publicadas', value: '—' },
            { label: 'Pendências', value: '—' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-6 border" style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}>
              <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>{stat.label}</p>
              <p className="text-3xl font-bold mt-2" style={{ color: 'var(--c-text)' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-6 border" style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}>
          <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>Conteúdo do painel do professor em construção.</p>
        </div>
      </div>
    </main>
  )
}
