import { useRef, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../gsap/gsapConfig'
import { PanelFrame } from '../../components/ui/PanelFrame'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export interface FeatureCardData {
  key: string
  title: string
  description: string
  icon: ReactNode
}

interface FeatureCardProps {
  data: FeatureCardData
  index: number
}

const ACCENTS = ['gold', 'violet', 'teal'] as const

export function FeatureCard({ data, index }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const accent = ACCENTS[index % ACCENTS.length]

  const { contextSafe } = useGSAP({ scope: cardRef })

  const onMove = contextSafe((event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5

    gsap.to(el, {
      rotateX: py * -6,
      rotateY: px * 8,
      y: -6,
      duration: 0.4,
      ease: 'power2.out',
      transformPerspective: 700,
    })
  })

  const onLeave = contextSafe(() => {
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      y: 0,
      duration: 0.5,
      ease: 'power3.out',
    })
  })

  return (
    <PanelFrame className="feature-card px-7 py-8">
      <div
        ref={cardRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className={`mb-6 flex h-12 w-12 items-center justify-center rounded-full border ${
            accent === 'gold'
              ? 'border-gold/40 text-gold'
              : accent === 'violet'
                ? 'border-violet/40 text-violet'
                : 'border-teal/40 text-teal'
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6">
            {data.icon}
          </svg>
        </div>

        <h3 className="font-display text-xl font-medium text-white">{data.title}</h3>
        <p className="mt-3 font-body text-sm leading-relaxed text-slate">{data.description}</p>
      </div>
    </PanelFrame>
  )
}
