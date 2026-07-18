import { useRef, type RefObject } from 'react'
import { gsap, useGSAP } from '../../gsap/gsapConfig'

/**
 * Fires a brief gold background flash on the given element whenever
 * `value` changes — the "live connection" feedback between the form
 * and the ATS preview. Skips the flash on first mount so the preview
 * doesn't flicker on initial load/hydration.
 */
export function useFlashOnChange(ref: RefObject<HTMLElement | null>, value: unknown) {
  const mounted = useRef(false)

  useGSAP(
    () => {
      if (!mounted.current) {
        mounted.current = true
        return
      }
      if (!ref.current) return
      gsap.fromTo(
        ref.current,
        { backgroundColor: 'rgba(255,217,142,0.28)' },
        { backgroundColor: 'rgba(255,217,142,0)', duration: 0.7, ease: 'power2.out' },
      )
    },
    { dependencies: [value] },
  )
}
