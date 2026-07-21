import { useEffect, useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { HiOutlineArrowRight, HiOutlineEnvelope, HiOutlineHeart } from 'react-icons/hi2';
import {
  HiOutlineAcademicCap,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineClock,
  HiOutlineSparkles,
  HiOutlineUserGroup,
} from 'react-icons/hi2';
import { HiOutlineCommandLine, HiOutlineMegaphone } from 'react-icons/hi2';
import { BsController } from 'react-icons/bs';
import { useTheme } from '../context/ThemeContext';

const tracks = [
  {
    id: 1,
    icon: BsController,
    title: 'Produção de Games',
    color: '#A855F7',
    textColor: 'var(--c-accent-purple)',
    border: 'border-[#A855F7]/20',
    gradient: 'from-[#A855F7]/10 to-[#7C3AED]/5',
    need: 'Alguém com vivência em desenvolvimento de jogos, design de personagens/cenários ou ferramentas de criação como Godot, Unity ou similares.',
  },
  {
    id: 2,
    icon: HiOutlineCommandLine,
    title: 'Desenvolvimento Web',
    color: '#FFC530',
    textColor: 'var(--c-accent-yellow)',
    border: 'border-[#FFC530]/25',
    gradient: 'from-[#FFC530]/10 to-[#FF6B35]/5',
    need: 'Alguém com experiência prática em HTML, CSS, JavaScript e no dia a dia de construir e publicar sites reais.',
  },
  {
    id: 3,
    icon: HiOutlineMegaphone,
    title: 'Marketing Digital e Redes Sociais',
    color: '#FF6B35',
    textColor: 'var(--c-accent-coral)',
    border: 'border-[#FF6B35]/20',
    gradient: 'from-[#FF6B35]/10 to-[#FF9068]/5',
    need: 'Alguém com experiência em estratégia de conteúdo, redes sociais e anúncios, disposto a ensinar na prática.',
  },
];

const profile = [
  {
    icon: HiOutlineAcademicCap,
    title: 'Domínio na área',
    desc: 'Experiência prática comprovada em pelo menos uma das trilhas — não precisa ser acadêmica, precisa ser real.',
  },
  {
    icon: HiOutlineChatBubbleBottomCenterText,
    title: 'Didática e escuta',
    desc: 'Vontade de ensinar de forma acessível, respeitando o ritmo e a trajetória de cada estudante.',
  },
  {
    icon: HiOutlineClock,
    title: 'Disponibilidade regular',
    desc: 'Compromisso com encontros semanais ao longo da turma — consistência importa mais do que perfeição.',
  },
  {
    icon: HiOutlineHeart,
    title: 'Compromisso social',
    desc: 'Identificação com a missão do projeto: ampliar oportunidades para catadores, famílias e a comunidade da Estrutural.',
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const APPLICATION_EMAIL = 'contato@institutoipes.org.br';
const mailtoHref = `mailto:${APPLICATION_EMAIL}?subject=${encodeURIComponent(
  'Candidatura para professor(a) — Catadores Digitais'
)}&body=${encodeURIComponent(
  'Olá! Tenho interesse em ser professor(a) voluntário(a) no Catadores Digitais.\n\nNome:\nTrilha de interesse (Games / Desenvolvimento Web / Marketing Digital):\nUm resumo da minha experiência na área:\nDisponibilidade de horários:\n'
)}`;

export function Vagas() {
  const headerRef = useRef(null);
  const tracksRef = useRef(null);
  const profileRef = useRef(null);
  const ctaRef = useRef(null);

  const headerInView = useInView(headerRef, { once: true, margin: '-80px' });
  const tracksInView = useInView(tracksRef, { once: true, margin: '-80px' });
  const profileInView = useInView(profileRef, { once: true, margin: '-80px' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' });

  const { isDark } = useTheme();

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Vagas para Professores — Catadores Digitais';
    return () => { document.title = prevTitle; };
  }, []);

  return (
    <main className="pt-32 md:pt-40">
      {/* Header */}
      <section ref={headerRef} className="relative pb-16 md:pb-20 overflow-hidden">
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #06030F 0%, #0F0A1E 40%, #1A0A3C 100%)'
              : '#FFFFFF',
          }}
        />
        {isDark && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
            style={{ background: 'rgba(255,197,48,0.05)' }}
          />
        )}

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 mb-8"
          >
            <HiOutlineSparkles className="w-4 h-4 text-[var(--c-accent-yellow)]" />
            <span className="font-dm text-sm font-medium text-[var(--c-accent-yellow)] tracking-wide">
              Trabalhe conosco
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-syne font-extrabold text-4xl sm:text-5xl md:text-6xl leading-none tracking-tight mb-6"
          >
            <span className="text-[var(--c-text)]">Ensine o que você sabe.</span>{' '}
            <span className="text-gradient-yellow">Transforme trajetórias.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="font-dm text-lg md:text-xl text-[var(--c-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            Estamos em busca de professoras e professores para as três trilhas do Catadores
            Digitais. Se você domina games, desenvolvimento web ou marketing digital e quer
            usar esse conhecimento para abrir portas, essa vaga é para você.
          </motion.p>
        </div>
      </section>

      {/* Tracks needing teachers */}
      <section ref={tracksRef} className="relative py-16 md:py-20 overflow-hidden">
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{ background: isDark ? 'linear-gradient(to bottom, #06030F, #0F0A1E, #06030F)' : 'linear-gradient(to bottom, #FFFFFF, #F1F0FC, #FFFFFF)' }}
        />
        <div className="absolute top-0 left-0 right-0 section-divider" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={tracksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="font-syne font-extrabold text-3xl md:text-4xl text-[var(--c-text)] mb-4">
              Trilhas com vaga aberta
            </h2>
            <p className="font-dm text-[var(--c-muted)] max-w-2xl mx-auto">
              Você pode se candidatar a mais de uma trilha, se tiver experiência em ambas.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={tracksInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          >
            {tracks.map((track) => {
              const Icon = track.icon;
              return (
                <motion.div
                  key={track.id}
                  variants={cardVariants}
                  whileHover={{ y: -6, transition: { duration: 0.3, ease: 'easeOut' } }}
                  className={`relative rounded-2xl p-7 border ${track.border} bg-gradient-to-b ${track.gradient} glass-card`}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${track.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: track.color }} />
                  </div>
                  <h3 className="font-syne font-extrabold text-xl text-[var(--c-text)] mb-3 leading-tight">
                    {track.title}
                  </h3>
                  <p className="font-dm text-sm text-[var(--c-muted)] leading-relaxed">
                    {track.need}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Profile sought */}
      <section ref={profileRef} className="relative py-16 md:py-20 overflow-hidden">
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, #06030F, #110730, #06030F)'
              : 'linear-gradient(to bottom, #FFF5E3, #FFF0F5, #FFF5E3)',
          }}
        />
        <div className="absolute top-0 left-0 right-0 section-divider" />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={profileInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--c-border)] bg-[var(--c-input-bg)] mb-6">
              <HiOutlineUserGroup className="w-4 h-4 text-[var(--c-accent-purple)]" />
              <span className="font-dm text-sm font-medium text-[var(--c-muted)] tracking-wide">
                Quem estamos procurando
              </span>
            </div>
            <h2 className="font-syne font-extrabold text-3xl md:text-4xl text-[var(--c-text)] mb-4">
              O perfil que buscamos
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={profileInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {profile.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={cardVariants}
                  className="glass-card rounded-2xl p-6 flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-brand-yellow/10">
                    <Icon className="w-5 h-5 text-[var(--c-accent-yellow)]" />
                  </div>
                  <div>
                    <h3 className="font-syne font-bold text-lg text-[var(--c-text)] mb-1.5">
                      {item.title}
                    </h3>
                    <p className="font-dm text-sm text-[var(--c-muted)] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="relative py-16 md:py-24 overflow-hidden">
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{ background: isDark ? 'linear-gradient(to bottom, #06030F, #0F0A1E, #06030F)' : 'linear-gradient(to bottom, #FFFFFF, #F1F0FC, #FFFFFF)' }}
        />
        <div className="absolute top-0 left-0 right-0 section-divider" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-3xl mx-auto px-6"
        >
          <div className="relative rounded-3xl p-8 md:p-12 overflow-hidden text-center glass-card" style={{ borderColor: 'rgba(255,197,48,0.2)' }}>
            <HiOutlineEnvelope className="w-10 h-10 text-[var(--c-accent-yellow)] mx-auto mb-5" />
            <h3 className="font-syne font-extrabold text-2xl md:text-3xl text-[var(--c-text)] mb-3">
              Quer fazer parte?
            </h3>
            <p className="font-dm text-[var(--c-muted)] max-w-md mx-auto mb-7 leading-relaxed">
              Mande um e-mail contando sua experiência e a trilha de interesse.
              Nossa equipe entra em contato para os próximos passos.
            </p>

            <a
              href={mailtoHref}
              className="group inline-flex items-center gap-2 font-syne font-bold text-dark-950 px-8 py-4 rounded-2xl text-base transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #FFC530 0%, #FF6B35 100%)' }}
            >
              Quero me candidatar
              <HiOutlineArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>

            <p className="font-dm text-xs text-[var(--c-subtle)] mt-5">
              {APPLICATION_EMAIL}
            </p>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
