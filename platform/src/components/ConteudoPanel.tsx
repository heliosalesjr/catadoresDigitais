'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  HiDocumentText, HiVideoCamera, HiArrowTopRightOnSquare,
  HiPlus, HiXMark, HiTrash, HiPencilSquare, HiListBullet,
  HiClipboardDocumentCheck, HiCheckCircle, HiUserGroup, HiEnvelope, HiPhone,
  HiPresentationChartBar, HiUsers, HiAcademicCap, HiCalendarDays,
  HiLightBulb, HiClock, HiArrowTrendingUp, HiArrowTrendingDown,
  HiEye, HiEyeSlash, HiChevronDown, HiChevronUp, HiChevronRight, HiArrowPath, HiBars3BottomLeft,
} from 'react-icons/hi2'
import type { IconType } from 'react-icons'
import type { Turma, Aula, Material, Avaliacao, UserProfile, TurmaTeacher } from '@/types'
import { parseLocalDate, dateToISO, getWeekISO } from '@/lib/date-utils'
import { inputStyle } from '@/lib/styles'
import { AVALIACAO_ICON, AVALIACAO_LABEL } from '@/lib/constants'
import { genId } from '@/lib/utils'
import { MaterialViewer } from './MaterialViewer'
import { AvaliacaoFormModal } from './AvaliacaoFormModal'
import { TesteAvaliacaoModal } from './TesteAvaliacaoModal'
import { BancoPanel } from './BancoPanel'
import { AulaModal } from './AulaModal'
import { ChamadaEditModal } from './ChamadaEditModal'
import { AnotacoesPanel } from './AnotacoesPanel'

const MONTHS_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

const ease = [0.32, 0.72, 0, 1] as const

function detectType(url: string): 'video' | 'file' {
  try {
    const h = new URL(url).hostname
    if (h.includes('youtube.com') || h.includes('youtu.be') || h.includes('vimeo.com')) return 'video'
  } catch {}
  return 'file'
}

interface Props {
  turma: Turma
  aulas: Aula[]
  selectedMonth: Date
  canEdit: boolean
  currentUser: UserProfile | null
  onRefresh: () => void
  onRefreshTurma: () => void
  initialTab?: string
  isMobile?: boolean
}

interface AddState {
  aulaId: string
  type: 'link' | 'text'
  label: string
  url: string
  content: string
  saving: boolean
}

type Tab = 'estatisticas' | 'conteudo' | 'presencas' | 'professores' | 'banco' | 'anotacoes'

const TAB_CONFIG: Record<Tab, { Icon: IconType; label: string }> = {
  estatisticas: { Icon: HiPresentationChartBar, label: 'Visão geral' },
  conteudo:     { Icon: HiDocumentText,          label: 'Conteúdo' },
  presencas:    { Icon: HiClipboardDocumentCheck, label: 'Presenças' },
  professores:  { Icon: HiUserGroup,             label: 'Professores' },
  banco:        { Icon: HiListBullet,            label: 'Banco de Aulas' },
  anotacoes:    { Icon: HiPencilSquare,          label: 'Anotações' },
}

