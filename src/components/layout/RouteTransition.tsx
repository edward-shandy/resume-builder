import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '../../gsap/gsapConfig'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface RouteTransitionProps {
  children: ReactNode
  className?: string
}

/**
 * Per-route entrance wrapper for the foreground content layer (never
 * the 3D canvas — that stays put so the starfield doesn't hiccup).
 * Landing and Builder both mount this around their content, so
 * navigating "/" <-> "/builder" always plays the same fade + scale-up
 * beat instead of an abrupt swap. Reduced motion drops the scale and
 * keeps only the fade.
 *
 * IMPORTANT: a `transform` (or `will-change: transform`) on this node
 * makes it the containing block for any `position: fixed` descendant
 * and can produce compositing-layer clipping quirks for descendant
 * box-shadows (focus rings, button glows). Both are fine *during* the
 * ~300ms entrance, but must not persist — so on completion we
 * `clearProps` transform/opacity/will-change entirely, returning this
 * node to a fully inert `<div>` with no special CSS behavior. Any
 * `position: fixed` element (ScrollProgressBar, Navbar, GuidingCursor)
 * must still be mounted OUTSIDE this wrapper's subtree — clearProps
 * only fixes the *settled* state, not the transient animating one.
 */
export function RouteTransition({ children, className = '' }: RouteTransitionProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(
    () => {
      if (!rootRef.current) return
      const onComplete = () => {
        gsap.set(rootRef.current, { clearProps: 'transform,scale,opacity,willChange' })
      }
      if (reducedMotion) {
        gsap.fromTo(
          rootRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.25, ease: 'power2.out', onComplete },
        )
        return
      }
      gsap.fromTo(
        rootRef.current,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out', onComplete },
      )
    },
    { scope: rootRef },
  )

  return (
    <div ref={rootRef} className={className} style={{ transformOrigin: 'center' }}>
      {children}
    </div>
  )
}
