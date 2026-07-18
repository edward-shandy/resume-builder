import { useReducedMotion } from '../../hooks/useReducedMotion'

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
]

export function Navbar() {
  const reducedMotion = useReducedMotion()

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault()
    const target = document.querySelector(href)
    target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <header className="fixed inset-x-0 top-[3px] z-40">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/85 via-ink/45 to-transparent backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, '#hero')}
          className="flex items-center gap-2.5 font-display text-lg font-medium tracking-wide text-white"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-gold" fill="currentColor" aria-hidden="true">
            <path d="M12 2 L13.8 9.5 L21 12 L13.8 14.5 L12 22 L10.2 14.5 L3 12 L10.2 9.5 Z" />
          </svg>
          NorthStar
        </a>

        <nav className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="label-readout text-white/70 transition-colors hover:text-gold"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#cta"
          onClick={(e) => handleNavClick(e, '#cta')}
          className="rounded-full border border-gold/50 px-4 py-2 font-body text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-ink"
        >
          Start Building
        </a>
      </div>
    </header>
  )
}
