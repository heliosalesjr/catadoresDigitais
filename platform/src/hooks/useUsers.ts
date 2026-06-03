'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UserProfile } from '@/types'

export function useUsers() {
  const queryClient = useQueryClient()

  const { data: users = [], isLoading: loading } = useQuery<UserProfile[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => fetch('/api/admin/users').then((r) => r.json()),
    staleTime: 2 * 60 * 1000,
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: 'teacher' | 'student' }) =>
      fetch(`/api/admin/users/${uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const deleteUserMutation = useMutation({
    mutationFn: (uid: string) =>
      fetch(`/api/admin/users/${uid}`, { method: 'DELETE' }),
    onSuccess: (_, uid) =>
      queryClient.setQueryData<UserProfile[]>(['admin', 'users'], (prev) =>
        prev?.filter((u) => u.uid !== uid) ?? []
      ),
  })

  return {
    users,
    loading,
    updateRole: async (uid: string, role: 'teacher' | 'student') => {
      await updateRoleMutation.mutateAsync({ uid, role })
    },
    deleteUser: async (uid: string) => {
      await deleteUserMutation.mutateAsync(uid)
    },
  }
}
