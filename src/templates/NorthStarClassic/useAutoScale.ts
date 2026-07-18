import { useEffect, useRef, useState } from 'react'

/**
 * Measures the available width of `containerRef` and returns a scale
 * factor so a fixed-size element (`baseWidth` px wide) fits inside it
 * without ever resizing its own fonts — the caller applies the scale
 * via `transform: scale()`, not by touching content dimensions.
 */
export function useAutoScale(containerRef: React.RefObject<HTMLElement | null>, baseWidth: number) {
  const [scale, setScale] = useState(1)
  const frame = useRef<number | undefined>(undefined)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const measure = () => {
      const width = el.clientWidth
      if (width > 0) {
        const next = Math.min(width / baseWidth, 1.15)
        setScale(next)
      }
    }

    measure()

    const observer = new ResizeObserver(() => {
      if (frame.current) cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(measure)
    })
    observer.observe(el)

    return () => {
      observer.disconnect()
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [containerRef, baseWidth])

  return scale
}
