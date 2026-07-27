import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { DashboardNavbar } from '@/components/DashboardNavbar'
import { Footer } from '@/components/Footer'
import type { Role } from '@/types'
import LoginPage from '@/pages/LoginPage'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminTurmasPage from '@/pages/admin/AdminTurmasPage'
import NovaTurmaPage from '@/pages/admin/NovaTurmaPage'
import EditarTurmaPage from '@/pages/admin/EditarTurmaPage'
import RelatorioTurmaPage from '@/pages/admin/RelatorioTurmaPage'
import TeacherDashboard from '@/pages/teacher/TeacherDashboard'
import StudentDashboard from '@/pages/student/StudentDashboard'
import TurmaDetailPage from '@/pages/turmas/TurmaDetailPage'
import AulaPage from '@/pages/aula/AulaPage'

export const ROLE_HOME: Record<Role, string> = {
  admin: '/dashboard/admin',
  teacher: '/dashboard/teacher',
  student: '/dashboard/student',
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--c-bg)' }}>
      <div
        className="w-10 h-10 rounded-full border-2 animate-spin"
        style={{ borderColor: 'var(--c-border-md)', borderTopColor: 'var(--c-purple)' }}
      />
    </div>
  )
}

function RequireAuth({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={ROLE_HOME[user.role]} replace />
  return <Outlet />
}

function LoginGate() {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (user) return <Navigate to={ROLE_HOME[user.role]} replace />
  return <LoginPage />
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  return <Navigate to={user ? ROLE_HOME[user.role] : '/login'} replace />
}

function PanelLayout({ title }: { title?: string }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--c-bg)', color: 'var(--c-text)' }}>
      <DashboardNavbar title={title} />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

function BareLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--c-bg)', color: 'var(--c-text)' }}>
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginGate />} />

      <Route element={<RequireAuth roles={['admin']} />}>
        <Route element={<PanelLayout title="Painel Admin" />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/turmas" element={<AdminTurmasPage />} />
          <Route path="/dashboard/admin/turmas/nova" element={<NovaTurmaPage />} />
          <Route path="/dashboard/admin/turmas/:id/editar" element={<EditarTurmaPage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={['admin', 'teacher']} />}>
        <Route element={<PanelLayout />}>
          <Route path="/dashboard/admin/turmas/:id/relatorio" element={<RelatorioTurmaPage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={['teacher']} />}>
        <Route element={<PanelLayout title="Painel do Professor" />}>
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={['student']} />}>
        <Route element={<PanelLayout title="Meu Painel" />}>
          <Route path="/dashboard/student" element={<StudentDashboard />} />
        </Route>
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<PanelLayout />}>
          <Route path="/dashboard/turmas/:id" element={<TurmaDetailPage />} />
        </Route>
        <Route element={<BareLayout />}>
          <Route path="/dashboard/aula/:turmaId/:aulaId" element={<AulaPage />} />
        </Route>
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}
