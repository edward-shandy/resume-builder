import { useEffect, useRef } from 'react'
import { gsap } from '../../gsap/gsapConfig'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * "Guiding star" companion cursor — landing page only. A soft teal glow
 * dot that lerps toward the pointer, brightens/grows over interactive
 * elements, and fades out on idle. It never replaces the real cursor
 * (pointer-events: none, low opacity) — purely a mood accent for a
 * page whose whole thesis is "starlight guiding your way."
 *
 * Disabled entirely on touch devices, coarse pointers, and
 * prefers-reduced-motion — this is decoration, not functionality.
 */
export function GuidingCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const dot = dotRef.current
    if (!dot) return

    const xTo = gsap.quickTo(dot, 'x', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(dot, 'y', { duration: 0.5, ease: 'power3.out' })

    let idleTimer: number | undefined
    let hasMoved = false

    const showActive = () => {
      gsap.to(dot, { opacity: 0.4, duration: 0.3, ease: 'power2.out' })
    }
    const hideIdle = () => {
      gsap.to(dot, { opacity: 0, duration: 0.6, ease: 'power2.out' })
    }

    const scheduleIdle = () => {
      window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(hideIdle, 3000)
    }

    const onMove = (event: PointerEvent) => {
      xTo(event.clientX)
      yTo(event.clientY)
      if (!hasMoved) {
        hasMoved = true
        showActive()
      } else {
        gsap.to(dot, { opacity: 0.4, duration: 0.2, overwrite: 'auto' })
      }
      scheduleIdle()
    }

    const onOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('a, button, [role="button"]')) {
        gsap.to(dot, { scale: 2.2, opacity: 0.65, duration: 0.3, ease: 'power2.out' })
      }
    }

    const onOut = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('a, button, [role="button"]')) {
        gsap.to(dot, { scale: 1, opacity: 0.4, duration: 0.3, ease: 'power2.out' })
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerout', onOut, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerout', onOut)
      window.clearTimeout(idleTimer)
    }
  }, [reducedMotion])

  if (reducedMotion) return null

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[999] opacity-0"
      style={{
        width: 8,
        height: 8,
        marginLeft: -4,
        marginTop: -4,
        borderRadius: '9999px',
        background: 'var(--color-teal)',
        filter: 'blur(3px)',
        boxShadow: '0 0 12px 4px color-mix(in srgb, var(--color-teal) 55%, transparent)',
      }}
    />
  )
}
