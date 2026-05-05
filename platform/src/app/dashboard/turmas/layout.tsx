import type { ReactNode } from 'react'
import { DashboardNavbar } from '@/components/DashboardNavbar'

export default function TurmasLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--c-bg)' }}>
      <DashboardNavbar />
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  )
}
