'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiDocumentText, HiVideoCamera, HiArrowTopRightOnSquare,
  HiPlus, HiXMark, HiTrash, HiLink, HiPencilSquare, HiListBullet,
  HiClipboardDocumentCheck, HiCheckCircle, HiUserGroup, HiEnvelope, HiPhone,
  HiPresentationChartBar, HiUsers, HiAcademicCap, HiCalendarDays,
  HiLightBulb, HiClock, HiArrowTrendingUp, HiArrowTrendingDown,
  HiEye, HiEyeSlash,
} from 'react-icons/hi2'
import type { Turma, Aula, DriveLink, Avaliacao, UserProfile, TurmaTeacher } from '@/types'
import { MaterialViewer } from './MaterialViewer'
import { AvaliacaoFormModal } from './AvaliacaoFormModal'
import { TesteAvaliacaoModal } from './TesteAvaliacaoModal'
import { BancoPanel } from './BancoPanel'
import { AulaModal } from './AulaModal'
import { AnotacoesPanel } from './AnotacoesPanel'

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

type Tab = 'estatisticas' | 'conteudo' | 'presencas' | 'professores' | 'banco' | 'anotacoes'

export function ConteudoPanel({ turma, aulas, selectedMonth, canEdit, currentUser, onRefresh, onRefreshTurma }: Props) {
  const [adding, setAdding] = useState<AddState | null>(null)
  const [tab, setTab] = useState<Tab>(canEdit ? 'estatisticas' : 'conteudo')
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
        <div className="flex gap-1 mt-2 overflow-x-auto">
          {((['estatisticas', 'conteudo', 'presencas', 'professores', 'banco', 'anotacoes'] as Tab[]).filter(
            (t) =>
              (t !== 'estatisticas' || canEdit) &&
              (t !== 'presencas' || canEdit) &&
              (t !== 'banco' || canEdit) &&
              (t !== 'anotacoes' || !canEdit)
          )).map((t) => {
            const active = tab === t
            const tabLabel = {
              estatisticas: <><HiPresentationChartBar className="w-3.5 h-3.5" /> Visão geral</>,
              conteudo:     <><HiDocumentText className="w-3.5 h-3.5" /> Conteúdo</>,
              presencas:    <><HiClipboardDocumentCheck className="w-3.5 h-3.5" /> Presenças</>,
              professores:  <><HiUserGroup className="w-3.5 h-3.5" /> Professores</>,
              banco:        <><HiListBullet className="w-3.5 h-3.5" /> Banco de Aulas</>,
              anotacoes:    <><HiPencilSquare className="w-3.5 h-3.5" /> Anotações</>,
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
                      onStart={() => setAdding({ aulaId: aula.id, label: '', url: '', saving: false })}
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
  const [editingAula, setEditingAula] = useState(false)
  const [creatingAvaliacao, setCreatingAvaliacao] = useState(false)
  const [testingAvaliacao, setTestingAvaliacao] = useState(false)
  const date = parseLocalDate(aula.date)
  const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  const detectedType = adding?.url ? detectType(adding.url) : null
  const avaliacoes = aula.avaliacoes ?? []

  const isStudent = !canEdit && currentUser?.role === 'student'

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

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
      transition={{ duration: 0.25, ease }}
    >
      {/* Aula info */}
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
                style={{ background: '#f59e0b18', color: '#f59e0b' }}
              >
                Pendente
              </span>
            )}
          </div>
          {canEdit && (
            <button
              onClick={() => setEditingAula(true)}
              className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 transition-opacity hover:opacity-80 mt-0.5"
              style={{ color: 'var(--c-subtle)' }}
              title="Editar aula"
            >
              <HiPencilSquare className="w-3.5 h-3.5" />
            </button>
          )}
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

        {materialsLocked ? (
          <p className="text-xs py-0.5" style={{ color: 'var(--c-faint)' }}>
            Disponível a partir de {unlockDateStr}.
          </p>
        ) : aula.driveLinks.length === 0 && !adding ? (
          <p className="text-xs py-0.5" style={{ color: 'var(--c-faint)' }}>Nenhum material.</p>
        ) : null}

        {!materialsLocked && aula.driveLinks.map((link, i) => {
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
        ) : isStudent ? (
          <button
            onClick={() => setTestingAvaliacao(true)}
            className="w-full py-1.5 rounded-lg text-xs font-semibold border transition-opacity hover:opacity-80"
            style={{ borderColor: turma.iconColor, color: turma.iconColor }}
          >
            Responder Avaliação
          </button>
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
            students={turma.students}
            canEdit={canEdit}
            isAdmin={currentUser?.role === 'admin'}
            currentUserUid={currentUser?.uid ?? ''}
            currentUserEmail={currentUser?.email}
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

interface PresencaAulaRowProps {
  aula: Aula
  turma: Turma
  canEdit: boolean
  studentList: string[]
  todayISO: string
}

function PresencaAulaRow({ aula, turma, canEdit, studentList, todayISO }: PresencaAulaRowProps) {
  const [showCode, setShowCode] = useState(false)

  const date = parseLocalDate(aula.date)
  const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  const totalPresent = Object.values(aula.attendance).filter((s) => s === 'present').length
  const totalStudents = turma.students.length
  const isFuture = aula.date > todayISO
  const isToday = aula.date === todayISO
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
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80"
              style={{ borderColor: turma.iconColor, color: turma.iconColor }}
            >
              {showCode
                ? <><HiEyeSlash className="w-3.5 h-3.5" /> Ocultar código</>
                : <><HiEye className="w-3.5 h-3.5" /> Começar a chamada</>
              }
            </button>
            <button
              disabled
              title="Em breve"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border opacity-40 cursor-not-allowed"
              style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
            >
              <HiPencilSquare className="w-3.5 h-3.5" /> Editar lista de chamada
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function PresencasPanel({ turma, monthAulas, canEdit, currentUser }: PresencasPanelProps) {
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

function dateToISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekBounds(): { mon: string; sun: string } {
  const today = new Date()
  const dow = today.getDay()
  const mon = new Date(today)
  mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  return { mon: dateToISO(mon), sun: dateToISO(sun) }
}

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

  const { mon, sun } = getWeekBounds()
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
      ? { label: 'Ótima', color: '#22c55e' }
      : avgAttendancePct >= 65
      ? { label: 'Boa', color: '#10b981' }
      : avgAttendancePct >= 50
      ? { label: 'Regular', color: '#f59e0b' }
      : { label: 'Baixa', color: '#ef4444' }

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
      color: '#f59e0b',
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
      color: '#22c55e',
    })
  } else if (avgAttendancePct !== null && avgAttendancePct < 65) {
    insights.push({
      icon: <HiArrowTrendingDown className="w-4 h-4 flex-shrink-0" />,
      text: `Frequência média de ${avgAttendancePct}% — considere estratégias para aumentar o engajamento.`,
      color: '#ef4444',
    })
  }

  if (neverPresent.length > 0) {
    insights.push({
      icon: <HiUsers className="w-4 h-4 flex-shrink-0" />,
      text: `${neverPresent.length} aluno${neverPresent.length !== 1 ? 's' : ''} ainda não registrou${neverPresent.length !== 1 ? 'ram' : ''} presença em nenhuma aula.`,
      color: '#f59e0b',
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
              : `Começa em ${remainingDays} dia${remainingDays !== 1 ? 's' : ''}`}
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
