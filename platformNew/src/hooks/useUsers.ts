import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as usersService from '@/services/users'
import type { UserProfile } from '@/types'

export function useUsers() {
  const queryClient = useQueryClient()

  const { data: users = [], isLoading: loading } = useQuery<UserProfile[]>({
    queryKey: ['admin', 'users'],
    queryFn: usersService.listUsers,
    staleTime: 2 * 60 * 1000,
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: 'teacher' | 'student' }) =>
      usersService.updateUser(uid, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const updateNameMutation = useMutation({
    mutationFn: ({ uid, name }: { uid: string; name: string }) =>
      usersService.updateUser(uid, { name }),
    onSuccess: (_, { uid, name }) =>
      queryClient.setQueryData<UserProfile[]>(['admin', 'users'], (prev) =>
        prev?.map((u) => u.uid === uid ? { ...u, name } : u) ?? []
      ),
  })

  const deleteUserMutation = useMutation({
    mutationFn: usersService.deleteUser,
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
    updateName: async (uid: string, name: string) => {
      await updateNameMutation.mutateAsync({ uid, name })
    },
    deleteUser: async (uid: string) => {
      await deleteUserMutation.mutateAsync(uid)
    },
  }
}
