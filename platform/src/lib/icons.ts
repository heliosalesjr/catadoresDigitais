import {
  HiComputerDesktop, HiCodeBracket, HiCommandLine, HiCpuChip,
  HiCircleStack, HiGlobeAlt, HiDevicePhoneMobile, HiMegaphone,
  HiSparkles, HiPuzzlePiece, HiCamera, HiMusicalNote,
  HiCube, HiAcademicCap, HiRocketLaunch, HiWrenchScrewdriver,
  HiPaintBrush, HiFilm, HiChartBarSquare, HiBolt,
} from 'react-icons/hi2'
import type { IconType } from 'react-icons'

export const TECH_ICONS: Record<string, { label: string; icon: IconType }> = {
  HiComputerDesktop:    { label: 'Computador',     icon: HiComputerDesktop },
  HiCodeBracket:        { label: 'Código',          icon: HiCodeBracket },
  HiCommandLine:        { label: 'Terminal',        icon: HiCommandLine },
  HiCpuChip:            { label: 'Processador',     icon: HiCpuChip },
  HiCircleStack:        { label: 'Banco de dados',  icon: HiCircleStack },
  HiGlobeAlt:           { label: 'Web',             icon: HiGlobeAlt },
  HiDevicePhoneMobile:  { label: 'Mobile',          icon: HiDevicePhoneMobile },
  HiMegaphone:          { label: 'Marketing',       icon: HiMegaphone },
  HiSparkles:           { label: 'IA / Criativo',   icon: HiSparkles },
  HiPuzzlePiece:        { label: 'Lógica',          icon: HiPuzzlePiece },
  HiCamera:             { label: 'Foto / Mídia',    icon: HiCamera },
  HiMusicalNote:        { label: 'Áudio',           icon: HiMusicalNote },
  HiCube:               { label: '3D / Games',      icon: HiCube },
  HiAcademicCap:        { label: 'Educação',        icon: HiAcademicCap },
  HiRocketLaunch:       { label: 'Lançamento',      icon: HiRocketLaunch },
  HiWrenchScrewdriver:  { label: 'Ferramentas',     icon: HiWrenchScrewdriver },
  HiPaintBrush:         { label: 'Design',          icon: HiPaintBrush },
  HiFilm:               { label: 'Vídeo',           icon: HiFilm },
  HiChartBarSquare:     { label: 'Analytics',       icon: HiChartBarSquare },
  HiBolt:               { label: 'Performance',     icon: HiBolt },
}

export const ICON_COLORS = [
  '#FFC530', '#FF6B35', '#A855F7', '#06B6D4',
  '#10B981', '#F43F5E', '#3B82F6', '#F97316',
  '#EC4899', '#14B8A6', '#8B5CF6', '#EF4444',
]
