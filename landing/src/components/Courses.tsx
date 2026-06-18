import { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { HiOutlineCommandLine, HiOutlineMegaphone } from 'react-icons/hi2';
import { BsController } from 'react-icons/bs';
import { useTheme } from '../context/ThemeContext';

const courses = [
  {
    id: 1,
    icon: BsController,
    tag: 'Curso 01',
    title: 'Produção de Games',
    tagline: 'Do pixel à publicação',
    color: '#A855F7',          /* decorative: borders, icon bg, dots */
    textColor: 'var(--c-accent-purple)', /* readable text — accessible in both modes */
    gradient: 'from-[#A855F7]/10 to-[#7C3AED]/5',
    border: 'border-[#A855F7]/20',
    glow: 'rgba(168,85,247,0.12)',
    description:
      'Crie jogos do zero usando ferramentas modernas e inteligência artificial como amplificadora da sua criatividade. O curso termina com seu jogo publicado online — um portfólio real para o mercado.',
    outcomes: [
      'Lógica de programação com jogos',
      'Design de personagens e cenários',
      'IA como ferramenta criativa',
      'Publicação e distribuição online',
    ],
    result: 'Um jogo publicado online',
  },
  {
    id: 2,
    icon: HiOutlineCommandLine,
    tag: 'Curso 02',
    title: 'Desenvolvimento Web',
    tagline: 'Sites que as pessoas vão usar de verdade',
    color: '#FFC530',
    textColor: 'var(--c-accent-yellow)',
    gradient: 'from-[#FFC530]/10 to-[#FF6B35]/5',
    border: 'border-[#FFC530]/25',
    glow: 'rgba(255,197,48,0.12)',
    description:
      'Aprenda a construir sites reais com HTML, CSS, JavaScript e ferramentas de IA. O projeto final é um site para um negócio ou iniciativa real da sua comunidade — alguém vai usar o que você criar.',
    outcomes: [
      'HTML, CSS e JavaScript do zero',
      'Design responsivo e moderno',
      'IA para acelerar o desenvolvimento',
      'Hospedagem e domínio na prática',
    ],
    result: 'Um site no ar para um negócio real',
  },
  {
    id: 3,
    icon: HiOutlineMegaphone,
    tag: 'Curso 03',
    title: 'Marketing Digital e Redes Sociais',
    tagline: 'Estratégia, conteúdo e resultado',
    color: '#FF6B35',
    textColor: 'var(--c-accent-coral)',
    gradient: 'from-[#FF6B35]/10 to-[#FF9068]/5',
    border: 'border-[#FF6B35]/20',
    glow: 'rgba(255,107,53,0.12)',
    description:
      'Domine as ferramentas do marketing digital: criação de conteúdo, estratégia para redes sociais, anúncios e IA para escalar resultados. O projeto final é um plano de marketing executado para um negócio da comunidade.',
    outcomes: [
      'Estratégia para Instagram, TikTok e YouTube',
      'Criação de conteúdo com IA',
      'Anúncios e métricas na prática',
      'Plano de marketing real executado',
    ],
    result: 'Um plano de marketing executado',
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function Courses() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { isDark } = useTheme();

  return (
    <section id="cursos" className="relative py-24 md:py-32 overflow-hidden">
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{ background: isDark ? 'linear-gradient(to bottom, #06030F, #0F0A1E, #06030F)' : 'linear-gradient(to bottom, #FFFFFF, #F1F0FC, #FFFFFF)' }}
      />
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-yellow/20 bg-brand-yellow/10 mb-6">
            <span className="font-dm text-sm font-medium text-[var(--c-accent-yellow)] tracking-wide">
              Três trilhas, um destino
            </span>
          </div>
          <h2 className="font-syne font-extrabold text-4xl md:text-5xl lg:text-6xl text-[var(--c-text)] mb-5 leading-tight">
            As formações
          </h2>
          <p className="font-dm text-lg text-[var(--c-muted)] max-w-2xl mx-auto leading-relaxed">
            Cursos gratuitos baseados em projetos reais. Você aprende fazendo e sai com
            algo concreto no portfólio — não um exercício, mas um entregável real.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <motion.div
                key={course.id}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.3, ease: 'easeOut' } }}
                className={`relative group rounded-2xl p-7 lg:p-8 border ${course.border} bg-gradient-to-b ${course.gradient} glass-card cursor-default`}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ boxShadow: `0 20px 60px ${course.glow}` }}
                />

                <div className="flex items-center justify-between mb-6">
                  <span
                    className="font-dm text-xs font-semibold tracking-widest uppercase"
                    style={{ color: course.textColor }}
                  >
                    {course.tag}
                  </span>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${course.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: course.color }} />
                  </div>
                </div>

                <h3 className="font-syne font-extrabold text-2xl text-[var(--c-text)] mb-1 leading-tight">
                  {course.title}
                </h3>
                <p className="font-dm text-sm mb-4" style={{ color: course.textColor }}>
                  {course.tagline}
                </p>

                <p className="font-dm text-sm text-[var(--c-muted)] leading-relaxed mb-6">
                  {course.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {course.outcomes.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: course.color }}
                      />
                      <span className="font-dm text-sm text-[var(--c-muted)]">{item}</span>
                    </li>
                  ))}
                </ul>

                <div
                  className="flex items-center gap-2 pt-4 border-t"
                  style={{ borderColor: `${course.color}20` }}
                >
                  <HiOutlineArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: course.textColor }} />
                  <span className="font-dm text-sm font-semibold text-[var(--c-text)]">
                    {course.result}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Methodology callout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="mt-14 p-7 md:p-10 rounded-2xl border border-[var(--c-border)] glass-card text-center"
        >
          <p className="font-dm text-base md:text-lg text-[var(--c-muted)] max-w-3xl mx-auto leading-relaxed">
            <span className="text-[var(--c-accent-yellow)] font-semibold">Project-Based Learning + IA.</span>{' '}
            A metodologia que atravessa os três cursos: aprenda resolvendo problemas reais,
            amplificado por inteligência artificial — não como atalho, mas como ferramenta.
            Dewey já sabia:{' '}
            <em className="text-[var(--c-text)]">o aprendizado que transforma é o que parte da realidade de quem aprende.</em>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
