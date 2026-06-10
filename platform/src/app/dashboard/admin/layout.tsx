import type { ReactNode } from 'react'
import { DashboardNavbar } from '@/components/DashboardNavbar'
import { Footer } from '@/components/Footer'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DashboardNavbar title="Painel Admin" />
      {children}
      <Footer />
    </>
  )
}
