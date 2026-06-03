const sk = 'animate-pulse rounded'
const bg = { background: 'var(--c-border)' } as const

export default function StudentDashboardLoading() {
  return (
    <main className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">

        {/* Greeting */}
        <div className="flex flex-col gap-2">
          <div className={`${sk} h-7 w-48`} style={bg} />
          <div className={`${sk} h-4 w-60`} style={bg} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-5 border flex flex-col gap-3"
              style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
            >
              <div className={`${sk} w-9 h-9 rounded-xl`} style={bg} />
              <div className="flex flex-col gap-2">
                <div className={`${sk} h-3 w-24`} style={bg} />
                <div className={`${sk} h-8 w-14`} style={bg} />
              </div>
            </div>
          ))}
        </div>

        {/* Minha turma */}
        <section>
          <div className={`${sk} h-5 w-28 mb-3`} style={bg} />
          <div
            className="rounded-2xl border p-5 flex flex-col gap-4"
            style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
          >
            <div className="flex items-start gap-3">
              <div className={`${sk} w-10 h-10 rounded-xl flex-shrink-0`} style={bg} />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className={`${sk} h-4 w-40`} style={bg} />
                <div className={`${sk} h-3 w-32`} style={bg} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <div className={`${sk} h-3 w-24`} style={bg} />
                <div className={`${sk} h-4 w-20 rounded-full`} style={bg} />
              </div>
              <div className={`${sk} w-full h-1.5 rounded-full`} style={bg} />
            </div>
          </div>
        </section>

        {/* Próximas aulas */}
        <section>
          <div className={`${sk} h-5 w-36 mb-3`} style={bg} />
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
          >
            <div className="px-6 py-3" style={{ background: 'var(--c-bg)' }}>
              <div className={`${sk} h-3 w-12`} style={bg} />
            </div>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-6 py-3.5 border-t"
                style={{ borderColor: 'var(--c-border)' }}
              >
                <div
                  className={`${sk} rounded-full flex-shrink-0`}
                  style={{ ...bg, width: 4, height: 40 }}
                />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`${sk} h-4 w-40`} style={bg} />
                    <div className={`${sk} h-4 w-14 rounded-full flex-shrink-0`} style={bg} />
                  </div>
                  <div className={`${sk} h-3 w-28`} style={bg} />
                </div>
                <div className={`${sk} h-3 w-12 flex-shrink-0`} style={bg} />
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
