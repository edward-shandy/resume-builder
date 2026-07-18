import { useRef } from 'react'
import { gsap, useGSAP } from '../../gsap/gsapConfig'
import { PanelFrame } from '../../components/ui/PanelFrame'
import { Button } from '../../components/ui/Button'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'power3.out' } })
        tl.from('.hero-badge', { opacity: 0, y: -12, duration: 0.6 })
          .from('.hero-line', { opacity: 0, y: 28, duration: 0.9, stagger: 0.14 }, '-=0.3')
          .from('.hero-sub', { opacity: 0, y: 16, duration: 0.6 }, '-=0.4')
          .from('.hero-actions > *', { opacity: 0, y: 16, duration: 0.5, stagger: 0.1 }, '-=0.3')
          .from('.hero-serial', { opacity: 0, duration: 0.6 }, '-=0.4')
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.from(
          ['.hero-badge', '.hero-line', '.hero-sub', '.hero-actions > *', '.hero-serial'],
          { opacity: 0, duration: 0.5 },
        )
      })
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      id="hero"
      data-section="hero"
      className="relative flex min-h-screen items-center px-6 py-32 sm:px-10"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10">
        <PanelFrame className="max-w-2xl px-7 py-9 sm:px-10 sm:py-12">
          <span className="hero-badge label-readout mb-6 inline-flex items-center gap-2 text-gold">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
            NorthStar // Guiding your next role
          </span>

          <h1 className="font-display text-5xl font-medium leading-[1.05] text-white sm:text-6xl md:text-7xl">
            <span className="hero-line block">Write your story</span>
            <span className="hero-line block italic text-gold">in the stars.</span>
          </h1>

          <p className="hero-sub mt-6 max-w-md font-body text-lg leading-relaxed text-slate">
            Wish upon a shooting star, then build the resume that lands it. Live preview,
            guided templates, and a one-click export — calm, clear, ready to launch.
          </p>

          <div className="hero-actions mt-9 flex flex-wrap items-center gap-4">
            <Button variant="primary" href="/builder">
              Start Building
            </Button>
            <Button variant="secondary" href="#features">
              See Features
            </Button>
          </div>
        </PanelFrame>

        <p className="hero-serial label-readout text-white/35">
          N 48.85&deg; &nbsp;/&nbsp; W 2.35&deg; &nbsp;/&nbsp; CLEAR SKIES, CAREER RISING
        </p>
      </div>
    </section>
  )
}
