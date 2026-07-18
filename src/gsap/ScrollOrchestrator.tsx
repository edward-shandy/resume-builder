import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from './gsapConfig'
import { useScrollStore, type SectionId } from '../store/scrollStore'

const SECTION_IDS: SectionId[] = ['hero', 'features', 'how-it-works', 'cta', 'footer']

/**
 * DOM-side scroll brain. Mounted once near the app root.
 *
 * - One master ScrollTrigger (trigger = body, scrub) writes 0..1 progress
 *   into scrollStore on every tick. The 3D layer reads this via
 *   useFrame + getState() — it never subscribes for re-renders.
 * - One ScrollTrigger per section flips `activeSection` when a section
 *   crosses the viewport center, so 3D objects can react (e.g. the mecha
 *   head assembling when Features scrolls into view).
 * - Refreshes ScrollTrigger once web fonts finish loading, since font
 *   swaps change section heights and would otherwise leave stale
 *   trigger positions.
 */
export function ScrollOrchestrator() {
  useGSAP(() => {
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        useScrollStore.setState({ progress: self.progress })
      },
    })

    SECTION_IDS.forEach((id) => {
      const el = document.querySelector<HTMLElement>(`[data-section="${id}"]`)
      if (!el) return
      ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive) {
            useScrollStore.setState({ activeSection: id })
          }
        },
      })
    })

    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return null
}
