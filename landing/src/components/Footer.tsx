import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineEnvelope } from 'react-icons/hi2';
import { Logo } from './Logo';

const sectionLinks = [
  { label: 'Cursos', hash: '#cursos' },
  { label: 'Inscrições', hash: '#inscricoes' },
  { label: 'Realização', hash: '#realizacao' },
];

export function Footer() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const sectionHref = (hash: string) => (isHome ? hash : `/${hash}`);

  return (
    <footer className="relative border-t border-[var(--c-border)] bg-[var(--c-bg-alt)]">
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-16">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
          <div className="max-w-xs">
            <Logo size="sm" showTagline />
            <p className="font-dm text-sm text-[var(--c-subtle)] mt-4 leading-relaxed">
              Formações gratuitas em tecnologia para catadores, suas famílias e
              moradores da Cidade Estrutural — DF.
            </p>
          </div>

          <div>
            <p className="font-dm text-xs font-semibold tracking-widest uppercase text-[var(--c-subtle)] mb-4">
              Navegação
            </p>
            <ul className="space-y-2">
              {sectionLinks.map((link) => (
                <li key={link.hash}>
                  <a
                    href={sectionHref(link.hash)}
                    className="font-dm text-sm text-[var(--c-muted)] hover:text-brand-yellow transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/vagas"
                  className="font-dm text-sm text-[var(--c-muted)] hover:text-brand-yellow transition-colors"
                >
                  Vagas
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-dm text-xs font-semibold tracking-widest uppercase text-[var(--c-subtle)] mb-4">
              Contato
            </p>
            <a
              href="mailto:contato@institutoipes.org.br"
              className="flex items-center gap-2 font-dm text-sm text-[var(--c-muted)] hover:text-brand-yellow transition-colors"
            >
              <HiOutlineEnvelope className="w-4 h-4" />
              contato@institutoipes.org.br
            </a>
          </div>
        </div>

        <div className="section-divider mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-dm text-xs text-[var(--c-subtle)] text-center sm:text-left">
            © 2026 Catadores Digitais — Instituto Ipês. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-1">
            <span className="font-dm text-xs text-[var(--c-faint)]">Realizado com</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-brand-coral text-xs"
            >
              ♥
            </motion.span>
            <span className="font-dm text-xs text-[var(--c-faint)]">em Brasília, DF</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
