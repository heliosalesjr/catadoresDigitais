'use client'

import { useState, useEffect, useRef } from 'react'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import {
  HiPlus, HiArrowLeft, HiTrash, HiPencil, HiEye,
  HiCheckCircle, HiDocumentText,
} from 'react-icons/hi2'
import type { Nota } from '@/types'

const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold mb-3 mt-5 first:mt-0" style={{ color: 'var(--c-text)' }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold mb-2 mt-4 first:mt-0" style={{ color: 'var(--c-text)' }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold mb-1 mt-3 first:mt-0" style={{ color: 'var(--c-subtle)' }}>{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-base mb-3 last:mb-0 leading-relaxed" style={{ color: 'var(--c-text)' }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="text-base list-disc list-inside mb-3 space-y-1" style={{ color: 'var(--c-text)' }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-base list-decimal list-inside mb-3 space-y-1" style={{ color: 'var(--c-text)' }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-base leading-relaxed" style={{ color: 'var(--c-text)' }}>{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-bold" style={{ color: 'var(--c-text)' }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ color: 'var(--c-subtle)' }}>{children}</em>
  ),
  code: ({ children }) => (
    <code
      className="px-1.5 py-0.5 rounded text-sm font-mono"
      style={{ background: 'var(--c-border)', color: 'var(--c-text)' }}
    >
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="border-l-4 pl-4 my-3 italic"
      style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
    >
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4" style={{ borderColor: 'var(--c-border)' }} />,
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function stripMarkdown(text: string): string {
  return text.replace(/[#*_`>\n]/g, ' ').replace(/\s+/g, ' ').trim()
}

interface Props {
  uid: string
  turmaId: string
  accentColor: string
}

export function AnotacoesPanel({ uid, turmaId, accentColor }: Props) {
  const [notas, setNotas] = useState<Nota[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Nota | null>(null)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const selectedRef = useRef<Nota | null>(null)

  selectedRef.current = selected

  useEffect(() => {
    loadNotas()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [uid])

  async function loadNotas() {
    setLoading(true)
    const q = query(collection(db, 'users', uid, 'notas'), orderBy('updatedAt', 'desc'))
    const snap = await getDocs(q)
    setNotas(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Nota)))
    setLoading(false)
  }

  function openNota(nota: Nota) {
    if (timerRef.current) clearTimeout(timerRef.current)
    setSelected(nota)
    setTitle(nota.title)
    setContent(nota.content)
    setEditing(false)
    setSaveStatus('idle')
  }

  function goBack() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setSelected(null)
    setEditing(false)
    setSaveStatus('idle')
  }

  async function createNota() {
    const now = new Date().toISOString()
    const payload = { title: 'Nova nota', content: '', turmaId, createdAt: now, updatedAt: now }
    const ref = await addDoc(collection(db, 'users', uid, 'notas'), payload)
    const nota: Nota = { id: ref.id, ...payload }
    setNotas((prev) => [nota, ...prev])
    openNota(nota)
    setEditing(true)
  }

  async function deleteNota() {
    const nota = selectedRef.current
    if (!nota) return
    if (!confirm('Excluir esta nota?')) return
    await deleteDoc(doc(db, 'users', uid, 'notas', nota.id))
    setNotas((prev) => prev.filter((n) => n.id !== nota.id))
    goBack()
  }

  function scheduleAutoSave(newTitle: string, newContent: string) {
    setSaveStatus('saving')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      const nota = selectedRef.current
      if (!nota) return
      const updatedAt = new Date().toISOString()
      await updateDoc(doc(db, 'users', uid, 'notas', nota.id), {
        title: newTitle,
        content: newContent,
        updatedAt,
      })
      const updated: Nota = { ...nota, title: newTitle, content: newContent, updatedAt }
      setSelected(updated)
      setNotas((prev) =>
        [updated, ...prev.filter((n) => n.id !== nota.id)]
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      )
      setSaveStatus('saved')
    }, 1500)
  }

  function handleTitleChange(val: string) {
    setTitle(val)
    scheduleAutoSave(val, content)
  }

  function handleContentChange(val: string) {
    setContent(val)
    scheduleAutoSave(title, val)
  }

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>Carregando notas...</p>
      </div>
    )
  }

  // ── Detail view ──────────────────────────────────────────────────────────────

  if (selected) {
    return (
      <div className="flex flex-col">
        {/* Header */}
        <div
          className="flex items-center gap-2 px-4 py-3 border-b sticky top-0 z-10"
          style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
        >
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-opacity hover:opacity-75"
            style={{ color: 'var(--c-subtle)' }}
          >
            <HiArrowLeft className="w-3.5 h-3.5" /> Voltar
          </button>

          <div className="flex-1" />

          {saveStatus === 'saving' && (
            <span className="text-xs" style={{ color: 'var(--c-faint)' }}>Salvando...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--c-subtle)' }}>
              <HiCheckCircle className="w-3.5 h-3.5" /> Salvo
            </span>
          )}

          <button
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-75"
            style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)', background: 'var(--c-bg-alt)' }}
          >
            {editing
              ? <><HiEye className="w-3.5 h-3.5" /> Visualizar</>
              : <><HiPencil className="w-3.5 h-3.5" /> Editar</>
            }
          </button>

          <button
            onClick={deleteNota}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-opacity hover:opacity-75"
            style={{ color: 'var(--c-faint)' }}
            title="Excluir nota"
          >
            <HiTrash className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Title */}
        <div className="px-5 pt-5">
          {editing ? (
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Título da nota"
              className="w-full text-2xl font-bold outline-none bg-transparent border-b pb-3"
              style={{ color: 'var(--c-text)', borderColor: 'var(--c-border)' }}
            />
          ) : (
            <h3
              className="text-2xl font-bold pb-3 border-b"
              style={{ color: 'var(--c-text)', borderColor: 'var(--c-border)' }}
            >
              {title || 'Sem título'}
            </h3>
          )}
        </div>

        {/* Content */}
        <div className="px-5 pt-4 pb-8">
          {editing ? (
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={'Escreva em Markdown...\n\n# Título\n- item\n**negrito**, *itálico*'}
              className="w-full text-base leading-relaxed resize-none outline-none font-mono bg-transparent"
              style={{ color: 'var(--c-text)', minHeight: '300px' }}
              autoFocus
            />
          ) : content.trim() ? (
            <ReactMarkdown components={mdComponents}>{content}</ReactMarkdown>
          ) : (
            <p className="text-base" style={{ color: 'var(--c-faint)' }}>
              Nota vazia.{' '}
              <button
                onClick={() => setEditing(true)}
                className="underline transition-opacity hover:opacity-75"
                style={{ color: 'var(--c-text)' }}
              >
                Clique aqui para escrever.
              </button>
            </p>
          )}
        </div>
      </div>
    )
  }

  // ── List view ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--c-border)' }}
      >
        <span className="text-sm font-medium" style={{ color: 'var(--c-subtle)' }}>
          {notas.length} nota{notas.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={createNota}
          className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-75"
          style={{ borderColor: accentColor, color: accentColor }}
        >
          <HiPlus className="w-4 h-4" /> Nova nota
        </button>
      </div>

      {/* List */}
      {notas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center px-6">
          <HiDocumentText className="w-10 h-10" style={{ color: 'var(--c-faint)' }} />
          <p className="font-semibold" style={{ color: 'var(--c-text)' }}>Nenhuma nota ainda</p>
          <p className="text-sm" style={{ color: 'var(--c-subtle)' }}>
            Crie sua primeira nota para começar.
          </p>
          <button
            onClick={createNota}
            className="mt-2 text-sm px-4 py-2 rounded-xl font-semibold transition-opacity hover:opacity-75"
            style={{ background: `${accentColor}18`, color: accentColor }}
          >
            Criar primeira nota
          </button>
        </div>
      ) : (
        <div>
          {notas.map((nota) => (
            <button
              key={nota.id}
              onClick={() => openNota(nota)}
              className="w-full flex flex-col gap-1.5 px-5 py-4 text-left transition-opacity hover:opacity-75 border-b"
              style={{ borderColor: 'var(--c-border)' }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-semibold truncate" style={{ color: 'var(--c-text)' }}>
                  {nota.title || 'Sem título'}
                </span>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--c-faint)' }}>
                  {formatDate(nota.updatedAt)}
                </span>
              </div>
              {nota.content && (
                <span className="text-sm truncate" style={{ color: 'var(--c-subtle)' }}>
                  {stripMarkdown(nota.content).slice(0, 80)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
