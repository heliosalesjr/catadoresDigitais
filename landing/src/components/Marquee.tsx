const tags = [
  'Produção de Games',
  'Desenvolvimento Web',
  'Marketing Digital',
  'Inteligência Artificial',
  'Letramento Digital',
  'Portfólio Real',
  
  'Cidade Estrutural',
  'Tecnologia para Todos',
  'Transformação de Trajetórias',
];

export function Marquee() {
  const doubled = [...tags, ...tags];

  return (
    <div className="relative overflow-hidden py-4 border-y border-[var(--c-border)] bg-[var(--c-bg-alt)]">
      <div className="flex animate-marquee gap-10 whitespace-nowrap w-max">
        {doubled.map((tag, i) => (
          <div key={i} className="flex items-center gap-10 flex-shrink-0">
            <span className="font-syne font-bold text-sm tracking-wide text-[var(--c-faint)] uppercase">
              {tag}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow/50 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
