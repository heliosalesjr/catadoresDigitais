import Image from 'next/image'

export function Footer() {
  return (
    <footer
      className="mt-auto border-t px-6 py-8"
      style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-alt)' }}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-5">
        <p className="text-xs uppercase tracking-widest font-medium" style={{ color: 'var(--c-faint)' }}>
          Realização
        </p>

        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div
            className="rounded-xl px-4 py-2.5 flex items-center"
            style={{ background: '#fff' }}
          >
            <Image
              src="/ipes-logo.webp"
              alt="Instituto Ipês"
              width={120}
              height={40}
              className="object-contain"
              style={{ height: 36, width: 'auto' }}
            />
          </div>

          <div
            className="rounded-xl px-4 py-2.5 flex items-center"
            style={{ background: '#fff' }}
          >
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

        <p className="text-[11px] text-center" style={{ color: 'var(--c-faint)' }}>
          Catadores Digitais · Programa de formação em tecnologia
        </p>
      </div>
    </footer>
  )
}
