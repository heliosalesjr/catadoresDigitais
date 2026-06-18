interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function Logo({ size = 'md', showTagline = false }: LogoProps) {
  const sizes = {
    sm: { wordMark: 'text-2xl', tag: 'text-[9px]' },
    md: { wordMark: 'text-3xl', tag: 'text-[10px]' },
    lg: { wordMark: 'text-5xl', tag: 'text-xs' },
  };
  const s = sizes[size];

  return (
    <div className="flex flex-col leading-none">
      <div className={`font-syne font-extrabold tracking-normal leading-none ${s.wordMark}`}>
        <span className="logo-gradient">Catadores</span>
        {' '}
        <span style={{ color: 'var(--c-text)' }}>Digitais</span>
      </div>
      {showTagline && (
        <span className={`font-dm font-medium text-[var(--c-subtle)] mt-1 tracking-widest uppercase ${s.tag}`}>
          Tecnologia que transforma
        </span>
      )}
    </div>
  );
}
