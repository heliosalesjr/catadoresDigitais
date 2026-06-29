import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { HiOutlineMapPin, HiOutlineUserGroup, HiOutlineCalendar, HiCheckCircle } from 'react-icons/hi2';
import { HiSparkles } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';

const priorities = [
  {
    icon: HiOutlineUserGroup,
    title: 'Catadoras e catadores',
    desc: 'Profissionais de coleta de materiais recicláveis têm prioridade garantida nas vagas.',
    color: '#FFC530',
    textColor: 'var(--c-accent-yellow)',
  },
  {
    icon: HiOutlineUserGroup,
    title: 'Famílias',
    desc: 'Familiares de catadores também fazem parte do público prioritário das formações.',
    color: '#A855F7',
    textColor: 'var(--c-accent-purple)',
  },
  {
    icon: HiOutlineMapPin,
    title: 'Moradores da Estrutural',
    desc: 'Quem vive na Cidade Estrutural e no entorno tem vaga prioritária em todas as turmas.',
    color: '#FF6B35',
    textColor: 'var(--c-accent-coral)',
  },
];

export function ComingSoon() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { isDark } = useTheme();
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setSubmitted(true);
  }

  return (
    <section id="inscricoes" className="relative py-24 md:py-32 overflow-hidden">
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, #06030F, #110730, #06030F)'
            : 'linear-gradient(to bottom, #FFF5E3, #FFF0F5, #FFF5E3)',
        }}
      />
      <div className="absolute top-0 left-0 right-0 section-divider" />

      {/* Decorative rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-brand-yellow/5 pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-brand-yellow/5 pointer-events-none" />

      <div ref={ref} className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Coming soon badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-yellow text-dark-950">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
              <HiSparkles className="w-4 h-4" />
            </motion.div>
            <span className="font-syne font-bold text-sm tracking-wide uppercase">Em breve</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-syne font-extrabold text-4xl md:text-5xl lg:text-6xl text-[var(--c-text)] text-center mb-6 leading-tight"
        >
          As inscrições estão{' '}
          <span className="text-gradient-yellow">chegando.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-dm text-lg md:text-xl text-[var(--c-muted)] text-center max-w-2xl mx-auto mb-14 leading-relaxed"
        >
          Estamos preparando as turmas. Em breve você poderá se inscrever nas
          formações gratuitas de tecnologia — e algumas vagas são prioritárias para
          quem mais precisa dessas oportunidades.
        </motion.p>

        {/* Priority cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14"
        >
          {priorities.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.35 + i * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center"
                style={{ borderColor: `${p.color}20` }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${p.color}12` }}
                >
                  <Icon className="w-6 h-6" style={{ color: p.color }} />
                </div>
                <h3 className="font-syne font-bold text-lg mb-2" style={{ color: p.textColor }}>
                  {p.title}
                </h3>
                <p className="font-dm text-sm text-[var(--c-muted)] leading-relaxed">{p.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Notification CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="relative rounded-3xl p-8 md:p-12 overflow-hidden text-center glass-card"
          style={{ borderColor: 'rgba(255,197,48,0.2)' }}
        >
          <HiOutlineCalendar className="w-10 h-10 text-[var(--c-accent-yellow)] mx-auto mb-5" />
          <h3 className="font-syne font-extrabold text-2xl md:text-3xl text-[var(--c-text)] mb-3">
            Seja o primeiro a saber
          </h3>
          <p className="font-dm text-[var(--c-muted)] max-w-md mx-auto mb-7 leading-relaxed">
            Deixe seu contato e avisamos assim que as inscrições abrirem. Vagas limitadas
            — quem chega primeiro garante sua vaga.
          </p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-3"
              >
                <HiCheckCircle className="w-10 h-10 text-[var(--c-accent-yellow)]" />
                <p className="font-syne font-bold text-xl text-[var(--c-text)]">
                  Recebemos!
                </p>
                <p className="font-dm text-sm text-[var(--c-muted)] max-w-xs text-center">
                  Assim que as inscrições abrirem, você será um dos primeiros a saber.
                </p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                >
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Seu WhatsApp com DDD"
                    className="flex-1 bg-[var(--c-input-bg)] border border-[var(--c-border)] text-[var(--c-text)] placeholder-[var(--c-subtle)] font-dm text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-brand-yellow/50 transition-colors"
                  />
                  <button
                    type="submit"
                    className="font-syne font-bold text-dark-950 px-6 py-3 rounded-xl whitespace-nowrap transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #FFC530, #FF6B35)' }}
                    disabled={!phone.trim()}
                  >
                    Avisar quando abrir
                  </button>
                </form>
                <p className="font-dm text-xs text-[var(--c-subtle)] mt-4">
                  Seus dados não serão compartilhados. Apenas um aviso quando as inscrições abrirem.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
