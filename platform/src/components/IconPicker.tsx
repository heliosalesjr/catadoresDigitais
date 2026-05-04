'use client'

import { TECH_ICONS, ICON_COLORS } from '@/lib/icons'

interface Props {
  selectedIcon: string
  selectedColor: string
  onIconChange: (key: string) => void
  onColorChange: (color: string) => void
}

export function IconPicker({ selectedIcon, selectedColor, onIconChange, onColorChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Icon grid */}
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(TECH_ICONS).map(([key, { label, icon: Icon }]) => (
          <button
            key={key}
            type="button"
            title={label}
            onClick={() => onIconChange(key)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-150"
            style={{
              borderColor: selectedIcon === key ? selectedColor : 'var(--c-border)',
              background: selectedIcon === key ? `${selectedColor}18` : 'transparent',
            }}
          >
            <Icon
              className="w-6 h-6"
              style={{ color: selectedIcon === key ? selectedColor : 'var(--c-subtle)' }}
            />
            <span className="text-[10px] leading-tight text-center" style={{ color: 'var(--c-faint)' }}>
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Color palette */}
      <div>
        <p className="text-xs mb-2" style={{ color: 'var(--c-subtle)' }}>Cor do ícone</p>
        <div className="flex gap-2 flex-wrap">
          {ICON_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onColorChange(color)}
              className="w-7 h-7 rounded-full transition-transform duration-150"
              style={{
                background: color,
                transform: selectedColor === color ? 'scale(1.25)' : 'scale(1)',
                outline: selectedColor === color ? `2px solid ${color}` : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
          {/* Custom color */}
          <label className="w-7 h-7 rounded-full overflow-hidden cursor-pointer border" style={{ borderColor: 'var(--c-border-md)' }}>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-10 h-10 -translate-x-1 -translate-y-1 cursor-pointer opacity-0 absolute"
            />
            <div className="w-full h-full rounded-full" style={{ background: selectedColor }} />
          </label>
        </div>
      </div>
    </div>
  )
}
