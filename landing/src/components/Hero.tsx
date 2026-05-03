import { motion } from 'framer-motion';
import { HiArrowDown } from 'react-icons/hi';
import { HiSparkles } from 'react-icons/hi2';
import { useTheme } from '../context/ThemeContext';

const floatingBadges = [
  { label: 'Produção de Games', color: '#A855F7', delay: 0, x: '-60%', y: '20%' },
  { label: 'Dev Web', color: '#06B6D4', delay: 0.4, x: '55%', y: '10%' },
  { label: 'Marketing Digital', color: '#FF6B35', delay: 0.8, x: '62%', y: '60%' },
  { label: 'IA & Criatividade', color: '#FFC530', delay: 1.2, x: '-55%', y: '65%' },
];

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 1,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 4,
  duration: Math.random() * 3 + 4,
}));

export function Hero() {
  const { isDark } = useTheme();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background base */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #06030F 0%, #0F0A1E 40%, #1A0A3C 100%)'
            : '#FFFFFF',
        }}
      />


      {/* Dark mode glow blobs */}
      {isDark && (
        <>
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
            style={{ background: 'rgba(255,197,48,0.05)' }}
          />
          <div
            className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
            style={{ background: 'rgba(124,58,237,0.10)' }}
          />
          <div
            className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full blur-[80px] pointer-events-none"
            style={{ background: 'rgba(255,107,53,0.08)' }}
          />
        </>
      )}

      {/* Animated particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: isDark ? 'rgba(255,197,48,0.25)' : 'rgba(124,58,237,0.18)',
          }}
          animate={{ y: [0, -30, 0], opacity: [0.12, 0.40, 0.12] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Grid lines overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isDark ? 0.05 : 0.035,
          backgroundImage: `linear-gradient(rgba(255,197,48,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,197,48,0.6) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 mb-8"
        >
          <HiSparkles className="w-4 h-4 text-[var(--c-accent-yellow)]" />
          <span className="font-dm text-sm font-medium text-[var(--c-accent-yellow)] tracking-wide">
            Tecnologia que transforma trajetórias
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="font-syne font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none tracking-tight mb-6"
        >
          <span className="text-[var(--c-text)]">Seu futuro</span>
          <br />
          <span className="text-gradient-yellow">começa aqui.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="font-dm text-lg sm:text-xl md:text-2xl text-[var(--c-muted)] max-w-2xl mx-auto mb-4 leading-relaxed"
        >
          Formações gratuitas em{' '}
          <span style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="font-semibold">Games</span>,{' '}
          <span style={{ color: isDark ? '#FFC530' : '#C07800' }} className="font-semibold">Desenvolvimento Web</span> e{' '}
          <span style={{ color: isDark ? '#FF8055' : '#FF4F12' }} className="font-semibold">Marketing Digital</span> para
          catadores, suas famílias e moradores da Estrutural — DF.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="font-dm text-base text-[var(--c-subtle)] max-w-xl mx-auto mb-10"
        >
          Você aprende fazendo. Você sai com um projeto real no portfólio.
          A tecnologia é a ferramenta — a transformação é sua.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="#inscricoes"
            className="group relative font-syne font-bold text-dark-950 px-8 py-4 rounded-2xl overflow-hidden text-base sm:text-lg w-full sm:w-auto text-center"
            style={{ background: 'linear-gradient(135deg, #FFC530 0%, #FF6B35 100%)' }}
          >
            <span className="relative z-10">Quero me inscrever</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </a>
          <a
            href="#cursos"
            className="font-dm font-medium text-[var(--c-muted)] border border-[var(--c-border-md)] hover:border-brand-yellow/40 hover:text-brand-yellow px-8 py-4 rounded-2xl text-base transition-colors duration-200 w-full sm:w-auto text-center"
          >
            Conhecer os cursos
          </a>
        </motion.div>

        {/* Floating course badges */}
        {floatingBadges.map((badge, i) => (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{
              opacity: { duration: 0.5, delay: 1 + badge.delay },
              scale: { duration: 0.5, delay: 1 + badge.delay },
              y: { duration: 4 + i, delay: 1.5 + badge.delay, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl glass-card pointer-events-none"
            style={{ left: `calc(50% + ${badge.x})`, top: `calc(50% + ${badge.y})` }}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: badge.color }} />
            <span className="font-dm text-xs font-medium text-[var(--c-muted)] whitespace-nowrap">
              {badge.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.button
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-8 h-8 rounded-full border border-[var(--c-border-md)] flex items-center justify-center cursor-pointer hover:border-brand-yellow/50 hover:text-brand-yellow transition-colors duration-200"
          onClick={() => document.getElementById('cursos')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Ver as formações"
        >
          <HiArrowDown className="w-4 h-4 text-[var(--c-subtle)]" />
        </motion.button>
      </motion.div>
    </section>
  );
}
