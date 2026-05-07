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
}

const LIGHT = {
  '--c-bg': '#FFFBF0',
  '--c-bg-alt': '#FFF5E3',
  '--c-text': '#1A0A3C',
  '--c-muted': '#5B4B7A',
  '--c-subtle': '#6D5E88',
  '--c-faint': '#8E7BA8',
  '--c-border': 'rgba(26,10,60,0.10)',
  '--c-border-md': 'rgba(26,10,60,0.18)',
  '--c-accent-yellow': '#8A6200',
  '--c-accent-coral': '#B83E18',
  '--logo-c1': '#FF6B35',
  '--logo-c2': '#7C3AED',
  '--logo-c3': '#7C3AED',
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
