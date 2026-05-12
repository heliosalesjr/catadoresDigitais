import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { HiOutlineHeart } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';

export function Sponsors() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { isDark } = useTheme();

  return (
    <section id="realizacao" className="relative py-24 md:py-28 overflow-hidden">
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, #06030F, #0F0A1E, #06030F)'
            : 'linear-gradient(to bottom, #FFFBF0, #FFF5E3, #FFFBF0)',
        }}
      />
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div ref={ref} className="relative z-10 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--c-border)] bg-[var(--c-input-bg)] mb-6">
            <HiOutlineHeart className="w-4 h-4 text-[var(--c-accent-coral)]" />
            <span className="font-dm text-sm font-medium text-[var(--c-muted)] tracking-wide">
              Quem torna isso possível
            </span>
          </div>
          <h2 className="font-syne font-extrabold text-4xl md:text-5xl text-[var(--c-text)] mb-4">
            Realização e Patrocínio
          </h2>
          <p className="font-dm text-[var(--c-muted)] max-w-xl mx-auto">
            O projeto Catadores Digitais existe graças ao compromisso de organizações
            que acreditam no potencial transformador da educação tecnológica.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-12"
        >
          <p className="font-dm text-xs font-semibold tracking-widest uppercase text-[var(--c-subtle)] text-center mb-6">
            Realização
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <img src="/ipes-logo.webp" alt="Instituto Ipês" className="h-24 w-auto object-contain" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <p className="font-dm text-xs font-semibold tracking-widest uppercase text-[var(--c-subtle)] text-center mb-6">
            Patrocínio
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <img src="/CAIXA_2cores_positiva.png" alt="Caixa Econômica Federal" className="h-24 w-auto object-contain" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="rounded-2xl p-7 md:p-10 glass-card border-brand-yellow/10"
        >
          <div className="flex flex-col md:flex-row items-start gap-6">
            <img src="/ipes-logo.webp" alt="Instituto Ipês" className="w-16 h-16 object-contain flex-shrink-0" />
            <div>
              <h3 className="font-syne font-bold text-xl text-[var(--c-text)] mb-2">
                Instituto Ipês
              </h3>
              <p className="font-dm text-sm text-[var(--c-muted)] leading-relaxed">
                O Instituto Ipês é uma organização da sociedade civil que atua no
                desenvolvimento de projetos sociais e educacionais com foco em populações
                em situação de vulnerabilidade. Com o Catadores Digitais, o Instituto
                aposta na tecnologia como caminho concreto para ampliar horizontes e gerar
                renda para quem mais precisa dessas oportunidades.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
