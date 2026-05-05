import type { ReactNode } from 'react'
import { DashboardNavbar } from '@/components/DashboardNavbar'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DashboardNavbar title="Painel Admin" />
      {children}
    </>
  )
}
