import { motion, useInView, type Variants } from 'framer-motion';
import { useRef } from 'react';
import { HiOutlineHeart } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

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
            ? 'linear-gradient(to bottom, #1f1b33, #26223f, #1f1b33)'
            : 'linear-gradient(to bottom, #FFF8EE 0%, #FFF4E0 30%, #ffffff 58%, #ffffff 100%)',
        }}
      />
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div ref={ref} className="relative z-10 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--c-border)] bg-[var(--c-input-bg)]">
            <HiOutlineHeart className="w-4 h-4 text-[var(--c-accent-coral)]" />
            <span className="font-dm text-sm font-medium text-[var(--c-muted)] tracking-wide">
              Quem torna isso possível
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6"
        >
          {/* Box 1 — Realização / Instituto Ipês, tall left column */}
          <motion.div
            variants={cardVariants}
            className="md:row-span-2 rounded-3xl p-8 md:p-9 flex flex-col justify-center items-center text-center bg-gradient-to-br from-[#A855F7]/10 to-transparent glass-card"
            style={{ borderColor: 'rgba(168,85,247,0.2)' }}
          >
            <p className="font-dm text-xs font-semibold tracking-widest uppercase text-[var(--c-subtle)] mb-6">
              Realização
            </p>
            <a href="https://institutoipes.org.br/" target="_blank" rel="noopener noreferrer">
              <img
                src="/ipes-logo.webp"
                alt="Instituto Ipês"
                className="h-28 w-auto object-contain"
                style={{ filter: isDark ? 'brightness(1.1) drop-shadow(0 0 12px rgba(255,255,255,0.08))' : 'none' }}
              />
            </a>
          </motion.div>

          {/* Box 2 — intro text */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 rounded-3xl p-8 glass-card flex flex-col justify-center"
          >
            <h2 className="font-syne font-extrabold text-3xl md:text-4xl text-[var(--c-text)] mb-3 leading-tight">
              Realização e Patrocínio
            </h2>
            <p className="font-dm text-[var(--c-muted)] leading-relaxed max-w-lg">
              O projeto Catadores Digitais existe graças ao compromisso de organizações
              que acreditam no potencial transformador da educação tecnológica.
            </p>
          </motion.div>

          {/* Box 3 — Patrocínio / Caixa */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 rounded-3xl p-8 flex flex-wrap items-center gap-6"
            style={{ background: '#003087', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="font-dm text-xs font-semibold tracking-widest uppercase text-white/60 w-full mb-1 md:hidden">
              Patrocínio
            </p>
            <a
              href="https://www.caixa.gov.br/sustentabilidade/fundo-socioambiental-caixa/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/Caixa_Fundo-Socio-Ambiental_Negativa_SB.png"
                alt="Caixa Econômica Federal"
                className="h-12 md:h-14 w-auto object-contain"
              />
            </a>
            <div className="hidden md:block h-12 w-px bg-white/15" />
            <p className="hidden md:block font-dm text-xs font-semibold tracking-widest uppercase text-white/60">
              Patrocínio
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}