export type Role = 'admin' | 'teacher' | 'student'

export interface UserProfile {
  uid: string
  email: string
  name: string
  photoURL: string | null
  role: Role
  createdAt: string
}
