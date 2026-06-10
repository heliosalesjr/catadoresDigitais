import Image from 'next/image'

export function Footer() {
  return (
    <footer
      className="mt-auto border-t px-6 py-8"
      style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
        <div className="flex items-end justify-center gap-10 flex-wrap">
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--c-faint)' }}>
              Realização
            </p>
            <Image
              src="/ipes-logo.webp"
              alt="Instituto Ipês"
              width={120}
              height={40}
              className="object-contain"
              style={{ height: 36, width: 'auto' }}
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--c-faint)' }}>
              Patrocínio
            </p>
            <Image
              src="/CAIXA_2cores_positiva.png"
              alt="Caixa Econômica Federal"
              width={120}
              height={40}
              className="object-contain"
              style={{ height: 36, width: 'auto' }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-[11px] text-center" style={{ color: 'var(--c-faint)' }}>
            Catadores Digitais · Programa de formação em tecnologia
          </p>
          <p className="text-xs font-bold text-center" style={{ color: 'var(--c-subtle)' }}>
            © {new Date().getFullYear()} Instituto Ipês. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
