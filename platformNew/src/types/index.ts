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
  phone?: string
  cpf?: string
  birthDate?: string // ISO date YYYY-MM-DD
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
  archived?: boolean
  archivedAt?: string | null   // ISO datetime, or null when unarchived
  archivedBy?: string | null   // admin uid, or 'system' when auto-archived
  createdBy: string
  createdAt: string
}

export interface DriveLink {
  label: string
  url: string
}

export interface Material {
  id?: string
  type?: 'link' | 'text'  // undefined treated as 'link' for legacy DriveLink items
  label: string
  url?: string      // link type
  content?: string  // text type
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
  driveLinks: Material[]
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

// Shapes that used to live in the Next API routes
export interface UpcomingAula extends Aula {
  turmaId: string
  turmaName: string
  turmaIconColor: string
}

export interface FrequenciaResult {
  total: number
  attended: number
  percentage: number | null
}

export interface RespostaDoc {
  studentEmail: string
  studentName: string
  answers: Record<string, string>
  submittedAt: string
}

export interface RelatorioAula {
  aulaId: string
  title: string
  date: string
  duracaoMinutos: number
  totalAvaliacoes: number
  alunosConcluiram: number
  percentualConclusao: number | null
  attendance: Record<string, AttendanceStatus>
  completed: string[]
}

export interface RelatorioResult {
  periodo: { from: string; to: string }
  students: string[]
  studentNames: Record<string, string>
  totalAlunos: number
  totalAulas: number
  totalDuracaoMinutos: number
  percentualPresenca: number | null
  aulas: RelatorioAula[]
}
