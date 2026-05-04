export type Role = 'admin' | 'teacher' | 'student'

export interface UserProfile {
  uid: string
  email: string
  name: string
  photoURL: string | null
  role: Role
  createdAt: string
}

export interface Turma {
  id: string
  name: string
  icon: string       // key in TECH_ICONS
  iconColor: string  // hex
  startDate: string  // ISO date YYYY-MM-DD
  endDate: string    // ISO date YYYY-MM-DD
  calendarId?: string
  students: string[] // emails for now
  createdBy: string
  createdAt: string
}
