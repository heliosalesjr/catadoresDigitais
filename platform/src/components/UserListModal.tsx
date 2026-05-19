'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { HiXMark, HiExclamationTriangle } from 'react-icons/hi2'
import type { UserProfile, Turma } from '@/types'

const ease = [0.32, 0.72, 0, 1] as const

export type CardFilter = 'student' | 'teacher' | 'admin' | 'all'

const FILTER_LABEL: Record<CardFilter, string> = {
  student: 'Alunos',
  teacher: 'Professores',
  admin: 'Admins',
  all: 'Total de usuários',
}

const ROLE_COLORS: Record<string, string> = {
  admin: '#FFC530',
  teacher: '#A855F7',
  student: '#06B6D4',
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  teacher: 'Professor',
  student: 'Aluno',
}

interface Props {
  filter: CardFilter
  users: UserProfile[]
  turmas: Turma[]
  turmasLoading: boolean
  onClose: () => void
}

export function UserListModal({ filter, users, turmas, turmasLoading, onClose }: Props) {
  const filtered = filter === 'all' ? users : users.filter((u) => u.role === filter)

  function studentTurmas(email: string) {
    return turmas.filter((t) => t.students.includes(email))
  }

  function teacherTurmas(uid: string) {
    return turmas.filter((t) => t.professors?.some((p) => p.uid === uid))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ duration: 0.25, ease }}
        className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--c-bg-alt)', border: '1px solid var(--c-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--c-border)' }}
        >
          <div>
            <h2 className="font-bold" style={{ color: 'var(--c-text)' }}>
              {FILTER_LABEL[filter]}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--c-subtle)' }}>
              {filtered.length} {filtered.length === 1 ? 'usuário' : 'usuários'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
            style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
          >
            <HiXMark className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>
                Nenhum usuário nesta categoria.
              </p>
            </div>
          ) : (
            filtered.map((u, i) => {
              const sTurmas = u.role === 'student' ? studentTurmas(u.email) : []
              const tTurmas = u.role === 'teacher' ? teacherTurmas(u.uid) : []
              const showTurmas = u.role === 'student' || u.role === 'teacher'

              return (
                <div
                  key={u.uid}
                  className="flex items-start gap-3 px-5 py-3.5"
                  style={{ borderTop: i === 0 ? 'none' : '1px solid var(--c-border)' }}
                >
                  {/* Avatar */}
                  {u.photoURL ? (
                    <img
                      src={u.photoURL}
                      alt={u.name}
                      className="w-9 h-9 rounded-full flex-shrink-0 mt-0.5"
                    />
                  ) : (
                    <div
                      className="w-9 h-9 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-sm font-bold"
                      style={{ background: 'var(--c-border-md)', color: 'var(--c-text)' }}
                    >
                      {u.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
                        {u.name}
                      </p>
                      {filter === 'all' && (
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{
                            color: ROLE_COLORS[u.role],
                            background: `${ROLE_COLORS[u.role]}18`,
                          }}
                        >
                          {ROLE_LABEL[u.role]}
                        </span>
                      )}
                    </div>

                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--c-subtle)' }}>
                      {u.email}
                    </p>

                    {/* Turma chips */}
                    {showTurmas && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {turmasLoading ? (
                          <span className="text-[10px]" style={{ color: 'var(--c-faint)' }}>
                            Carregando turmas...
                          </span>
                        ) : u.role === 'student' ? (
                          sTurmas.length > 0 ? (
                            sTurmas.map((t) => (
                              <span
                                key={t.id}
                                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                style={{ background: `${t.iconColor}18`, color: t.iconColor }}
                              >
                                {t.name}
                              </span>
                            ))
                          ) : (
                            <span
                              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                              style={{ background: '#f59e0b18', color: '#f59e0b' }}
                            >
                              <HiExclamationTriangle className="w-3 h-3" />
                              Sem turma
                            </span>
                          )
                        ) : u.role === 'teacher' ? (
                          tTurmas.length > 0 ? (
                            tTurmas.map((t) => (
                              <span
                                key={t.id}
                                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                style={{ background: `${t.iconColor}18`, color: t.iconColor }}
                              >
                                {t.name}
                              </span>
                            ))
                          ) : (
                            <span
                              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                              style={{ background: '#f59e0b18', color: '#f59e0b' }}
                            >
                              <HiExclamationTriangle className="w-3 h-3" />
                              Sem turma associada
                            </span>
                          )
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
