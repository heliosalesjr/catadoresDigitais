import type { ReactNode } from 'react'

export default function AulaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--c-bg)', color: 'var(--c-text)' }}>
      {children}
    </div>
  )
}
