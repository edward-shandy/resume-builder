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

const ACCENT_STYLES = {
  gold: {
    topBorder: 'before:bg-gold',
    iconRing: 'border-gold/40 text-gold bg-gold/10',
    dot: 'bg-gold',
    shadow: '0 20px 45px -20px color-mix(in srgb, var(--color-gold) 45%, transparent)',
  },
  violet: {
    topBorder: 'before:bg-violet',
    iconRing: 'border-violet/40 text-violet bg-violet/10',
    dot: 'bg-violet',
    shadow: '0 20px 45px -20px color-mix(in srgb, var(--color-violet) 45%, transparent)',
  },
  teal: {
    topBorder: 'before:bg-teal',
    iconRing: 'border-teal/40 text-teal bg-teal/10',
    dot: 'bg-teal',
    shadow: '0 20px 45px -20px color-mix(in srgb, var(--color-teal) 45%, transparent)',
  },
} as const

export function FeatureCard({ data, index }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const accent = ACCENTS[index % ACCENTS.length]
  const styles = ACCENT_STYLES[accent]

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
      duration: 0.4,
      ease: 'power2.out',
      transformPerspective: 700,
    })
    gsap.to(panelRef.current, {
      y: -4,
      boxShadow: styles.shadow,
      duration: 0.35,
      ease: 'power2.out',
    })
  })

  const onLeave = contextSafe(() => {
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power3.out',
    })
    gsap.to(panelRef.current, {
      y: 0,
      boxShadow: '0 0px 0px -20px transparent',
      duration: 0.4,
      ease: 'power3.out',
    })
  })

  return (
    <PanelFrame
      className={`feature-card relative overflow-hidden px-7 py-8 before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:content-[''] ${styles.topBorder}`}
      panelRef={panelRef}
    >
      <div
        ref={cardRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className={`relative mb-6 flex h-14 w-14 items-center justify-center rounded-full border ${styles.iconRing}`}>
          <svg viewBox="0 0 24 24" className="h-7 w-7">
            {data.icon}
          </svg>
          <span
            className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-ink-soft ${styles.dot}`}
            aria-hidden="true"
          />
        </div>

        <h3 className="font-display text-xl font-medium text-white">{data.title}</h3>
        <p className="mt-3 font-body text-sm leading-relaxed text-mist">{data.description}</p>
      </div>
    </PanelFrame>
  )
}
