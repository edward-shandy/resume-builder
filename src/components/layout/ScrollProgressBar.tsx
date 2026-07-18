import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useScrollStore } from '../../store/scrollStore'

/**
 * Thin HUD readout bar pinned to the top of the viewport. Subscribes
 * directly to scrollStore and writes the DOM transform itself —
 * deliberately bypasses React state so it never re-renders the tree
 * on every scroll tick.
 */
export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const unsubscribe = useScrollStore.subscribe((state) => {
      const bar = barRef.current
      if (bar) bar.style.transform = `scaleX(${state.progress})`
    })
    return unsubscribe
  }, [])

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-white/5">
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-violet via-gold to-teal will-change-transform"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  )
}
