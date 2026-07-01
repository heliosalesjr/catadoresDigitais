import type { ReactNode } from 'react'
import { DashboardNavbar } from '@/components/DashboardNavbar'

export default function TurmasLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--c-bg)' }}>
      <DashboardNavbar />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}
