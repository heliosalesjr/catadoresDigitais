import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { listStudentTurmas, listTeacherTurmas } from '@/services/turmas'
import {
  getStudentFrequencia,
  listUpcomingAulasAdmin,
  listUpcomingAulasStudent,
  listUpcomingAulasTeacher,
} from '@/services/aulas'
import type { FrequenciaResult, Role, Turma, UpcomingAula } from '@/types'

export function useStudentTurmas(enabled = true) {
  const { user } = useAuth()
  return useQuery<Turma[]>({
    queryKey: ['student', 'turmas', user?.email],
    queryFn: () => listStudentTurmas(user!.email),
    enabled: enabled && !!user,
  })
}

export function useTeacherTurmas(enabled = true) {
  const { user } = useAuth()
  return useQuery<Turma[]>({
    queryKey: ['teacher', 'turmas', user?.uid],
    queryFn: () => listTeacherTurmas(user!.uid),
    enabled: enabled && !!user,
  })
}

export function useStudentFrequencia(enabled = true) {
  const { user } = useAuth()
  return useQuery<FrequenciaResult>({
    queryKey: ['student', 'frequencia', user?.email],
    queryFn: () => getStudentFrequencia(user!.email),
    enabled: enabled && !!user,
  })
}

export function useUpcomingAulas(role: Role, enabled = true) {
  const { user } = useAuth()
  return useQuery<UpcomingAula[]>({
    queryKey: [role, 'upcoming-aulas', user?.uid],
    queryFn: () => {
      if (role === 'admin') return listUpcomingAulasAdmin()
      if (role === 'teacher') return listUpcomingAulasTeacher(user!.uid)
      return listUpcomingAulasStudent(user!.email)
    },
    enabled: enabled && !!user,
  })
}
