export type Role = 'admin' | 'teacher' | 'student'

export interface AllowlistEntry {
  email: string
  role: 'student' | 'teacher'
  turmaId: string
  createdAt: string
}

export interface UserProfile {
  uid: string
  email: string
  name: string
  photoURL: string | null
  role: Role
  createdAt: string
}

export interface Nota {
  id: string
  title: string
  content: string
  turmaId: string
  createdAt: string
  updatedAt: string
}

export interface TurmaTeacher {
  uid: string
  name: string
  email: string
  phone?: string
}

export interface Turma {
  id: string
  name: string
  icon: string       // key in TECH_ICONS
  iconColor: string  // hex
  startDate: string  // ISO date YYYY-MM-DD
  endDate: string    // ISO date YYYY-MM-DD
  students: string[] // emails
  professors?: TurmaTeacher[]
  createdBy: string
  createdAt: string
}

export interface DriveLink {
  label: string
  url: string
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | null

export interface AulaTeacher {
  uid: string
  name: string
}

export type AvaliacaoType = 'link' | 'text' | 'quiz'

export interface Avaliacao {
  id: string
  type: AvaliacaoType
  question: string
  options?: string[]  // quiz only: exactly 5, index 0 is always the correct answer
  createdAt: string
}

export interface Aula {
  id: string
  title: string
  description: string
  teachers: AulaTeacher[]
  driveLinks: DriveLink[]
  date: string       // "YYYY-MM-DD"
  startTime: string  // "19:00"
  endTime: string    // "22:00"
  attendance: Record<string, AttendanceStatus> // studentEmail -> status
  attendanceCode?: string // 4-digit code for student check-in
  status?: 'published' | 'pending' // undefined treated as published (legacy)
  avaliacoes?: Avaliacao[]
  bancoAulaId?: string
  createdAt: string
}

export interface BancoAula {
  id: string
  title: string
  description: string
  teachers: AulaTeacher[]
  driveLinks: DriveLink[]
  avaliacoes?: Avaliacao[]
  createdBy: string
  createdAt: string
}
