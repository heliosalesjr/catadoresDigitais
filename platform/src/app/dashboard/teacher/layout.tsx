import type { ReactNode } from 'react'
import { DashboardNavbar } from '@/components/DashboardNavbar'
import { Footer } from '@/components/Footer'

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DashboardNavbar title="Painel do Professor" />
      {children}
      <Footer />
    </>
  )
}
