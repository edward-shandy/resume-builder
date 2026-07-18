import { useEffect, useRef, useState, type ReactNode } from 'react'
import { gsap, useGSAP } from '../../gsap/gsapConfig'

interface EntryCardProps {
  title: ReactNode
  subtitle?: ReactNode
  isExpanded: boolean
  onToggleExpand: () => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
  /** Plays a slide+fade entrance once, for freshly-added entries. */
  isNew?: boolean
  children: ReactNode
}

/**
 * Generic collapsible entry card shared by Experience and Education
 * (and any future repeatable step). Header shows title/subtitle plus
 * reorder + delete controls; body is GSAP height-animated open/closed.
 * Delete is a two-click micro-confirm — first click arms it (and
 * auto-disarms after 3s), second click within that window fires the
 * fade-out and removes the entry.
 */
export function EntryCard({
  title,
  subtitle,
  isExpanded,
  onToggleExpand,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
  isNew = false,
  children,
}: EntryCardProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const bodyWrapRef = useRef<HTMLDivElement>(null)
  const bodyInnerRef = useRef<HTMLDivElement>(null)
  // Captured once at mount so re-renders never re-apply it (GSAP owns
  // height/opacity from then on).
  const initialBodyStyle = useRef<{ height: number | string; opacity: number }>({
    height: isExpanded ? 'auto' : 0,
    opacity: isExpanded ? 1 : 0,
  })
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const disarmTimer = useRef<number | undefined>(undefined)

  const { contextSafe } = useGSAP({ scope: rootRef })

  // Entrance for a freshly-added card.
  useGSAP(
    () => {
      if (!isNew || !rootRef.current) return
      gsap.from(rootRef.current, {
        opacity: 0,
        y: -12,
        duration: 0.45,
        ease: 'power3.out',
      })
    },
    { scope: rootRef, dependencies: [] },
  )

  // Smooth expand/collapse height animation. Tween straight to
  // height:'auto' (GSAP measures internally) and pin 'auto' again on
  // complete — never park on a fixed pixel height, so dynamic content
  // (new bullets, wrapping text) can't end up clipped. overwrite kills
  // any in-flight tween instead of letting two fight over the value.
  useGSAP(
    () => {
      const wrap = bodyWrapRef.current
      if (!wrap) return
      if (isExpanded) {
        gsap.to(wrap, {
          height: 'auto',
          opacity: 1,
          duration: 0.35,
          ease: 'power3.out',
          overwrite: 'auto',
          onComplete: () => gsap.set(wrap, { height: 'auto' }),
        })
      } else {
        gsap.to(wrap, { height: 0, opacity: 0, duration: 0.3, ease: 'power3.inOut', overwrite: 'auto' })
      }
    },
    { scope: rootRef, dependencies: [isExpanded] },
  )

  useEffect(() => {
    return () => window.clearTimeout(disarmTimer.current)
  }, [])

  const handleDeleteClick = contextSafe(() => {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      disarmTimer.current = window.setTimeout(() => setConfirmingDelete(false), 3000)
      return
    }
    window.clearTimeout(disarmTimer.current)
    gsap.to(rootRef.current, {
      opacity: 0,
      x: -12,
      height: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      duration: 0.32,
      ease: 'power2.in',
      onComplete: onDelete,
    })
  })

  return (
    // shrink-0: this card sits in a height-constrained flex column and has
    // overflow-hidden (for rounded corners), which makes it flex-shrinkable
    // below its content height — that was the "clipped achievements" bug.
    <div ref={rootRef} className="shrink-0 overflow-hidden rounded-xl border border-white/10 bg-navy-deep/40">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={onToggleExpand}
          className="group flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
          aria-expanded={isExpanded}
        >
          <svg
            viewBox="0 0 16 16"
            className={`h-3.5 w-3.5 shrink-0 text-white/40 transition-all duration-300 group-hover:text-gold ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            aria-hidden="true"
          >
            <path d="M5 3 L11 8 L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-body text-sm font-semibold text-white">{title}</span>
            {subtitle && <span className="block truncate font-body text-xs text-white/45">{subtitle}</span>}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              aria-label="Move up"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-white/40 transition-all duration-150 hover:scale-110 hover:bg-white/10 hover:text-gold disabled:pointer-events-none disabled:opacity-25"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                <path d="M3 10 L8 5 L13 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              aria-label="Move down"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-white/40 transition-all duration-150 hover:scale-110 hover:bg-white/10 hover:text-gold disabled:pointer-events-none disabled:opacity-25"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                <path d="M3 6 L8 11 L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={handleDeleteClick}
            aria-label={confirmingDelete ? 'Confirm delete' : 'Delete entry'}
            className={[
              'flex h-7 cursor-pointer items-center justify-center rounded-md px-2 font-mono text-[10px] font-bold tracking-wide transition-all duration-200',
              confirmingDelete
                ? 'w-auto animate-pulse gap-1 bg-red-500/25 text-red-300 ring-1 ring-red-400/60 hover:scale-105 hover:bg-red-500/40 hover:text-red-100'
                : 'w-7 text-white/40 hover:scale-110 hover:bg-red-500/15 hover:text-red-300',
            ].join(' ')}
          >
            {confirmingDelete ? (
              'CONFIRM?'
            ) : (
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                <path
                  d="M3.5 4.5 H12.5 M6 4.5 V3 a1 1 0 0 1 1 -1 h2 a1 1 0 0 1 1 1 v1.5 M4.5 4.5 L5 13 a1 1 0 0 0 1 1 h4 a1 1 0 0 0 1 -1 L11.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Height/opacity are GSAP-owned after mount — no React inline style
          here, or re-renders mid-animation reset the value and the tween
          parks on a stale height (the old clipping bug). */}
      <div ref={bodyWrapRef} className="overflow-hidden" style={initialBodyStyle.current}>
        <div ref={bodyInnerRef} className="border-t border-white/10 px-4 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
