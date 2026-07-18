import { useRef } from 'react'
import { gsap, useGSAP } from '../../gsap/gsapConfig'
import { SectionHeading } from '../../components/ui/SectionHeading'
import { FeatureCard, type FeatureCardData } from './FeatureCard'

const FEATURES: FeatureCardData[] = [
  {
    key: 'preview',
    title: 'Live preview',
    description:
      'Every edit renders instantly in a full-scale preview — what you see in the builder is exactly what ships on the page.',
    icon: (
      <path
        d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    ),
  },
  {
    key: 'templates',
    title: 'Guided templates',
    description:
      'Constellations of layout blocks adapt to your content and role — swap templates without losing a single line you wrote.',
    icon: (
      <path
        d="M5 19 10 6l3 8 2-4 4 9M5 19h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    key: 'export',
    title: 'Export to PDF',
    description:
      'One click sends a clean, print-ready PDF on its way — ATS-friendly and recruiter-approved, streaking straight to the inbox.',
    icon: (
      <path
        d="M4 15c4-9 8-11 16-11-1 8-4 12-12 16l-1-2-2-1-1-2Zm0 0-3 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
]

export function Features() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.feature-heading', {
          opacity: 0,
          y: 24,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        })
        gsap.from('.feature-card', {
          opacity: 0,
          y: 40,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.feature-grid', start: 'top 80%' },
        })
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.from(['.feature-heading', '.feature-card'], {
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
      id="features"
      data-section="features"
      className="relative px-6 py-32 sm:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="feature-heading">
          <SectionHeading
            eyebrow="What's in the sky"
            title="Everything you need to chart the next role."
            description="Three quiet tools carry the whole resume-building workflow, from first draft to finished export."
          />
        </div>

        <div className="feature-grid mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.key} data={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
