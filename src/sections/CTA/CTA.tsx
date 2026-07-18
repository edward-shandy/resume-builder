import { useRef } from 'react'
import { gsap, useGSAP } from '../../gsap/gsapConfig'
import { PanelFrame } from '../../components/ui/PanelFrame'
import { Button } from '../../components/ui/Button'

export function CTA() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.cta-panel', {
          opacity: 0,
          scale: 0.96,
          y: 30,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        })

        // Idle glow pulse on the panel border while it's in view.
        gsap.to('.cta-glow', {
          opacity: 0.5,
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.from('.cta-panel', {
          opacity: 0,
          duration: 0.5,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
        })
      })
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      id="cta"
      data-section="cta"
      className="relative px-6 py-32 sm:px-10"
    >
      <div className="mx-auto max-w-5xl">
        <PanelFrame className="cta-panel relative overflow-hidden px-8 py-16 text-center sm:px-16">
          <div
            className="cta-glow pointer-events-none absolute inset-0 opacity-15"
            style={{
              boxShadow: 'inset 0 0 90px 12px color-mix(in srgb, var(--color-violet) 40%, transparent)',
            }}
            aria-hidden="true"
          />

          <span className="label-readout text-gold">Your next chapter, waiting</span>

          <h2 className="mt-5 font-display text-4xl font-medium leading-[1.08] text-white sm:text-5xl">
            Your career, launched.
          </h2>
          <p className="mx-auto mt-5 max-w-lg font-body text-lg text-slate">
            Your resume, fully written and ready to send. No credit card, no waiting on
            approval — just launch.
          </p>

          <div className="mt-9 flex justify-center">
            <Button variant="primary" href="/builder">
              Start Building — Free
            </Button>
          </div>
        </PanelFrame>
      </div>
    </section>
  )
}
