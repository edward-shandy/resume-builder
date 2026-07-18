import { useRef } from 'react'
import { gsap, useGSAP } from '../../gsap/gsapConfig'
import { SectionHeading } from '../../components/ui/SectionHeading'

const STEPS = [
  {
    phase: 'STEP 01',
    title: 'Make a wish',
    description:
      'Feed in your experience, skills, and history through structured fields — no formatting fuss, no blank-page dread.',
  },
  {
    phase: 'STEP 02',
    title: 'Chart your course',
    description:
      'Pick a template and tune the layout section by section until the build matches the role you want.',
  },
  {
    phase: 'STEP 03',
    title: 'Let it fly',
    description:
      'Export a polished, ATS-ready PDF in one click — sent on its way like a shooting star.',
  },
]

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.how-heading', {
          opacity: 0,
          y: 24,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        })

        // The connecting rail "lights up" as the section scrolls into view.
        gsap.fromTo(
          '.how-rail-fill',
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.how-track',
              start: 'top 70%',
              end: 'bottom 60%',
              scrub: 0.6,
            },
          },
        )

        gsap.from('.how-step', {
          opacity: 0,
          y: 36,
          duration: 0.6,
          stagger: 0.18,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.how-track', start: 'top 75%' },
        })
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('.how-rail-fill', { scaleX: 1 })
        gsap.from(['.how-heading', '.how-step'], {
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
      id="how-it-works"
      data-section="how-it-works"
      className="relative px-6 py-32 sm:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="how-heading">
          <SectionHeading
            eyebrow="How it works"
            title="Three steps from blank page to launch."
            description="The order matters — each step locks in before the next one starts."
            align="center"
          />
        </div>

        <div className="how-track relative mt-20">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-white/10 sm:block">
            <div className="how-rail-fill h-full origin-left bg-gradient-to-r from-violet via-gold to-teal" />
          </div>

          <ol className="relative grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step) => (
              <li key={step.phase} className="how-step flex flex-col items-center text-center">
                <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-gold/50 bg-ink font-display text-sm font-medium text-gold">
                  {step.phase.slice(-2)}
                </span>
                <span className="label-readout mt-4 text-white/40">{step.phase}</span>
                <h3 className="mt-2 font-display text-xl font-medium text-white">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xs font-body text-sm leading-relaxed text-slate">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
