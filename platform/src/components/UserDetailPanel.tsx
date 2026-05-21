'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiXMark, HiTrash } from 'react-icons/hi2'
import type { UserProfile, Turma } from '@/types'

const ROLE_LABEL = { admin: 'Admin', teacher: 'Professor', student: 'Aluno' }
const ROLE_COLORS = { admin: '#FFC530', teacher: '#A855F7', student: '#06B6D4' }

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
  onAddToTurma: (turmaId: string, email: string) => Promise<void>
}

export function UserDetailPanel({ user, turmas, turmasLoading, onClose, onRoleUpdate, onDelete, onAddToTurma }: Props) {
  const [currentRole, setCurrentRole] = useState(user.role)
  const [updatingRole, setUpdatingRole] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [addingToTurma, setAddingToTurma] = useState<string | null>(null)
  const [showTurmaList, setShowTurmaList] = useState(false)

  const studentTurmas = turmas.filter((t) => t.students?.includes(user.email))
  const teacherTurmas = turmas.filter((t) => t.professors?.some((p) => p.uid === user.uid))
  const unenrolledTurmas = turmas.filter((t) => !t.students?.includes(user.email))

  async function handleRoleChange(role: 'student' | 'teacher') {
    if (role === currentRole || updatingRole) return
    setUpdatingRole(true)
    await onRoleUpdate(user.uid, role)
    setCurrentRole(role)
    setUpdatingRole(false)
  }

  async function handleDelete() {
    setDeleting(true)
    await onDelete(user.uid)
    onClose()
  }

  async function handleAddToTurma(turmaId: string) {
    setAddingToTurma(turmaId)
    await onAddToTurma(turmaId, user.email)
    setAddingToTurma(null)
    setShowTurmaList(false)
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
                style={{ color: ROLE_COLORS[currentRole], background: `${ROLE_COLORS[currentRole]}18` }}
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
                      background: currentRole === role ? `${ROLE_COLORS[role]}18` : 'transparent',
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
              {currentRole === 'teacher' ? 'Turmas que ministra' : 'Turmas'}
            </p>

            {turmasLoading ? (
              <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>Carregando...</p>
            ) : currentRole === 'teacher' ? (
              teacherTurmas.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>Nenhuma turma atribuída.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {teacherTurmas.map((turma) => (
                    <li key={turma.id} className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: turma.iconColor }} />
                      <span className="text-sm" style={{ color: 'var(--c-text)' }}>{turma.name}</span>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <>
                {studentTurmas.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>Não matriculado em nenhuma turma.</p>
                ) : (
                  <ul className="flex flex-col gap-2 mb-1">
                    {studentTurmas.map((turma) => (
                      <li key={turma.id} className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: turma.iconColor }} />
                        <span className="text-sm" style={{ color: 'var(--c-text)' }}>{turma.name}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {!showTurmaList ? (
                  <button
                    onClick={() => setShowTurmaList(true)}
                    className="text-xs px-3 py-1.5 rounded-lg border self-start transition-colors"
                    style={{ borderColor: '#FFC530', color: '#FFC530' }}
                  >
                    + Adicionar turma
                  </button>
                ) : (
                  <div className="flex flex-col gap-1">
                    {unenrolledTurmas.length === 0 ? (
                      <p className="text-xs" style={{ color: 'var(--c-subtle)' }}>
                        Já matriculado em todas as turmas.
                      </p>
                    ) : (
                      unenrolledTurmas.map((turma) => (
                        <button
                          key={turma.id}
                          onClick={() => handleAddToTurma(turma.id)}
                          disabled={addingToTurma === turma.id}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-opacity hover:opacity-75 disabled:opacity-40"
                          style={{ background: 'var(--c-bg-alt)' }}
                        >
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: turma.iconColor }} />
                          <span className="text-sm flex-1" style={{ color: 'var(--c-text)' }}>{turma.name}</span>
                          {addingToTurma === turma.id && (
                            <span className="text-xs" style={{ color: 'var(--c-subtle)' }}>...</span>
                          )}
                        </button>
                      ))
                    )}
                    <button
                      onClick={() => setShowTurmaList(false)}
                      className="text-xs mt-1 self-start"
                      style={{ color: 'var(--c-subtle)' }}
                    >
                      Cancelar
                    </button>
                  </div>
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
                  style={{ borderColor: '#ef444440', color: '#ef4444' }}
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
                    style={{ background: '#ef4444', color: '#fff' }}
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
