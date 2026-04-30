import { useTheme } from '../context/ThemeContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function Logo({ size = 'md', showTagline = false }: LogoProps) {
  const { isDark } = useTheme();

  const sizes = {
    sm: { container: 'gap-2', icon: 36, wordMark: 'text-lg', tag: 'text-[9px]' },
    md: { container: 'gap-3', icon: 44, wordMark: 'text-2xl', tag: 'text-[10px]' },
    lg: { container: 'gap-4', icon: 64, wordMark: 'text-4xl', tag: 'text-xs' },
  };
  const s = sizes[size];

  const hexFill = isDark ? '#1A1230' : '#F0E8FF';

  return (
    <div className={`flex items-center ${s.container}`}>
      {/* Icon mark */}
      <div className="relative flex-shrink-0" style={{ width: s.icon, height: s.icon }}>
        <svg width={s.icon} height={s.icon} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon
            points="22,2 40,12 40,32 22,42 4,32 4,12"
            fill={hexFill}
            stroke="#FFC530"
            strokeWidth="2"
          />
          <path d="M14 22 Q22 14 30 22" stroke="#FFC530" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M17 25.5 Q22 20 27 25.5" stroke={isDark ? '#FF6B35' : '#B83E18'} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="22" cy="29" r="2.4" fill="#FFC530" />
          <circle cx="34" cy="10" r="1.5" fill="#A855F7" />
          <circle cx="10" cy="10" r="1" fill="#06B6D4" />
        </svg>
      </div>

      {/* Word mark */}
      <div className="flex flex-col leading-none">
        <span className={`logo-gradient font-syne font-extrabold tracking-tight leading-none ${s.wordMark}`}>
          Catadores
        </span>
        {/* "Digitais" uses --c-text so it's always readable on any background */}
        <span
          className={`font-syne font-extrabold tracking-tight leading-none ${s.wordMark}`}
          style={{ color: 'var(--c-text)' }}
        >
          Digitais
        </span>
        {showTagline && (
          <span className={`font-dm font-medium text-[var(--c-subtle)] mt-1 tracking-widest uppercase ${s.tag}`}>
            Tecnologia que transforma
          </span>
        )}
      </div>
    </div>
  );
}
