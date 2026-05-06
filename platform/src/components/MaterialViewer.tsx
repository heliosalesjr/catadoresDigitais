'use client'

import { motion } from 'framer-motion'
import { HiXMark, HiArrowTopRightOnSquare } from 'react-icons/hi2'
import type { DriveLink } from '@/types'

const ease = [0.32, 0.72, 0, 1] as const

function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url)

    // YouTube: watch?v=ID or youtu.be/ID
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=1&rel=0`
    }
    if (u.hostname.includes('youtu.be')) {
      const v = u.pathname.slice(1).split('?')[0]
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=1&rel=0`
    }

    // Vimeo
    if (u.hostname.includes('vimeo.com')) {
      const v = u.pathname.split('/').filter(Boolean)[0]
      if (v) return `https://player.vimeo.com/video/${v}?autoplay=1`
    }

    // Google Docs suite
    if (u.hostname.includes('docs.google.com')) {
      const m = u.pathname.match(/\/(presentation|document|spreadsheets)\/d\/([^/]+)/)
      if (m) {
        const [, type, id] = m
        if (type === 'presentation')
          return `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false`
        if (type === 'document')
          return `https://docs.google.com/document/d/${id}/preview`
        if (type === 'spreadsheets')
          return `https://docs.google.com/spreadsheets/d/${id}/preview`
      }
    }

    // Google Drive file
    if (u.hostname.includes('drive.google.com')) {
      const m = u.pathname.match(/\/file\/d\/([^/]+)/)
      if (m) return `https://drive.google.com/file/d/${m[1]}/preview`
    }
  } catch {}
  return url
}

function isWidescreen(url: string): boolean {
  try {
    const u = new URL(url)
    if (
      u.hostname.includes('youtube.com') ||
      u.hostname.includes('youtu.be') ||
      u.hostname.includes('vimeo.com')
    ) return true
    if (u.hostname.includes('docs.google.com') && u.pathname.includes('/presentation/')) return true
    if (u.hostname.includes('drive.google.com')) return true
  } catch {}
  return false
}

interface Props {
  link: DriveLink
  accentColor: string
  onClose: () => void
}

export function MaterialViewer({ link, accentColor, onClose }: Props) {
  const embedUrl = toEmbedUrl(link.url)
  const wide = isWidescreen(link.url)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        transition={{ duration: 0.28, ease }}
        className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black"
        style={
          wide
            ? { maxWidth: '960px', aspectRatio: '16/9' }
            : { maxWidth: '800px', height: '82vh' }
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating toolbar */}
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between gap-3 px-4 py-3"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 100%)' }}
        >
          <p className="text-sm font-medium text-white truncate">
            {link.label || link.url}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-opacity hover:opacity-85"
              style={{ background: accentColor, color: '#fff' }}
            >
              <HiArrowTopRightOnSquare className="w-3.5 h-3.5" />
              Abrir em nova aba
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-opacity hover:opacity-85"
              style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}
            >
              <HiXMark className="w-4 h-4" />
            </button>
          </div>
        </div>

        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={link.label || 'Material'}
        />
      </motion.div>
    </motion.div>
  )
}
