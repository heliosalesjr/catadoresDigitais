'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  isDark: boolean
  toggle: () => void
}

const DARK = {
  '--c-bg': '#06030F',
  '--c-bg-alt': '#0F0A1E',
  '--c-text': '#F8F4FF',
  '--c-muted': '#C5B7D8',
  '--c-subtle': '#9B8CB8',
  '--c-faint': '#614E7B',
  '--c-border': 'rgba(255,255,255,0.10)',
  '--c-border-md': 'rgba(255,255,255,0.18)',
  '--c-accent-yellow': '#FFC530',
  '--c-accent-coral': '#FF8055',
  '--logo-c1': '#FFC530',
  '--logo-c2': '#FF6B35',
  '--logo-c3': '#A855F7',

  '--c-success': '#22c55e',
  '--c-success-soft': 'rgba(34,197,94,0.10)',
  '--c-success-strong': 'rgba(34,197,94,0.45)',
  '--c-warning': '#f59e0b',
  '--c-warning-soft': 'rgba(245,158,11,0.10)',
  '--c-warning-strong': 'rgba(245,158,11,0.45)',
  '--c-danger': '#ef4444',
  '--c-danger-soft': 'rgba(239,68,68,0.10)',
  '--c-danger-strong': 'rgba(239,68,68,0.45)',
  '--c-info': '#06B6D4',
  '--c-info-soft': 'rgba(6,182,212,0.10)',
  '--c-info-strong': 'rgba(6,182,212,0.45)',
  '--c-purple': '#A855F7',
  '--c-purple-soft': 'rgba(168,85,247,0.10)',
  '--c-purple-strong': 'rgba(168,85,247,0.45)',
  '--c-gold': '#FFC530',
  '--c-gold-soft': 'rgba(255,197,48,0.10)',
  '--c-gold-strong': 'rgba(255,197,48,0.45)',
}

const LIGHT = {
  '--c-bg': '#FFFFFF',
  '--c-bg-alt': '#F7F6FB',
  '--c-text': '#1A0A3C',
  '--c-muted': '#5B4B7A',
  '--c-subtle': '#6D5E88',
  '--c-faint': '#6E5E8C',
  '--c-border': 'rgba(26,10,60,0.10)',
  '--c-border-md': 'rgba(26,10,60,0.18)',
  '--c-accent-yellow': '#8A6200',
  '--c-accent-coral': '#B83E18',
  '--logo-c1': '#6D28D9',
  '--logo-c2': '#4F46E5',
  '--logo-c3': '#1D4ED8',

  '--c-success': '#15803d',
  '--c-success-soft': 'rgba(34,197,94,0.12)',
  '--c-success-strong': 'rgba(34,197,94,0.30)',
  '--c-warning': '#b45309',
  '--c-warning-soft': 'rgba(245,158,11,0.14)',
  '--c-warning-strong': 'rgba(245,158,11,0.32)',
  '--c-danger': '#b91c1c',
  '--c-danger-soft': 'rgba(239,68,68,0.10)',
  '--c-danger-strong': 'rgba(239,68,68,0.28)',
  '--c-info': '#0e7490',
  '--c-info-soft': 'rgba(6,182,212,0.12)',
  '--c-info-strong': 'rgba(6,182,212,0.30)',
  '--c-purple': '#7e22ce',
  '--c-purple-soft': 'rgba(168,85,247,0.12)',
  '--c-purple-strong': 'rgba(168,85,247,0.30)',
  '--c-gold': '#92660a',
  '--c-gold-soft': 'rgba(255,197,48,0.20)',
  '--c-gold-strong': 'rgba(255,197,48,0.40)',
}

function applyTheme(dark: boolean) {
  const vars = dark ? DARK : LIGHT
  const root = document.documentElement
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
}

const ThemeContext = createContext<ThemeContextType>({ isDark: true, toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('cd-theme')
    const dark = stored ? stored === 'dark' : true
    setIsDark(dark)
    applyTheme(dark)
  }, [])

  function toggle() {
    setIsDark((prev) => {
      const next = !prev
      applyTheme(next)
      localStorage.setItem('cd-theme', next ? 'dark' : 'light')
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
