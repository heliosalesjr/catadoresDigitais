'use client'

import { useState, useEffect, useCallback } from 'react'
import type { UserProfile } from '@/types'

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function updateRole(uid: string, role: 'teacher' | 'student') {
    await fetch(`/api/admin/users/${uid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    await fetchUsers()
  }

  async function deleteUser(uid: string) {
    await fetch(`/api/admin/users/${uid}`, { method: 'DELETE' })
    setUsers((prev) => prev.filter((u) => u.uid !== uid))
  }

  return { users, loading, updateRole, deleteUser }
}
