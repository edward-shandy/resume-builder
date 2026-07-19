import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '../../gsap/gsapConfig'

interface CollapsibleSectionProps {
  header: ReactNode
  isOpen: boolean
  children: ReactNode
}

/**
 * Card shell for an Extras sub-section: a fixed header (the toggle) and
 * a GSAP height-animated body that only mounts content while open. Same
 * height-to-'auto' tween strategy as EntryCard, so dynamically added
 * rows (a new certification, a new language) never end up clipped.
 */
export function CollapsibleSection({ header, isOpen, children }: CollapsibleSectionProps) {
  const bodyWrapRef = useRef<HTMLDivElement>(null)
  const initialBodyStyle = useRef<{ height: number | string; opacity: number }>({
    height: isOpen ? 'auto' : 0,
    opacity: isOpen ? 1 : 0,
  })

  useGSAP(
    () => {
      const wrap = bodyWrapRef.current
      if (!wrap) return
      if (isOpen) {
        gsap.to(wrap, {
          height: 'auto',
          opacity: 1,
          duration: 0.35,
          ease: 'power3.out',
          overwrite: 'auto',
          onComplete: () => gsap.set(wrap, { height: 'auto' }),
        })
      } else {
        gsap.to(wrap, { height: 0, opacity: 0, duration: 0.28, ease: 'power3.inOut', overwrite: 'auto' })
      }
    },
    { dependencies: [isOpen] },
  )

  return (
    <div className="shrink-0 overflow-hidden rounded-xl border border-white/10 bg-navy-deep/30">
      <div className="px-4 py-3.5">{header}</div>
      <div ref={bodyWrapRef} className="overflow-hidden" style={initialBodyStyle.current}>
        <div className="border-t border-white/10 px-4 pb-4">{children}</div>
      </div>
    </div>
  )
}
