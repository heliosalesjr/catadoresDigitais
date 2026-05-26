import type { ReactNode } from 'react'
import { DashboardNavbar } from '@/components/DashboardNavbar'

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DashboardNavbar title="Meu Painel" />
      {children}
    </>
  )
}
