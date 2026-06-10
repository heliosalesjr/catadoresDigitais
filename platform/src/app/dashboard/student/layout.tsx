import type { ReactNode } from 'react'
import { DashboardNavbar } from '@/components/DashboardNavbar'
import { Footer } from '@/components/Footer'

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DashboardNavbar title="Meu Painel" />
      {children}
      <Footer />
    </>
  )
}
