import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiXMark, HiUser } from 'react-icons/hi2'
import type { UserProfile } from '@/types'
import { inputStyle } from '@/lib/styles'
import { isValidCPF, formatCPF, formatPhone } from '@/lib/utils'
import { updateMe } from '@/services/users'

const ease = [0.32, 0.72, 0, 1] as const

interface Props {
  user: UserProfile
  onClose: () => void
  onSaved: (patch: Partial<UserProfile>) => void
}

export function ProfileModal({ user, onClose, onSaved }: Props) {
  const [phone, setPhone] = useState(formatPhone(user.phone ?? ''))
  const [cpf, setCpf] = useState(formatCPF(user.cpf ?? ''))
  const [birthDate, setBirthDate] = useState(user.birthDate ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cpfDigits = cpf.replace(/\D/g, '')
  const phoneDigits = phone.replace(/\D/g, '')

  async function handleSave() {
    setError(null)
    if (cpfDigits && !isValidCPF(cpfDigits)) return setError('CPF inválido.')
    if (phoneDigits && (phoneDigits.length < 10 || phoneDigits.length > 11)) return setError('Telefone inválido.')

    setSaving(true)
    try {
      await updateMe({ phone: phoneDigits, cpf: cpfDigits, birthDate })
    } catch (e) {
      setSaving(false)
      return setError(e instanceof Error ? e.message : 'Erro ao salvar.')
    }
    setSaving(false)

    onSaved({ phone: phoneDigits, cpf: cpfDigits, birthDate })
    onClose()
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
        className="w-full max-w-sm rounded-2xl shadow-2xl flex flex-col"
        style={{ background: 'var(--c-bg-alt)', border: '1px solid var(--c-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b" style={{ borderColor: 'var(--c-border)' }}>
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-1">
              <HiUser className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--c-gold)' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--c-gold)' }}>
                Meu perfil
              </span>
            </div>
            <h2 className="text-base font-bold leading-snug" style={{ color: 'var(--c-text)' }}>
              Editar informações
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center border cursor-pointer"
            style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-subtle)' }}
          >
            <HiXMark className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--c-subtle)' }}>Nome</label>
            <p className="rounded-xl px-3 py-2 text-sm border" style={{ ...inputStyle, opacity: 0.7 }}>
              {user.name}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--c-subtle)' }}>Telefone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value.replace(/\D/g, '')))}
              placeholder="(00) 00000-0000"
              className="rounded-xl px-3 py-2 text-sm border outline-none"
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--c-subtle)' }}>CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value.replace(/\D/g, '')))}
              placeholder="000.000.000-00"
              className="rounded-xl px-3 py-2 text-sm border outline-none"
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--c-subtle)' }}>Data de nascimento</label>
            <input
              type="date"
              value={birthDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setBirthDate(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm border outline-none"
              style={inputStyle}
            />
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--c-danger)' }}>{error}</p>}

          <div className="flex gap-2 mt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm border cursor-pointer"
              style={{ borderColor: 'var(--c-border-md)', color: 'var(--c-muted)' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity disabled:opacity-50 cursor-pointer"
              style={{ background: 'var(--c-gold)', color: 'var(--c-bg)' }}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
