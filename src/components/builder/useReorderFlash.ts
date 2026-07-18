import { useEffect, useRef, useState } from 'react'

/**
 * Tracks an ordered list of ids and reports which ones just changed
 * position — used to give auto-sorted EntryCards ("moved to the top
 * because you set it to your current role") a brief highlight instead
 * of silently teleporting. Returns a Set that's populated for ~700ms
 * after a reorder, then clears itself.
 */
export function useReorderFlash(ids: string[]): Set<string> {
  const prevOrder = useRef<string[]>(ids)
  const [flashed, setFlashed] = useState<Set<string>>(new Set())
  const key = ids.join(',')

  useEffect(() => {
    const prev = prevOrder.current
    prevOrder.current = ids
    if (prev.length !== ids.length) return
    const moved = new Set<string>()
    ids.forEach((id, i) => {
      if (prev[i] !== id) moved.add(id)
    })
    if (moved.size === 0) return
    setFlashed(moved)
    const timer = window.setTimeout(() => setFlashed(new Set()), 700)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return flashed
}
