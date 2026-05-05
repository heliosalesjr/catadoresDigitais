import type { ReactNode } from 'react'
import { DashboardNavbar } from '@/components/DashboardNavbar'

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DashboardNavbar title="Painel do Professor" />
      {children}
    </>
  )
}
