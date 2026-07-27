import type { CSSProperties, ReactNode } from 'react'

interface TooltipProps {
  label: string
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  /** Extra classes on the wrapper span — e.g. to control sizing inside a flex row. */
  className?: string
  style?: CSSProperties
}

const SIDE_CLASS: Record<NonNullable<TooltipProps['side']>, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

export function Tooltip({ label, children, side = 'top', className = '', style }: TooltipProps) {
  return (
    <span className={`relative inline-flex group/tooltip ${className}`} style={style}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-lg px-2 py-1 text-[11px] font-medium opacity-0 scale-95 transition-all duration-150 delay-150 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:scale-100 ${SIDE_CLASS[side]}`}
        style={{ background: 'var(--c-text)', color: 'var(--c-bg)' }}
      >
        {label}
      </span>
    </span>
  )
}
