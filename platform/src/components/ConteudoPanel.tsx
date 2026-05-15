'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiDocumentText, HiVideoCamera, HiArrowTopRightOnSquare,
  HiPlus, HiXMark, HiTrash, HiLink, HiPencilSquare, HiListBullet,
  HiClipboardDocumentCheck, HiCheckCircle, HiUserGroup, HiEnvelope, HiPhone,
} from 'react-icons/hi2'
import type { Turma, Aula, DriveLink, Avaliacao, UserProfile, TurmaTeacher } from '@/types'
import { MaterialViewer } from './MaterialViewer'
import { AvaliacaoFormModal } from './AvaliacaoFormModal'
import { TesteAvaliacaoModal } from './TesteAvaliacaoModal'

const MONTHS_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

const ease = [0.32, 0.72, 0, 1] as const

const inputStyle = {
  background: 'var(--c-bg)',
  borderColor: 'var(--c-border-md)',
  color: 'var(--c-text)',
} as const

const AVALIACAO_ICON = {
  link: HiLink,
  text: HiPencilSquare,
  quiz: HiListBullet,
} as const

const AVALIACAO_LABEL = {
  link: 'Link',
  text: 'Texto',
  quiz: 'Quiz',
} as const

function detectType(url: string): 'video' | 'file' {
  try {
    const h = new URL(url).hostname
    if (h.includes('youtube.com') || h.includes('youtu.be') || h.includes('vimeo.com')) return 'video'
  } catch {}
  return 'file'
}

function parseLocalDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

interface Props {
  turma: Turma
  aulas: Aula[]
  selectedMonth: Date
  canEdit: boolean
  currentUser: UserProfile | null
  onRefresh: () => void
  onRefreshTurma: () => void
}

interface AddState {
  aulaId: string
  label: string
  url: string
  saving: boolean
}

type Tab = 'conteudo' | 'presencas' | 'professores'