export function ConteudoPanel({ turma, aulas, selectedMonth, canEdit, currentUser, onRefresh, onRefreshTurma, initialTab, isMobile }: Props) {
  const [adding, setAdding] = useState<AddState | null>(null)
  const [creatingAula, setCreatingAula] = useState(false)

  const validTabs: Tab[] = ['estatisticas', 'conteudo', 'presencas', 'professores', 'banco', 'anotacoes']
  const defaultTab: Tab = canEdit ? 'estatisticas' : 'conteudo'
  const [tab, setTab] = useState<Tab>(
    initialTab && validTabs.includes(initialTab as Tab) ? (initialTab as Tab) : defaultTab
  )
  const [conteudoSubTab, setConteudoSubTab] = useState<'proximas' | 'passadas'>('proximas')
  const [conteudoPage, setConteudoPage] = useState(1)
  const CONTEUDO_PAGE_SIZE = 10

  const todayStr = (() => {
    const t = new Date()
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
  })()

  const aulasProximas = aulas
    .filter((a) => a.date >= todayStr)
    .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))

  const aulaPassadas = aulas
    .filter((a) => a.date < todayStr)
    .sort((a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`))

  const monthAulas = aulas
    .filter((a) => {
      const [y, m] = a.date.split('-').map(Number)
      return y === selectedMonth.getFullYear() && m === selectedMonth.getMonth() + 1
    })
    .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))

  async function submitMaterial(aula: Aula) {
    if (!adding) return
    if (adding.type === 'link' && !adding.url.trim()) return
    if (adding.type === 'text' && !adding.content.trim()) return
    setAdding((s) => s ? { ...s, saving: true } : null)
    const newMaterial: Material = adding.type === 'text'
      ? { id: genId(), type: 'text', label: adding.label.trim() || 'Bloco de texto', content: adding.content.trim() }
      : { id: genId(), type: 'link', label: adding.label.trim() || adding.url.trim(), url: adding.url.trim() }
    const newLinks: Material[] = [...aula.driveLinks, newMaterial]
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
        className="sticky top-28 z-10 px-5 border-b flex-shrink-0"
        style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
      >
        <div className="flex items-center gap-2 pt-3 pb-0">
          <span
            className="text-sm font-bold px-3 py-1 rounded-lg"
            style={{ background: turma.iconColor, color: '#fff' }}
          >
            {MONTHS_PT[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
          </span>
        </div>
        <LayoutGroup id={`tabs-${turma.id}`}>
          <div
            className="flex mt-2"
            style={isMobile ? undefined : { gap: 2, overflowX: 'auto', overflowY: 'hidden' }}
          >
            {((['estatisticas', 'conteudo', 'presencas', 'professores', 'banco', 'anotacoes'] as Tab[]).filter(
              (t) =>
                (t !== 'estatisticas' || canEdit) &&
                (t !== 'presencas' || canEdit) &&
                (t !== 'banco' || canEdit) &&
                (t !== 'anotacoes' || !canEdit)
            )).map((t) => {
              const active = tab === t
              const { Icon, label } = TAB_CONFIG[t]
              const showLabel = !isMobile || active
              return (
                <motion.button
                  key={t}
                  layout
                  onClick={() => setTab(t)}
                  className="relative flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 overflow-hidden"
                  style={{
                    flex: isMobile ? '1 1 0' : '0 0 auto',
                    borderColor: active ? turma.iconColor : 'transparent',
                    color: active ? turma.iconColor : 'var(--c-subtle)',
                    transition: 'color 0.2s, border-color 0.2s',
                    minWidth: 0,
                  }}
                  transition={{ duration: 0.3, ease }}
                  title={isMobile && !active ? label : undefined}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <AnimatePresence>
                    {showLabel && (
                      <motion.span
                        key="lbl"
                        initial={{ opacity: 0, maxWidth: 0 }}
                        animate={{ opacity: 1, maxWidth: 160 }}
                        exit={{ opacity: 0, maxWidth: 0 }}
                        transition={{ duration: 0.25, ease }}
                        className="whitespace-nowrap overflow-hidden block"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              )
            })}
          </div>
        </LayoutGroup>
      </div>

      {/* Estatísticas tab */}
      {tab === 'estatisticas' && (
        <EstatisticasPanel turma={turma} aulas={aulas} />
      )}

      {/* Conteúdo tab */}
      {tab === 'conteudo' && (() => {
        const fullList = conteudoSubTab === 'proximas' ? aulasProximas : aulaPassadas
        const pagedList = fullList.slice(0, conteudoPage * CONTEUDO_PAGE_SIZE)
        const hasMore = pagedList.length < fullList.length
        return (
          <div className="flex flex-col gap-0">
            {/* Sub-tabs */}
            <div className="flex gap-1 px-4 pt-3 pb-2">
              {([
                { key: 'proximas' as const, label: 'Próximas aulas', count: aulasProximas.length },
                { key: 'passadas' as const, label: 'Passadas',       count: aulaPassadas.length },
              ]).map(({ key, label, count }) => {
                const active = conteudoSubTab === key
                return (
                  <button
                    key={key}
                    onClick={() => { setConteudoSubTab(key); setConteudoPage(1); setAdding(null) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                    style={{
                      background: active ? `${turma.iconColor}15` : 'transparent',
                      color: active ? turma.iconColor : 'var(--c-subtle)',
                      border: `1px solid ${active ? `${turma.iconColor}40` : 'var(--c-border)'}`,
                    }}
                  >
                    {label}
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                      style={{
                        background: active ? turma.iconColor : 'var(--c-bg)',
                        color: active ? '#fff' : 'var(--c-subtle)',
                      }}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* List */}
            <div className="px-4 pb-4 flex flex-col gap-3">
              {fullList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                  <HiDocumentText className="w-10 h-10" style={{ color: 'var(--c-faint)' }} />
                  <p className="font-semibold" style={{ color: 'var(--c-text)' }}>
                    {conteudoSubTab === 'proximas' ? 'Nenhuma aula agendada' : 'Nenhuma aula realizada ainda'}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>
                    {conteudoSubTab === 'proximas'
                      ? 'As próximas aulas aparecerão aqui quando forem agendadas.'
                      : 'O histórico de aulas anteriores aparecerá aqui.'}
                  </p>
                  {conteudoSubTab === 'proximas' && canEdit && (
                    <button
                      onClick={() => setCreatingAula(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg mt-2 transition-opacity hover:opacity-80"
                      style={{ background: turma.iconColor, color: '#fff' }}
                    >
                      <HiPlus className="w-3.5 h-3.5" /> Criar primeira aula
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {pagedList.map((aula) => (
                    <AulaCard
                      key={aula.id}
                      aula={aula}
                      turma={turma}
                      canEdit={canEdit}
                      currentUser={currentUser}
                      adding={adding?.aulaId === aula.id ? adding : null}
                      onStart={(type) => setAdding({ aulaId: aula.id, type, label: '', url: '', content: '', saving: false })}
                      onCancel={() => setAdding(null)}
                      onChange={(f, v) => setAdding((s) => s ? { ...s, [f]: v } : null)}
                      onSubmit={() => submitMaterial(aula)}
                      onRefresh={onRefresh}
                    />
                  ))}

                  {/* Pagination footer */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs" style={{ color: 'var(--c-subtle)' }}>
                      {pagedList.length} de {fullList.length} aula{fullList.length !== 1 ? 's' : ''}
                    </span>
                    {hasMore && (
                      <button
                        onClick={() => setConteudoPage((p) => p + 1)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                        style={{
                          background: `${turma.iconColor}15`,
                          color: turma.iconColor,
                          border: `1px solid ${turma.iconColor}40`,
                        }}
                      >
                        Ver mais ({fullList.length - pagedList.length} restantes)
                      </button>
                    )}
                  </div>

                  {conteudoSubTab === 'proximas' && canEdit && (
                    <button
                      onClick={() => setCreatingAula(true)}
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl border-2 border-dashed transition-colors hover:opacity-80"
                      style={{ borderColor: `${turma.iconColor}50`, color: turma.iconColor }}
                    >
                      <HiPlus className="w-3.5 h-3.5" /> Agendar nova aula
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )
      })()}

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

      {/* Banco de Aulas tab */}
      {tab === 'banco' && (
        <BancoPanel
          turma={turma}
          aulas={aulas}
          currentUser={currentUser}
          onRefreshAulas={onRefresh}
        />
      )}

      {/* Anotações tab */}
      {tab === 'anotacoes' && currentUser && (
        <AnotacoesPanel
          uid={currentUser.uid}
          turmaId={turma.id}
          accentColor={turma.iconColor}
        />
      )}

      <AnimatePresence>
        {creatingAula && (
          <AulaModal
            turmaId={turma.id}
            turmaIconColor={turma.iconColor}
            date={todayStr >= turma.startDate && todayStr <= turma.endDate ? todayStr : turma.startDate}
            turmaStartDate={turma.startDate}
            turmaEndDate={turma.endDate}
            aula={null}
            canEdit={canEdit}
            isAdmin={currentUser?.role === 'admin'}
            currentUserUid={currentUser?.uid ?? ''}
            initialMode="edit"
            onClose={() => setCreatingAula(false)}
            onSaved={() => { setCreatingAula(false); onRefresh() }}
          />
        )}
      </AnimatePresence>
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
  onStart: (type: 'link' | 'text') => void
  onCancel: () => void
  onChange: (field: 'label' | 'url' | 'content' | 'type', value: string) => void
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
  const [viewingLink, setViewingLink] = useState<Material | null>(null)
  const [expandedTexts, setExpandedTexts] = useState<Set<number>>(new Set())
  const [editingAula, setEditingAula] = useState(false)
  const [creatingAvaliacao, setCreatingAvaliacao] = useState(false)
  const [testingAvaliacao, setTestingAvaliacao] = useState(false)
  const [resposta, setResposta] = useState<{ answers: Record<string, string>; submittedAt: string } | null | 'loading'>('loading')
  const date = parseLocalDate(aula.date)
  const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  const detectedType = adding?.url ? detectType(adding.url) : null
  const avaliacoes = aula.avaliacoes ?? []

  const isStudent = !canEdit && currentUser?.role === 'student'

  useEffect(() => {
    if (!isStudent || avaliacoes.length === 0) { setResposta(null); return }
    fetch(`/api/turmas/${turma.id}/aulas/${aula.id}/respostas`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setResposta(data))
      .catch(() => setResposta(null))
  }, [])

  const aulaDate = parseLocalDate(aula.date)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const unlockDate = new Date(aulaDate); unlockDate.setDate(aulaDate.getDate() - 7)
  const materialsLocked = isStudent && aulaDate > today && unlockDate > today
  const unlockDateStr = unlockDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

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

  async function deleteMaterial(index: number) {
    const updated = aula.driveLinks.filter((_, i) => i !== index)
    await fetch(`/api/turmas/${turma.id}/aulas/${aula.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driveLinks: updated }),
    })
    onRefresh()
  }

  async function reorderMaterial(fromIdx: number, direction: 'up' | 'down') {
    const toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1
    if (toIdx < 0 || toIdx >= aula.driveLinks.length) return
    const updated = [...aula.driveLinks]
    ;[updated[fromIdx], updated[toIdx]] = [updated[toIdx], updated[fromIdx]]
    await fetch(`/api/turmas/${turma.id}/aulas/${aula.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driveLinks: updated }),
    })
    onRefresh()
  }

  function toggleText(index: number) {
    setExpandedTexts(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
      transition={{ duration: 0.25, ease }}
    >
      {/* Aula info */}
      {canEdit ? (
        <div
          className="px-4 pt-3.5 pb-3"
          style={{ borderLeft: `3px solid ${turma.iconColor}` }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              <p className="text-sm font-semibold leading-snug truncate" style={{ color: 'var(--c-text)' }}>
                {aula.title}
              </p>
              {aula.status === 'pending' && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'var(--c-warning-soft)', color: 'var(--c-warning)' }}
                >
                  Pendente
                </span>
              )}
            </div>
            <button
              onClick={() => setEditingAula(true)}
              className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 transition-opacity hover:opacity-80 mt-0.5"
              style={{ color: 'var(--c-subtle)' }}
              title="Editar aula"
            >
              <HiPencilSquare className="w-3.5 h-3.5" />
            </button>
          </div>
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
      ) : (
        <Link
          href={`/dashboard/aula/${turma.id}/${aula.id}`}
          className="block px-4 pt-3.5 pb-3 transition-opacity hover:opacity-75"
          style={{ borderLeft: `3px solid ${turma.iconColor}` }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              <p className="text-sm font-semibold leading-snug truncate" style={{ color: 'var(--c-text)' }}>
                {aula.title}
              </p>
              {aula.status === 'pending' && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'var(--c-warning-soft)', color: 'var(--c-warning)' }}
                >
                  Pendente
                </span>
              )}
            </div>
            <HiChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--c-faint)' }} />
          </div>
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
        </Link>
      )}

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
            <div className="flex items-center gap-1">
              <button
                onClick={() => onStart('link')}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg border transition-opacity hover:opacity-80"
                style={{ borderColor: turma.iconColor, color: turma.iconColor }}
                title="Adicionar link ou vídeo"
              >
                <HiPlus className="w-3 h-3" /> Link
              </button>
              <button
                onClick={() => onStart('text')}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg border transition-opacity hover:opacity-80"
                style={{ borderColor: turma.iconColor, color: turma.iconColor }}
                title="Adicionar bloco de texto"
              >
                <HiPlus className="w-3 h-3" /> Texto
              </button>
            </div>
          )}
        </div>

        {materialsLocked ? (
          <p className="text-xs py-0.5" style={{ color: 'var(--c-faint)' }}>
            Disponível a partir de {unlockDateStr}.
          </p>
        ) : aula.driveLinks.length === 0 && !adding ? (
          <p className="text-xs py-0.5" style={{ color: 'var(--c-faint)' }}>Nenhum material.</p>
        ) : null}

        {!materialsLocked && aula.driveLinks.map((material, i) => {
          const isText = material.type === 'text'
          const isExpanded = expandedTexts.has(i)
          const total = aula.driveLinks.length

          if (isText) {
            return (
              <div
                key={material.id ?? i}
                className="rounded-lg text-xs overflow-hidden"
                style={{ background: 'var(--c-bg)' }}
              >
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleText(i)}
                    className="flex items-center gap-2 flex-1 min-w-0 px-2.5 py-1.5 transition-opacity hover:opacity-75 text-left"
                    style={{ color: 'var(--c-text)' }}
                  >
                    <HiBars3BottomLeft className="w-3.5 h-3.5 flex-shrink-0" style={{ color: turma.iconColor }} />
                    <span className="truncate">{material.label || 'Bloco de texto'}</span>
                    <HiChevronDown
                      className="w-3 h-3 flex-shrink-0 ml-auto transition-transform"
                      style={{ color: 'var(--c-faint)', transform: isExpanded ? 'rotate(180deg)' : 'none' }}
                    />
                  </button>
                  {canEdit && (
                    <div className="flex items-center flex-shrink-0 mr-1 gap-0.5">
                      <button
                        onClick={() => reorderMaterial(i, 'up')}
                        disabled={i === 0}
                        className="w-5 h-5 flex items-center justify-center rounded transition-opacity hover:opacity-70 disabled:opacity-20"
                        style={{ color: 'var(--c-faint)' }}
                        title="Mover para cima"
                      >
                        <HiChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => reorderMaterial(i, 'down')}
                        disabled={i === total - 1}
                        className="w-5 h-5 flex items-center justify-center rounded transition-opacity hover:opacity-70 disabled:opacity-20"
                        style={{ color: 'var(--c-faint)' }}
                        title="Mover para baixo"
                      >
                        <HiChevronDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteMaterial(i)}
                        className="w-5 h-5 flex items-center justify-center rounded transition-opacity hover:opacity-70"
                        style={{ color: 'var(--c-faint)' }}
                        title="Remover material"
                      >
                        <HiTrash className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-3 py-2.5 text-xs leading-relaxed whitespace-pre-wrap border-t"
                        style={{ color: 'var(--c-text)', borderColor: 'var(--c-border)' }}
                      >
                        {material.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          }

          const type = detectType(material.url ?? '')
          return (
            <div
              key={material.id ?? i}
              className="flex items-center gap-1 rounded-lg text-xs"
              style={{ background: 'var(--c-bg)' }}
            >
              <button
                onClick={() => setViewingLink(material)}
                className="flex items-center gap-2 flex-1 min-w-0 px-2.5 py-1.5 transition-opacity hover:opacity-75 text-left"
                style={{ color: 'var(--c-text)' }}
              >
                {type === 'video'
                  ? <HiVideoCamera className="w-3.5 h-3.5 flex-shrink-0" style={{ color: turma.iconColor }} />
                  : <HiArrowTopRightOnSquare className="w-3.5 h-3.5 flex-shrink-0" style={{ color: turma.iconColor }} />
                }
                <span className="truncate">{material.label || material.url}</span>
              </button>
              {canEdit && (
                <div className="flex items-center flex-shrink-0 mr-1 gap-0.5">
                  <button
                    onClick={() => reorderMaterial(i, 'up')}
                    disabled={i === 0}
                    className="w-5 h-5 flex items-center justify-center rounded transition-opacity hover:opacity-70 disabled:opacity-20"
                    style={{ color: 'var(--c-faint)' }}
                    title="Mover para cima"
                  >
                    <HiChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => reorderMaterial(i, 'down')}
                    disabled={i === total - 1}
                    className="w-5 h-5 flex items-center justify-center rounded transition-opacity hover:opacity-70 disabled:opacity-20"
                    style={{ color: 'var(--c-faint)' }}
                    title="Mover para baixo"
                  >
                    <HiChevronDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteMaterial(i)}
                    className="w-5 h-5 flex items-center justify-center rounded transition-opacity hover:opacity-70"
                    style={{ color: 'var(--c-faint)' }}
                    title="Remover material"
                  >
                    <HiTrash className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
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
                    {adding.type === 'text' ? 'Bloco de texto' : 'Novo link'}
                  </span>
                  {adding.type === 'link' && detectedType === 'video' && (
                    <span
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: `${turma.iconColor}18`, color: turma.iconColor }}
                    >
                      <HiVideoCamera className="w-3 h-3" /> Vídeo
                    </span>
                  )}
                </div>
                {adding.type === 'link' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={adding.label}
                      onChange={(e) => onChange('label', e.target.value)}
                      placeholder="Título (opcional)"
                      className="rounded-lg px-2.5 py-1.5 text-xs border outline-none"
                      style={inputStyle}
                      autoFocus
                    />
                    <textarea
                      value={adding.content}
                      onChange={(e) => onChange('content', e.target.value)}
                      placeholder="Conteúdo do texto..."
                      rows={5}
                      className="rounded-lg px-2.5 py-1.5 text-xs border outline-none resize-y"
                      style={inputStyle}
                    />
                  </>
                )}
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
                    disabled={adding.type === 'link' ? (!adding.url.trim() || adding.saving) : (!adding.content.trim() || adding.saving)}
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
        ) : isStudent ? (
          resposta === 'loading' ? (
            <p className="text-xs py-0.5" style={{ color: 'var(--c-faint)' }}>Carregando...</p>
          ) : resposta ? (
            <div
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-center"
              style={{ background: `${turma.iconColor}15`, color: turma.iconColor }}
            >
              {Object.keys(resposta.answers).length} de {avaliacoes.length} {avaliacoes.length === 1 ? 'questão' : 'questões'} enviadas
            </div>
          ) : (
            <button
              onClick={() => setTestingAvaliacao(true)}
              className="w-full py-1.5 rounded-lg text-xs font-semibold border transition-opacity hover:opacity-80"
              style={{ borderColor: turma.iconColor, color: turma.iconColor }}
            >
              Responder Avaliação
            </button>
          )
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
            {...(isStudent ? {
              turmaId: turma.id,
              aulaId: aula.id,
              onSubmitted: () => {
                fetch(`/api/turmas/${turma.id}/aulas/${aula.id}/respostas`)
                  .then((r) => r.ok ? r.json() : null)
                  .then((data) => setResposta(data))
                  .catch(() => {})
              },
            } : {})}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingAula && (
          <AulaModal
            turmaId={turma.id}
            turmaIconColor={turma.iconColor}
            date={aula.date}
            turmaStartDate={turma.startDate}
            turmaEndDate={turma.endDate}
            aula={aula}
            canEdit={canEdit}
            isAdmin={currentUser?.role === 'admin'}
            currentUserUid={currentUser?.uid ?? ''}
            initialMode="edit"
            onClose={() => setEditingAula(false)}
            onSaved={() => { setEditingAula(false); onRefresh() }}
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
  present: 'var(--c-success)',
  absent: 'var(--c-danger)',
  late: 'var(--c-warning)',
}

interface PresencasPanelProps {
  turma: Turma
  monthAulas: Aula[]
  canEdit: boolean
  currentUser: UserProfile | null
  onRefresh: () => void
}

interface PresencaAulaRowProps {
  aula: Aula
  turma: Turma
  canEdit: boolean
  studentList: string[]
  todayISO: string
  onRefresh: () => void
}

function PresencaAulaRow({ aula, turma, canEdit, studentList, todayISO, onRefresh }: PresencaAulaRowProps) {
  const [showCode, setShowCode] = useState(false)
  const [editingChamada, setEditingChamada] = useState(false)
  const [showStudents, setShowStudents] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)

  async function handleRegenCode() {
    setRegenLoading(true)
    const newCode = String(Math.floor(1000 + Math.random() * 9000))
    await fetch(`/api/turmas/${turma.id}/aulas/${aula.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendanceCode: newCode }),
    })
    setRegenLoading(false)
    setShowCode(true)
    onRefresh()
  }

  const date = parseLocalDate(aula.date)
  const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  const totalPresent = Object.values(aula.attendance).filter((s) => s === 'present').length
  const totalStudents = turma.students.length
  const isFuture = aula.date > todayISO
  const isToday = aula.date === todayISO
  const isPast = aula.date < todayISO
  const hasAttendance = Object.keys(aula.attendance).length > 0

  return (
    <div
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
        {isFuture ? (
          <p className="text-xs px-4 py-2.5 italic" style={{ color: 'var(--c-faint)' }}>
            Aula ainda não aconteceu.
          </p>
        ) : isToday && !hasAttendance ? (
          <p className="text-xs px-4 py-2.5 italic" style={{ color: 'var(--c-faint)' }}>
            Professor ainda não abriu a chamada.
          </p>
        ) : studentList.length === 0 ? (
          <p className="text-xs px-4 py-2.5" style={{ color: 'var(--c-faint)' }}>
            {canEdit ? 'Nenhum aluno matriculado.' : 'Sem dados de presença.'}
          </p>
        ) : canEdit ? (
          <button
            onClick={() => setEditingChamada(true)}
            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--c-subtle)' }}
          >
            <span>Mostrar alunos ({studentList.length})</span>
            <HiPencilSquare className="w-3.5 h-3.5 flex-shrink-0" />
          </button>
        ) : (
          <>
            <button
              onClick={() => setShowStudents((v) => !v)}
              className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--c-subtle)' }}
            >
              <span>{showStudents ? 'Ocultar alunos' : `Mostrar alunos (${studentList.length})`}</span>
              <HiChevronDown
                className="w-3.5 h-3.5 transition-transform flex-shrink-0"
                style={{ transform: showStudents ? 'rotate(180deg)' : 'none' }}
              />
            </button>
            <AnimatePresence>
              {showStudents && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease }}
                  className="overflow-hidden border-t"
                  style={{ borderColor: 'var(--c-border)' }}
                >
                  {studentList.map((email, i) => {
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
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* ── Attendance code reveal (teacher/admin only) ── */}
      {canEdit && (
        <>
          <AnimatePresence>
            {showCode && aula.attendanceCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease }}
                className="overflow-hidden"
              >
                <div
                  className="border-t px-4 py-3 flex flex-col gap-1.5"
                  style={{ borderColor: 'var(--c-border)', background: `${turma.iconColor}08` }}
                >
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
                    Código de chamada
                  </span>
                  <p
                    className="text-4xl font-black font-mono tracking-[0.3em] leading-none"
                    style={{ color: turma.iconColor }}
                  >
                    {aula.attendanceCode}
                  </p>
                  <p className="text-xs leading-snug mt-1" style={{ color: 'var(--c-subtle)' }}>
                    Passe este código para os alunos. Ele expira ao final da aula ({aula.endTime}).
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="border-t px-4 py-2.5 flex flex-wrap gap-2"
            style={{ borderColor: 'var(--c-border)' }}
          >
            <button
              onClick={() => setShowCode((v) => !v)}
              disabled={isPast}
              title={isPast ? 'Aula já aconteceu' : undefined}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-opacity ${
                isPast ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-80'
              }`}
              style={{
                borderColor: isPast ? 'var(--c-border-md)' : turma.iconColor,
                color: isPast ? 'var(--c-subtle)' : turma.iconColor,
              }}
            >
              {showCode
                ? <><HiEyeSlash className="w-3.5 h-3.5" /> Ocultar código</>
                : <><HiEye className="w-3.5 h-3.5" /> Código de chamada</>
              }
            </button>
            <button
              onClick={handleRegenCode}
              disabled={isPast || regenLoading}
              title={isPast ? 'Aula já aconteceu' : 'Gerar novo código de chamada'}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-opacity ${
                isPast ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-80'
              }`}
              style={{
                borderColor: 'var(--c-border-md)',
                color: isPast ? 'var(--c-subtle)' : 'var(--c-muted)',
              }}
            >
              <HiArrowPath className={`w-3.5 h-3.5 ${regenLoading ? 'animate-spin' : ''}`} />
              {regenLoading ? 'Gerando...' : 'Novo código'}
            </button>
          </div>
        </>
      )}

      <AnimatePresence>
        {editingChamada && (
          <ChamadaEditModal
            turmaId={turma.id}
            turmaIconColor={turma.iconColor}
            aula={aula}
            students={studentList}
            onClose={() => setEditingChamada(false)}
            onChange={onRefresh}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function PresencasPanel({ turma, monthAulas, canEdit, currentUser, onRefresh }: PresencasPanelProps) {
  const studentEmail = currentUser?.email ?? null
  const todayISO = dateToISO(new Date())

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
        const studentList = canEdit ? turma.students : (studentEmail ? [studentEmail] : [])
        return (
          <PresencaAulaRow
            key={aula.id}
            aula={aula}
            turma={turma}
            canEdit={canEdit}
            studentList={studentList}
            todayISO={todayISO}
            onRefresh={onRefresh}
          />
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
  const canViewPhone = currentUser?.role === 'admin' || currentUser?.role === 'teacher'
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
                    {canViewPhone && (
                      <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-subtle)' }}>
                        <HiPhone className="w-3 h-3 flex-shrink-0" />
                        {prof.phone ?? '—'}
                      </span>
                    )}
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

// ─── EstatisticasPanel ────────────────────────────────────────────────────────


interface EstatisticasPanelProps {
  turma: Turma
  aulas: Aula[]
}

function EstatisticasPanel({ turma, aulas }: EstatisticasPanelProps) {
  const today = new Date()
  const start = parseLocalDate(turma.startDate)
  const end = parseLocalDate(turma.endDate)

  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000))
  const elapsedDays = Math.max(0, Math.round((today.getTime() - start.getTime()) / 86400000))
  const remainingDays = Math.max(0, Math.round((end.getTime() - today.getTime()) / 86400000))
  const daysUntilStart = Math.max(0, Math.round((start.getTime() - today.getTime()) / 86400000))
  const progress = Math.min(100, Math.round((elapsedDays / totalDays) * 100))
  const hasStarted = today >= start
  const hasEnded = today > end

  const { mon, sun } = getWeekISO()
  const aulasThisWeek = aulas.filter((a) => a.date >= mon && a.date <= sun)

  const totalStudents = turma.students.length
  const totalProfessors = turma.professors?.length ?? 0

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const aulasPast = aulas.filter((a) => a.date < todayStr)

  // Attendance stats across past aulas that have data
  const aulasWithData = aulasPast.filter((a) => Object.keys(a.attendance).length > 0)
  const avgAttendancePct =
    aulasWithData.length > 0 && totalStudents > 0
      ? Math.round(
          (aulasWithData.reduce((sum, a) => {
            const present = Object.values(a.attendance).filter((s) => s === 'present').length
            return sum + present / totalStudents
          }, 0) /
            aulasWithData.length) *
            100,
        )
      : null

  const attendanceQuality =
    avgAttendancePct === null
      ? null
      : avgAttendancePct >= 80
      ? { label: 'Ótima', color: 'var(--c-success)' }
      : avgAttendancePct >= 65
      ? { label: 'Boa', color: 'var(--c-success)' }
      : avgAttendancePct >= 50
      ? { label: 'Regular', color: 'var(--c-warning)' }
      : { label: 'Baixa', color: 'var(--c-danger)' }

  // Students who have never been present (considering only past aulas)
  const neverPresent =
    aulasWithData.length > 0
      ? turma.students.filter(
          (email) =>
            !aulasPast.some((a) => a.attendance[email] === 'present'),
        )
      : []

  // Generate insights
  const insights: { icon: React.ReactNode; text: string; color?: string }[] = []

  if (!hasStarted) {
    insights.push({
      icon: <HiClock className="w-4 h-4 flex-shrink-0" />,
      text: `O curso começa em ${daysUntilStart} dia${daysUntilStart !== 1 ? 's' : ''}.`,
    })
  } else if (hasEnded) {
    insights.push({
      icon: <HiClock className="w-4 h-4 flex-shrink-0" />,
      text: `O curso foi encerrado há ${elapsedDays - totalDays} dia${elapsedDays - totalDays !== 1 ? 's' : ''}.`,
    })
  } else if (remainingDays <= 14) {
    insights.push({
      icon: <HiClock className="w-4 h-4 flex-shrink-0" />,
      text: `Atenção: faltam apenas ${remainingDays} dia${remainingDays !== 1 ? 's' : ''} para o término do curso.`,
      color: 'var(--c-warning)',
    })
  }

  if (aulasThisWeek.length === 0 && hasStarted && !hasEnded) {
    insights.push({
      icon: <HiCalendarDays className="w-4 h-4 flex-shrink-0" />,
      text: 'Nenhuma aula programada para esta semana.',
      color: 'var(--c-subtle)',
    })
  } else if (aulasThisWeek.length > 0) {
    insights.push({
      icon: <HiCalendarDays className="w-4 h-4 flex-shrink-0" />,
      text: `${aulasThisWeek.length} aula${aulasThisWeek.length !== 1 ? 's' : ''} programada${aulasThisWeek.length !== 1 ? 's' : ''} esta semana.`,
    })
  }

  if (avgAttendancePct !== null && avgAttendancePct >= 80) {
    insights.push({
      icon: <HiArrowTrendingUp className="w-4 h-4 flex-shrink-0" />,
      text: `Frequência média de ${avgAttendancePct}% — excelente engajamento da turma!`,
      color: 'var(--c-success)',
    })
  } else if (avgAttendancePct !== null && avgAttendancePct < 65) {
    insights.push({
      icon: <HiArrowTrendingDown className="w-4 h-4 flex-shrink-0" />,
      text: `Frequência média de ${avgAttendancePct}% — considere estratégias para aumentar o engajamento.`,
      color: 'var(--c-danger)',
    })
  }

  if (neverPresent.length > 0) {
    insights.push({
      icon: <HiUsers className="w-4 h-4 flex-shrink-0" />,
      text: `${neverPresent.length} aluno${neverPresent.length !== 1 ? 's' : ''} ainda não registrou${neverPresent.length !== 1 ? 'ram' : ''} presença em nenhuma aula.`,
      color: 'var(--c-warning)',
    })
  }

  if (totalProfessors === 0) {
    insights.push({
      icon: <HiAcademicCap className="w-4 h-4 flex-shrink-0" />,
      text: 'Nenhum professor associado à turma ainda.',
      color: 'var(--c-subtle)',
    })
  }

  const statCards = [
    { label: 'Alunos', value: totalStudents, icon: <HiUsers className="w-4 h-4" /> },
    { label: 'Professores', value: totalProfessors, icon: <HiAcademicCap className="w-4 h-4" /> },
    { label: 'Aulas esta semana', value: aulasThisWeek.length, icon: <HiCalendarDays className="w-4 h-4" /> },
    { label: 'Total de aulas', value: aulas.length, icon: <HiDocumentText className="w-4 h-4" /> },
  ]

  return (
    <div className="p-4 flex flex-col gap-4">

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border px-4 py-3 flex flex-col gap-1"
            style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
          >
            <div className="flex items-center gap-1.5" style={{ color: 'var(--c-subtle)' }}>
              {s.icon}
              <span className="text-[11px] font-medium">{s.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Course progress */}
      <div
        className="rounded-2xl border px-4 py-3 flex flex-col gap-2"
        style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
            Progresso do curso
          </span>
          <span className="text-xs font-bold" style={{ color: turma.iconColor }}>
            {progress}%
          </span>
        </div>

        {/* Bar */}
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--c-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, background: turma.iconColor }}
          />
        </div>

        <div className="flex justify-between text-[11px]" style={{ color: 'var(--c-subtle)' }}>
          <span>
            {hasStarted
              ? hasEnded
                ? 'Encerrado'
                : `Iniciou há ${elapsedDays} dia${elapsedDays !== 1 ? 's' : ''}`
              : `Começa em ${daysUntilStart} dia${daysUntilStart !== 1 ? 's' : ''}`}
          </span>
          <span>
            {!hasEnded && `Faltam ${remainingDays} dia${remainingDays !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* Attendance */}
      <div
        className="rounded-2xl border px-4 py-3 flex flex-col gap-2"
        style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
            Frequência média
          </span>
          {attendanceQuality && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${attendanceQuality.color}18`, color: attendanceQuality.color }}
            >
              {attendanceQuality.label}
            </span>
          )}
        </div>

        {avgAttendancePct !== null ? (
          <>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--c-border)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${avgAttendancePct}%`, background: attendanceQuality?.color ?? turma.iconColor }}
              />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>
              {avgAttendancePct}%
              <span className="text-xs font-normal ml-1.5" style={{ color: 'var(--c-subtle)' }}>
                em {aulasWithData.length} aula{aulasWithData.length !== 1 ? 's' : ''} com dados
              </span>
            </p>
          </>
        ) : (
          <p className="text-sm" style={{ color: 'var(--c-faint)' }}>
            Nenhuma presença registrada ainda.
          </p>
        )}
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div
          className="rounded-2xl border px-4 py-3 flex flex-col gap-2"
          style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
        >
          <div className="flex items-center gap-1.5">
            <HiLightBulb className="w-3.5 h-3.5" style={{ color: turma.iconColor }} />
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-subtle)' }}>
              Insights
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span style={{ color: ins.color ?? turma.iconColor, marginTop: 1 }}>{ins.icon}</span>
                <p className="text-xs leading-relaxed" style={{ color: ins.color ?? 'var(--c-text)' }}>
                  {ins.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
