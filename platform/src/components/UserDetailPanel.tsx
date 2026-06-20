'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiXMark, HiTrash } from 'react-icons/hi2'
import type { UserProfile, Turma } from '@/types'

const ROLE_LABEL = { admin: 'Admin', teacher: 'Professor', student: 'Aluno' }
const ROLE_COLORS = { admin: 'var(--c-gold)', teacher: 'var(--c-purple)', student: 'var(--c-info)' }
const ROLE_BG_COLORS = { admin: 'var(--c-gold-soft)', teacher: 'var(--c-purple-soft)', student: 'var(--c-info-soft)' }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

interface Props {
  user: UserProfile
  turmas: Turma[]
  turmasLoading: boolean
  onClose: () => void
  onRoleUpdate: (uid: string, role: 'student' | 'teacher') => Promise<void>
  onDelete: (uid: string) => Promise<void>
  onAddToTurma: (turmaId: string, user: UserProfile) => Promise<void>
  onRemoveFromTurma: (turmaId: string, user: UserProfile) => Promise<void>
}

export function UserDetailPanel({ user, turmas, turmasLoading, onClose, onRoleUpdate, onDelete, onAddToTurma, onRemoveFromTurma }: Props) {
  const [currentRole, setCurrentRole] = useState(user.role)
  const [updatingRole, setUpdatingRole] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [addingToTurma, setAddingToTurma] = useState(false)
  const [removingTurmaId, setRemovingTurmaId] = useState<string | null>(null)
  const [selectedTurmaId, setSelectedTurmaId] = useState('')

  const isTeacher = currentRole === 'teacher'
  const enrolledTurmas = isTeacher
    ? turmas.filter((t) => t.professors?.some((p) => p.uid === user.uid))
    : turmas.filter((t) => t.students?.includes(user.email))
  const enrolledIds = new Set(enrolledTurmas.map((t) => t.id))
  const availableTurmas = turmas.filter((t) => !enrolledIds.has(t.id))

  async function handleRoleChange(role: 'student' | 'teacher') {
    if (role === currentRole || updatingRole) return
    setUpdatingRole(true)
    await onRoleUpdate(user.uid, role)
    setCurrentRole(role)
    setSelectedTurmaId('')
    setUpdatingRole(false)
  }

  async function handleDelete() {
    setDeleting(true)
    await onDelete(user.uid)
    onClose()
  }

  async function handleAddToTurma() {
    if (!selectedTurmaId) return
    setAddingToTurma(true)
    await onAddToTurma(selectedTurmaId, { ...user, role: currentRole })
    setSelectedTurmaId('')
    setAddingToTurma(false)
  }

  async function handleRemoveFromTurma(turmaId: string) {
    setRemovingTurmaId(turmaId)
    await onRemoveFromTurma(turmaId, { ...user, role: currentRole })
    setRemovingTurmaId(null)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col overflow-y-auto"
        style={{ background: 'var(--c-bg-alt)', borderLeft: '1px solid var(--c-border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b sticky top-0"
          style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border)' }}
        >
          <h2 className="font-semibold" style={{ color: 'var(--c-text)' }}>Perfil do usuário</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-opacity hover:opacity-60"
            style={{ color: 'var(--c-subtle)' }}
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6">
          {/* Identity */}
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="w-16 h-16 rounded-full flex-shrink-0" />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-2xl font-bold"
                style={{ background: 'var(--c-border-md)', color: 'var(--c-text)' }}
              >
                {user.name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold truncate" style={{ color: 'var(--c-text)' }}>{user.name}</p>
              <p className="text-sm truncate" style={{ color: 'var(--c-subtle)' }}>{user.email}</p>
              <span
                className="inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ color: ROLE_COLORS[currentRole], background: ROLE_BG_COLORS[currentRole] }}
              >
                {ROLE_LABEL[currentRole]}
              </span>
            </div>
          </div>

          {/* Registration date */}
          <div className="rounded-xl p-4" style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
            <p className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: 'var(--c-faint)' }}>
              Membro desde
            </p>
            <p className="text-sm" style={{ color: 'var(--c-text)' }}>{formatDate(user.createdAt)}</p>
          </div>

          {/* Role selector */}
          {user.role !== 'admin' && (
            <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
              <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: 'var(--c-faint)' }}>Perfil</p>
              <div className="flex gap-2">
                {(['student', 'teacher'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    disabled={updatingRole}
                    className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50"
                    style={{
                      background: currentRole === role ? ROLE_BG_COLORS[role] : 'transparent',
                      borderColor: currentRole === role ? ROLE_COLORS[role] : 'var(--c-border-md)',
                      color: currentRole === role ? ROLE_COLORS[role] : 'var(--c-muted)',
                    }}
                  >
                    {updatingRole && currentRole !== role ? '...' : ROLE_LABEL[role]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Turmas */}
          <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
            <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: 'var(--c-faint)' }}>
              {isTeacher ? 'Turmas que ministra' : 'Turmas'}
            </p>

            {turmasLoading ? (
              <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>Carregando...</p>
            ) : (
              <>
                {enrolledTurmas.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>
                    {isTeacher ? 'Nenhuma turma atribuída ainda.' : 'Não matriculado em nenhuma turma.'}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {enrolledTurmas.map((turma) => (
                      <li
                        key={turma.id}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg"
                        style={{ background: 'var(--c-bg-alt)' }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: turma.iconColor }} />
                        <span className="text-sm flex-1 truncate" style={{ color: 'var(--c-text)' }}>{turma.name}</span>
                        <button
                          onClick={() => handleRemoveFromTurma(turma.id)}
                          disabled={removingTurmaId === turma.id}
                          title={isTeacher ? 'Remover da turma' : 'Remover matrícula'}
                          className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-70 disabled:opacity-40"
                          style={{ color: 'var(--c-faint)' }}
                        >
                          {removingTurmaId === turma.id ? (
                            <span className="text-[10px]">...</span>
                          ) : (
                            <HiXMark className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {availableTurmas.length > 0 ? (
                  <div className="flex gap-2 pt-1">
                    <select
                      value={selectedTurmaId}
                      onChange={(e) => setSelectedTurmaId(e.target.value)}
                      className="flex-1 rounded-lg px-2.5 py-2 text-sm border outline-none min-w-0"
                      style={{ background: 'var(--c-bg-alt)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
                    >
                      <option value="" disabled>
                        {isTeacher ? 'Atribuir a uma turma...' : 'Matricular em uma turma...'}
                      </option>
                      {availableTurmas.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddToTurma}
                      disabled={!selectedTurmaId || addingToTurma}
                      className="px-3 py-2 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50 flex-shrink-0"
                      style={{ background: 'var(--c-gold)', color: 'var(--c-bg)' }}
                    >
                      {addingToTurma ? '...' : 'Adicionar'}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: 'var(--c-faint)' }}>
                    {isTeacher ? 'Já atribuído a todas as turmas existentes.' : 'Já matriculado em todas as turmas existentes.'}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Delete */}
          {user.role !== 'admin' && (
            <div className="mt-2">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm transition-colors"
                  style={{ borderColor: 'var(--c-danger-strong)', color: 'var(--c-danger)' }}
                >
                  <HiTrash className="w-4 h-4" />
                  Deletar usuário
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    style={{ background: 'var(--c-danger)', color: 'var(--c-bg)' }}
                  >
                    {deleting ? 'Deletando...' : 'Confirmar exclusão'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm border transition-colors"
                    style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
