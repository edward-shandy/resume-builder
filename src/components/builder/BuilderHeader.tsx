import { Link } from 'react-router'

/**
 * Slim fixed header for the builder app: a mini NorthStar mark (no
 * nav links to distract from the wizard) and a way back to the
 * landing page. Deliberately quieter than the landing Navbar.
 */
export function BuilderHeader() {
  return (
    <header className="relative z-40 border-b border-white/10 bg-ink/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-3 sm:px-8">
        <div className="flex items-center gap-2 font-display text-base font-medium tracking-wide text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-gold" fill="currentColor" aria-hidden="true">
            <path d="M12 2 L13.8 9.5 L21 12 L13.8 14.5 L12 22 L10.2 14.5 L3 12 L10.2 9.5 Z" />
          </svg>
          <span>Resume Builder</span>
        </div>

        <Link
          to="/"
          className="label-readout flex items-center gap-2 text-white/60 transition-colors duration-150 hover:text-teal"
        >
          <span aria-hidden="true">&larr;</span> Back to Home
        </Link>
      </div>
    </header>
  )
}
