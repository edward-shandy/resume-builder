import { useEffect, useState } from 'react'

const QUERY = '(max-width: 767px)'

/**
 * Coarse mobile breakpoint check, used to cap 3D perf budget
 * (dpr, particle counts) rather than for layout decisions —
 * layout responsiveness is handled by Tailwind breakpoints.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const onChange = () => setIsMobile(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
