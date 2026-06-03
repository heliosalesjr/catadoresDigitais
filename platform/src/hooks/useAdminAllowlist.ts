'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AllowlistEntry } from '@/types'

export function useAdminAllowlist() {
  const queryClient = useQueryClient()

  const query = useQuery<AllowlistEntry[]>({
    queryKey: ['admin', 'allowlist'],
    queryFn: () => fetch('/api/admin/allowlist').then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  })

  const addMutation = useMutation({
    mutationFn: (data: { email: string; role: 'student' | 'teacher' }) =>
      fetch('/api/admin/allowlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'allowlist'] }),
  })

  const removeMutation = useMutation({
    mutationFn: (email: string) =>
      fetch(`/api/admin/allowlist/${encodeURIComponent(email)}`, { method: 'DELETE' }),
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
    removeFromAllowlist: removeMutation.mutateAsync,
    removingFromAllowlist: removeMutation.isPending ? removeMutation.variables! : null,
  }
}
