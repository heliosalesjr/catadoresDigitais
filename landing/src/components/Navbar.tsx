import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { HiArrowRightOnRectangle, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';
import { Logo } from './Logo';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { label: 'Cursos', href: '#cursos' },
  { label: 'Público', href: '#inscricoes' },
  { label: 'Realização', href: '#realizacao' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggle } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[var(--c-bg)]/90 backdrop-blur-xl border-b border-[var(--c-border)] py-3 shadow-sm'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Logo size="sm" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-dm font-medium text-[var(--c-muted)] hover:text-brand-yellow transition-colors duration-200 text-sm tracking-wide"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              aria-label="Alternar tema"
              className="w-9 h-9 rounded-full border border-[var(--c-border)] flex items-center justify-center text-[var(--c-subtle)] hover:text-brand-yellow hover:border-brand-yellow/30 transition-colors duration-200"
            >
              {isDark ? <HiOutlineSun className="w-4 h-4" /> : <HiOutlineMoon className="w-4 h-4" />}
            </button>

            <a
              href="#inscricoes"
              className="font-dm font-semibold text-sm text-dark-950 bg-brand-yellow hover:bg-brand-yellow-light transition-colors duration-200 px-4 py-2 rounded-full"
            >
              Em breve
            </a>
            <button
              disabled
              title="Login disponível em breve"
              className="flex items-center gap-2 font-dm font-medium text-sm text-[var(--c-faint)] border border-[var(--c-border)] px-4 py-2 rounded-full cursor-not-allowed"
            >
              <HiArrowRightOnRectangle className="w-4 h-4" />
              Login
            </button>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Alternar tema"
              className="w-9 h-9 rounded-full border border-[var(--c-border)] flex items-center justify-center text-[var(--c-subtle)]"
            >
              {isDark ? <HiOutlineSun className="w-4 h-4" /> : <HiOutlineMoon className="w-4 h-4" />}
            </button>
            <button
              className="text-[var(--c-text)] p-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <HiX className="w-6 h-6" /> : <HiMenuAlt3 className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-x-0 top-[64px] z-40 bg-[var(--c-bg)]/98 backdrop-blur-2xl border-b border-[var(--c-border)] md:hidden"
          >
            <nav className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-dm font-semibold text-lg text-[var(--c-text)] hover:text-brand-yellow transition-colors py-1 border-b border-[var(--c-border)]"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-2">
                <a
                  href="#inscricoes"
                  onClick={() => setMenuOpen(false)}
                  className="text-center font-dm font-semibold text-dark-950 bg-brand-yellow py-3 rounded-xl"
                >
                  Em breve — Inscrições
                </a>
                <button
                  disabled
                  className="font-dm font-medium text-[var(--c-faint)] border border-[var(--c-border)] py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <HiArrowRightOnRectangle className="w-4 h-4" />
                  Login
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