export function ConteudoPanel({ turma, aulas, selectedMonth, canEdit, currentUser, onRefresh, onRefreshTurma }: Props) {
  const [adding, setAdding] = useState<AddState | null>(null)
  const [tab, setTab] = useState<Tab>('conteudo')

  const monthAulas = aulas
    .filter((a) => {
      const [y, m] = a.date.split('-').map(Number)
      return y === selectedMonth.getFullYear() && m === selectedMonth.getMonth() + 1
    })
    .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))

  async function submitMaterial(aula: Aula) {
    if (!adding || !adding.url.trim()) return
    setAdding((s) => s ? { ...s, saving: true } : null)
    const newLinks: DriveLink[] = [
      ...aula.driveLinks,
      { label: adding.label.trim() || adding.url.trim(), url: adding.url.trim() },
    ]
    await fetch(`/api/turmas/${turma.id}/aulas/${aula.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driveLinks: newLinks }),
    })
    setAdding(null)
    onRefresh()
  }

  return (
    <>
      {/* Panel header */}
      <div
        className="sticky top-0 z-10 px-5 border-b flex-shrink-0"
        style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
      >
        <div className="flex items-center gap-2 pt-3 pb-0">
          <span className="text-xs" style={{ color: 'var(--c-subtle)' }}>
            {MONTHS_PT[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
          </span>
        </div>
        <div className="flex gap-1 mt-2">
          {(['conteudo', 'presencas', 'professores'] as Tab[]).map((t) => {
            const active = tab === t
            const tabLabel = {
              conteudo:    <><HiDocumentText className="w-3.5 h-3.5" /> Conteúdo</>,
              presencas:   <><HiClipboardDocumentCheck className="w-3.5 h-3.5" /> Presenças</>,
              professores: <><HiUserGroup className="w-3.5 h-3.5" /> Professores</>,
            }[t]
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors"
                style={{
                  borderColor: active ? turma.iconColor : 'transparent',
                  color: active ? turma.iconColor : 'var(--c-subtle)',
                }}
              >
                {tabLabel}
              </button>
            )
          })}
        </div>
      </div>

      {/* Conteúdo tab */}
      {tab === 'conteudo' && (
        <div className="p-4 flex flex-col gap-3">
          {monthAulas.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-16 text-center flex-col gap-2">
              <HiDocumentText className="w-10 h-10" style={{ color: 'var(--c-faint)' }} />
              <p className="font-semibold" style={{ color: 'var(--c-text)' }}>Nenhuma aula este mês</p>
              <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>
                Use o calendário para criar aulas neste período.
              </p>
            </div>
          ) : (
            monthAulas.map((aula) => (
              <AulaCard
                key={aula.id}
                aula={aula}
                turma={turma}
                canEdit={canEdit}
                currentUser={currentUser}
                adding={adding?.aulaId === aula.id ? adding : null}
                onStart={() => setAdding({ aulaId: aula.id, label: '', url: '', saving: false })}
                onCancel={() => setAdding(null)}
                onChange={(f, v) => setAdding((s) => s ? { ...s, [f]: v } : null)}
                onSubmit={() => submitMaterial(aula)}
                onRefresh={onRefresh}
              />
            ))
          )}
        </div>
      )}

      {/* Presenças tab */}
      {tab === 'presencas' && (
        <PresencasPanel
          turma={turma}
          monthAulas={monthAulas}
          canEdit={canEdit}
          currentUser={currentUser}
          onRefresh={onRefresh}
        />
      )}

      {/* Professores tab */}
      {tab === 'professores' && (
        <ProfessoresPanel
          turma={turma}
          currentUser={currentUser}
          onRefresh={onRefreshTurma}
        />
      )}
    </>
  )
}

// ─── AulaCard ────────────────────────────────────────────────────────────────

interface CardProps {
  aula: Aula
  turma: Turma
  canEdit: boolean
  currentUser: UserProfile | null
  adding: AddState | null
  onStart: () => void
  onCancel: () => void
  onChange: (field: 'label' | 'url', value: string) => void
  onSubmit: () => void
  onRefresh: () => void
}

function isAulaActive(aula: Aula): boolean {
  const [y, m, d] = aula.date.split('-').map(Number)
  const [sh, sm] = aula.startTime.split(':').map(Number)
  const [eh, em] = aula.endTime.split(':').map(Number)
  const now = new Date()
  const start = new Date(y, m - 1, d, sh, sm)
  const end = new Date(y, m - 1, d, eh, em)
  return now >= start && now <= end
}

function AulaCard({
  aula, turma, canEdit, currentUser, adding,
  onStart, onCancel, onChange, onSubmit, onRefresh,
}: CardProps) {
  const [viewingLink, setViewingLink] = useState<DriveLink | null>(null)
  const [creatingAvaliacao, setCreatingAvaliacao] = useState(false)
  const [testingAvaliacao, setTestingAvaliacao] = useState(false)
  const [chamadaCode, setChamadaCode] = useState('')
  const [chamadaState, setChamadaState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [chamadaError, setChamadaError] = useState<string | null>(null)

  const date = parseLocalDate(aula.date)
  const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  const detectedType = adding?.url ? detectType(adding.url) : null
  const avaliacoes = aula.avaliacoes ?? []

  const isStudent = !canEdit && currentUser?.role === 'student'
  const studentEmail = currentUser?.email ?? null
  const alreadyPresent = studentEmail ? aula.attendance[studentEmail] === 'present' : false
  const aulaAtiva = isAulaActive(aula)

  async function submitChamada() {
    if (!chamadaCode.trim() || chamadaState === 'loading') return
    setChamadaState('loading')
    setChamadaError(null)
    const res = await fetch(`/api/turmas/${turma.id}/aulas/${aula.id}/chamada`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: chamadaCode.trim() }),
    })
    if (res.ok) {
      setChamadaState('ok')
      onRefresh()
    } else {
      const d = await res.json()
      setChamadaError(d.error ?? 'Erro ao registrar presença.')
      setChamadaState('error')
    }
  }

  async function saveAvaliacao(data: Omit<Avaliacao, 'id' | 'createdAt'>) {
    const newAv: Avaliacao = { ...data, id: genId(), createdAt: new Date().toISOString() }
    await fetch(`/api/turmas/${turma.id}/aulas/${aula.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avaliacoes: [...avaliacoes, newAv] }),
    })
    setCreatingAvaliacao(false)
    onRefresh()
  }

  async function deleteAvaliacao(id: string) {
    if (!confirm('Excluir esta avaliação?')) return
    await fetch(`/api/turmas/${turma.id}/aulas/${aula.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avaliacoes: avaliacoes.filter((a) => a.id !== id) }),
    })
    onRefresh()
  }

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
      transition={{ duration: 0.25, ease }}
    >
      {/* Aula info — read-only */}
      <div
        className="px-4 pt-3.5 pb-3"
        style={{ borderLeft: `3px solid ${turma.iconColor}` }}
      >
        <p className="text-sm font-semibold leading-snug truncate" style={{ color: 'var(--c-text)' }}>
          {aula.title}
        </p>
        <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--c-subtle)' }}>
          {dateStr} · {aula.startTime} – {aula.endTime}
        </p>

        {aula.teachers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {aula.teachers.map((t) => (
              <span
                key={t.uid}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ background: `${turma.iconColor}12`, color: turma.iconColor }}
              >
                {t.name}
              </span>
            ))}
          </div>
        )}

        {aula.description && (
          <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--c-muted)' }}>
            {aula.description}
          </p>
        )}
      </div>

      {/* ── Materiais ── */}
      <div
        className="px-4 py-2.5 flex flex-col gap-1.5 border-t"
        style={{ borderColor: 'var(--c-border)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
            Materiais
          </span>
          {canEdit && !adding && (
            <button
              onClick={onStart}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg border transition-opacity hover:opacity-80"
              style={{ borderColor: turma.iconColor, color: turma.iconColor }}
            >
              <HiPlus className="w-3 h-3" /> Adicionar
            </button>
          )}
        </div>

        {aula.driveLinks.length === 0 && !adding && (
          <p className="text-xs py-0.5" style={{ color: 'var(--c-faint)' }}>Nenhum material.</p>
        )}

        {aula.driveLinks.map((link, i) => {
          const type = detectType(link.url)
          return (
            <button
              key={i}
              onClick={() => setViewingLink(link)}
              className="flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5 transition-opacity hover:opacity-75 text-left w-full"
              style={{ background: 'var(--c-bg)', color: 'var(--c-text)' }}
            >
              {type === 'video'
                ? <HiVideoCamera className="w-3.5 h-3.5 flex-shrink-0" style={{ color: turma.iconColor }} />
                : <HiArrowTopRightOnSquare className="w-3.5 h-3.5 flex-shrink-0" style={{ color: turma.iconColor }} />
              }
              <span className="truncate">{link.label || link.url}</span>
            </button>
          )
        })}

        {/* Inline add material form */}
        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: 'var(--c-subtle)' }}>
                    Novo material
                  </span>
                  {detectedType === 'video' && (
                    <span
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: `${turma.iconColor}18`, color: turma.iconColor }}
                    >
                      <HiVideoCamera className="w-3 h-3" /> Vídeo
                    </span>
                  )}
                </div>
                <input
                  type="url"
                  value={adding.url}
                  onChange={(e) => onChange('url', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                  placeholder="URL (YouTube, Vimeo, Drive...)"
                  className="rounded-lg px-2.5 py-1.5 text-xs border outline-none"
                  style={inputStyle}
                  autoFocus
                />
                <input
                  type="text"
                  value={adding.label}
                  onChange={(e) => onChange('label', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                  placeholder="Nome do material (opcional)"
                  className="rounded-lg px-2.5 py-1.5 text-xs border outline-none"
                  style={inputStyle}
                />
                <div className="flex gap-2">
                  <button
                    onClick={onCancel}
                    className="flex-1 py-1.5 rounded-lg text-xs border"
                    style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-muted)' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={onSubmit}
                    disabled={!adding.url.trim() || adding.saving}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-opacity disabled:opacity-40"
                    style={{ background: turma.iconColor, color: '#fff' }}
                  >
                    {adding.saving ? 'Salvando...' : 'Adicionar'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Avaliações ── */}
      <div
        className="px-4 py-2.5 flex flex-col gap-1.5 border-t"
        style={{ borderColor: 'var(--c-border)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
            Avaliações
          </span>
          {canEdit && (
            <button
              onClick={() => setCreatingAvaliacao(true)}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg border transition-opacity hover:opacity-80"
              style={{ borderColor: turma.iconColor, color: turma.iconColor }}
            >
              <HiPlus className="w-3 h-3" /> Criar
            </button>
          )}
        </div>

        {avaliacoes.length === 0 ? (
          <p className="text-xs py-0.5" style={{ color: 'var(--c-faint)' }}>Nenhuma avaliação.</p>
        ) : (
          <>
            {avaliacoes.map((av) => {
              const TypeIcon = AVALIACAO_ICON[av.type]
              return (
                <div
                  key={av.id}
                  className="flex items-start gap-2 rounded-lg px-2.5 py-2"
                  style={{ background: 'var(--c-bg)' }}
                >
                  <TypeIcon
                    className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                    style={{ color: turma.iconColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug" style={{ color: 'var(--c-text)' }}>
                      {av.question}
                    </p>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-1 inline-block"
                      style={{ background: `${turma.iconColor}12`, color: turma.iconColor }}
                    >
                      {AVALIACAO_LABEL[av.type]}
                    </span>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => deleteAvaliacao(av.id)}
                      className="w-6 h-6 flex items-center justify-center rounded flex-shrink-0 transition-opacity hover:opacity-80"
                      style={{ color: 'var(--c-faint)' }}
                      title="Excluir avaliação"
                    >
                      <HiTrash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )
            })}

            <button
              onClick={() => setTestingAvaliacao(true)}
              className="mt-1 w-full py-1.5 rounded-lg text-xs font-semibold border transition-opacity hover:opacity-80"
              style={{ borderColor: turma.iconColor, color: turma.iconColor }}
            >
              Testar avaliação
            </button>
          </>
        )}
      </div>

      {/* ── Responder chamada (alunos) ── */}
      {isStudent && (
        <div
          className="px-4 py-2.5 flex flex-col gap-1.5 border-t"
          style={{ borderColor: 'var(--c-border)' }}
        >
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
            Chamada
          </span>

          {alreadyPresent || chamadaState === 'ok' ? (
            <div className="flex items-center gap-2 py-1">
              <HiCheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />
              <span className="text-xs font-medium" style={{ color: '#22c55e' }}>Presença registrada</span>
            </div>
          ) : !aulaAtiva ? (
            <p className="text-xs py-0.5" style={{ color: 'var(--c-faint)' }}>
              Campo disponível somente durante o horário da aula.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={chamadaCode}
                  onChange={(e) => { setChamadaCode(e.target.value.replace(/\D/g, '')); setChamadaState('idle'); setChamadaError(null) }}
                  onKeyDown={(e) => e.key === 'Enter' && submitChamada()}
                  placeholder="Código de 4 dígitos"
                  className="flex-1 rounded-lg px-2.5 py-1.5 text-sm border outline-none font-mono tracking-widest"
                  style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border-md)', color: 'var(--c-text)' }}
                />
                <button
                  onClick={submitChamada}
                  disabled={chamadaCode.length !== 4 || chamadaState === 'loading'}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity disabled:opacity-40"
                  style={{ background: turma.iconColor, color: '#fff' }}
                >
                  {chamadaState === 'loading' ? '...' : 'Confirmar'}
                </button>
              </div>
              {chamadaState === 'error' && chamadaError && (
                <p className="text-xs" style={{ color: '#ef4444' }}>{chamadaError}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Overlays ── */}
      <AnimatePresence>
        {viewingLink && (
          <MaterialViewer
            link={viewingLink}
            accentColor={turma.iconColor}
            onClose={() => setViewingLink(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {creatingAvaliacao && (
          <AvaliacaoFormModal
            accentColor={turma.iconColor}
            onSave={saveAvaliacao}
            onClose={() => setCreatingAvaliacao(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {testingAvaliacao && avaliacoes.length > 0 && (
          <TesteAvaliacaoModal
            avaliacoes={avaliacoes}
            accentColor={turma.iconColor}
            onClose={() => setTestingAvaliacao(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── PresencasPanel ──────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  present: 'P',
  absent: 'F',
  late: 'A',
}
const STATUS_COLOR: Record<string, string> = {
  present: '#22c55e',
  absent: '#ef4444',
  late: '#f59e0b',
}

interface PresencasPanelProps {
  turma: Turma
  monthAulas: Aula[]
  canEdit: boolean
  currentUser: UserProfile | null
  onRefresh: () => void
}

function PresencasPanel({ turma, monthAulas, canEdit, currentUser }: PresencasPanelProps) {
  const studentEmail = currentUser?.email ?? null

  if (monthAulas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
        <HiClipboardDocumentCheck className="w-10 h-10" style={{ color: 'var(--c-faint)' }} />
        <p className="font-semibold" style={{ color: 'var(--c-text)' }}>Nenhuma aula este mês</p>
        <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>
          As listas de presença aparecerão aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-3">
      {monthAulas.map((aula) => {
        const date = parseLocalDate(aula.date)
        const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })

        // Teacher/admin: show all enrolled students
        const studentList = canEdit ? turma.students : (studentEmail ? [studentEmail] : [])
        const totalPresent = Object.values(aula.attendance).filter((s) => s === 'present').length
        const totalStudents = turma.students.length

        return (
          <div
            key={aula.id}
            className="rounded-2xl overflow-hidden border"
            style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
          >
            {/* Aula info */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderLeft: `3px solid ${turma.iconColor}` }}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--c-text)' }}>
                  {aula.title}
                </p>
                <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--c-subtle)' }}>
                  {dateStr} · {aula.startTime} – {aula.endTime}
                </p>
              </div>
              {canEdit && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-2"
                  style={{ background: `${turma.iconColor}18`, color: turma.iconColor }}
                >
                  {totalPresent}/{totalStudents} P
                </span>
              )}
            </div>

            {/* Student list */}
            <div className="border-t" style={{ borderColor: 'var(--c-border)' }}>
              {studentList.length === 0 ? (
                <p className="text-xs px-4 py-2.5" style={{ color: 'var(--c-faint)' }}>
                  {canEdit ? 'Nenhum aluno matriculado.' : 'Sem dados de presença.'}
                </p>
              ) : (
                studentList.map((email, i) => {
                  const status = aula.attendance[email] ?? null
                  return (
                    <div
                      key={email}
                      className="flex items-center gap-3 px-4 py-2"
                      style={{ borderTop: i === 0 ? 'none' : `1px solid var(--c-border)` }}
                    >
                      <span className="flex-1 text-xs truncate" style={{ color: 'var(--c-text)' }}>
                        {email}
                      </span>
                      {status ? (
                        <span
                          className="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0"
                          style={{ background: `${STATUS_COLOR[status]}18`, color: STATUS_COLOR[status] }}
                        >
                          {STATUS_LABEL[status]}
                        </span>
                      ) : (
                        <span
                          className="text-xs w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0"
                          style={{ background: 'var(--c-bg)', color: 'var(--c-faint)' }}
                        >
                          —
                        </span>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── ProfessoresPanel ─────────────────────────────────────────────────────────

// Deterministic mock phone from uid so the same teacher always gets the same number
function mockPhone(uid: string): string {
  const n = uid.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const p1 = String(10000 + (n % 90000)).slice(0, 5)
  const p2 = String(1000 + ((n * 13) % 9000)).slice(0, 4)
  return `(11) 9${p1.slice(0, 4)}-${p2}`
}

interface ProfessoresPanelProps {
  turma: Turma
  currentUser: UserProfile | null
  onRefresh: () => void
}

type DbTeacher = { uid: string; name: string; email: string }

function ProfessoresPanel({ turma, currentUser, onRefresh }: ProfessoresPanelProps) {
  const isAdmin = currentUser?.role === 'admin'
  const professors: TurmaTeacher[] = turma.professors ?? []

  const [showPicker, setShowPicker] = useState(false)
  const [dbTeachers, setDbTeachers] = useState<DbTeacher[]>([])
  const [loadingDb, setLoadingDb] = useState(false)
  const [saving, setSaving] = useState(false)

  async function openPicker() {
    setShowPicker(true)
    if (dbTeachers.length > 0) return
    setLoadingDb(true)
    const res = await fetch('/api/users/teachers')
    if (res.ok) setDbTeachers(await res.json())
    setLoadingDb(false)
  }

  async function addProfessor(t: DbTeacher) {
    if (professors.find((p) => p.uid === t.uid)) return
    const newProf: TurmaTeacher = {
      uid: t.uid,
      name: t.name,
      email: t.email,
      phone: mockPhone(t.uid),
    }
    setSaving(true)
    await fetch(`/api/admin/turmas/${turma.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ professors: [...professors, newProf] }),
    })
    setSaving(false)
    setShowPicker(false)
    onRefresh()
  }

  async function removeProfessor(uid: string) {
    if (!confirm('Remover este professor da turma?')) return
    await fetch(`/api/admin/turmas/${turma.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ professors: professors.filter((p) => p.uid !== uid) }),
    })
    onRefresh()
  }

  const available = dbTeachers.filter((t) => !professors.find((p) => p.uid === t.uid))

  return (
    <div className="p-4 flex flex-col gap-3">
      {/* Header row */}
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={openPicker}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80"
            style={{ borderColor: turma.iconColor, color: turma.iconColor }}
          >
            <HiPlus className="w-3.5 h-3.5" /> Importar professor
          </button>
        </div>
      )}

      {/* Picker dropdown */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease }}
            className="overflow-hidden rounded-xl border"
            style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg)' }}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'var(--c-border)' }}>
              <span className="text-xs font-medium" style={{ color: 'var(--c-subtle)' }}>
                Selecionar da base de dados
              </span>
              <button onClick={() => setShowPicker(false)} style={{ color: 'var(--c-faint)' }}>
                <HiXMark className="w-4 h-4" />
              </button>
            </div>
            {loadingDb ? (
              <p className="text-xs px-3 py-3" style={{ color: 'var(--c-subtle)' }}>Carregando...</p>
            ) : available.length === 0 ? (
              <p className="text-xs px-3 py-3" style={{ color: 'var(--c-faint)' }}>
                {dbTeachers.length === 0 ? 'Nenhum professor cadastrado.' : 'Todos os professores já estão na turma.'}
              </p>
            ) : (
              available.map((t, i) => (
                <button
                  key={t.uid}
                  onClick={() => !saving && addProfessor(t)}
                  disabled={saving}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:opacity-80 disabled:opacity-50"
                  style={{ borderTop: i === 0 ? 'none' : `1px solid var(--c-border)` }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: `${turma.iconColor}20`, color: turma.iconColor }}
                  >
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--c-text)' }}>{t.name}</p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--c-subtle)' }}>{t.email}</p>
                  </div>
                  <HiPlus className="w-3.5 h-3.5 flex-shrink-0 ml-auto" style={{ color: turma.iconColor }} />
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Professor list */}
      {professors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
          <HiUserGroup className="w-10 h-10" style={{ color: 'var(--c-faint)' }} />
          <p className="font-semibold" style={{ color: 'var(--c-text)' }}>Nenhum professor nesta turma</p>
          {isAdmin && (
            <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>
              Use "Importar professor" para adicionar da base de dados.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {professors.map((prof) => (
            <div
              key={prof.uid}
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
            >
              <div
                className="px-4 py-3 flex items-center gap-3"
                style={{ borderLeft: `3px solid ${turma.iconColor}` }}
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                  style={{ background: `${turma.iconColor}20`, color: turma.iconColor }}
                >
                  {prof.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--c-text)' }}>
                    {prof.name}
                  </p>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-subtle)' }}>
                      <HiEnvelope className="w-3 h-3 flex-shrink-0" />
                      {prof.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-subtle)' }}>
                      <HiPhone className="w-3 h-3 flex-shrink-0" />
                      {prof.phone ?? '—'}
                    </span>
                  </div>
                </div>

                {/* Remove (admin only) */}
                {isAdmin && (
                  <button
                    onClick={() => removeProfessor(prof.uid)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-opacity hover:opacity-80"
                    style={{ color: 'var(--c-faint)' }}
                    title="Remover professor"
                  >
                    <HiTrash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
