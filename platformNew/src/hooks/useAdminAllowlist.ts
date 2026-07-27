import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addToAllowlist, listAllowlist, removeFromAllowlist } from '@/services/allowlist'
import type { AllowlistEntry } from '@/types'

export function useAdminAllowlist() {
  const queryClient = useQueryClient()

  const query = useQuery<AllowlistEntry[]>({
    queryKey: ['admin', 'allowlist'],
    queryFn: listAllowlist,
    staleTime: 5 * 60 * 1000,
  })

  const addMutation = useMutation({
    mutationFn: addToAllowlist,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'allowlist'] }),
  })

  const removeMutation = useMutation({
    mutationFn: removeFromAllowlist,
    onSuccess: (_, email) =>
      queryClient.setQueryData<AllowlistEntry[]>(['admin', 'allowlist'], (prev) =>
        prev?.filter((e) => e.email !== email) ?? []
      ),
  })

  return {
    allowlist: query.data ?? [],
    allowlistLoading: query.isLoading,
    addToAllowlist: addMutation.mutateAsync,
    addingToAllowlist: addMutation.isPending,
    addToAllowlistError: addMutation.error as Error | null,
    removeFromAllowlist: removeMutation.mutateAsync,
    removingFromAllowlist: removeMutation.isPending ? removeMutation.variables! : null,
  }
}
