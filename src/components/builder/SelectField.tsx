import { useEffect, useRef, useState, useId } from 'react'
import { createPortal } from 'react-dom'
import { gsap, useGSAP } from '../../gsap/gsapConfig'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  wrapperClassName?: string
  disabled?: boolean
  /** Skips the visible label row (still used for aria-label) — for compact composite fields like DateSelect. */
  hideLabel?: boolean
}

/**
 * Themed replacement for a native <select>: the OS popup can't be
 * styled, so this renders its own glass listbox in a portal (escapes
 * any `overflow-hidden` ancestor — cards clip content otherwise) with
 * GSAP scale/fade entrance, full keyboard support, and a click-outside
 * close. Semantics follow the ARIA combobox-listbox pattern.
 */
export function SelectField({
  label,
  required,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  wrapperClassName = '',
  disabled = false,
  hideLabel = false,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLUListElement>(null)
  const typeaheadRef = useRef('')
  const typeaheadTimer = useRef<number | undefined>(undefined)
  const listboxId = useId()

  const selected = options.find((o) => o.value === value)

  const updateRect = () => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setRect({ top: r.bottom + 6, left: r.left, width: r.width })
  }

  const openMenu = () => {
    if (disabled) return
    updateRect()
    setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)))
    setMounted(true)
    setOpen(true)
  }

  const closeMenu = () => {
    setOpen(false)
  }

  // Exit animation, then unmount.
  useGSAP(
    () => {
      const el = popoverRef.current
      if (!el) return
      if (open) {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.96, y: -4 },
          { opacity: 1, scale: 1, y: 0, duration: 0.16, ease: 'power2.out' },
        )
      } else if (mounted) {
        gsap.to(el, {
          opacity: 0,
          scale: 0.96,
          y: -4,
          duration: 0.12,
          ease: 'power2.in',
          onComplete: () => setMounted(false),
        })
      }
    },
    { dependencies: [open, mounted] },
  )

  useEffect(() => {
    if (!open) return
    const onScroll = () => updateRect()
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return
      closeMenu()
    }
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    document.addEventListener('mousedown', onDocClick)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
      document.removeEventListener('mousedown', onDocClick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const commit = (index: number) => {
    const opt = options[index]
    if (!opt) return
    onChange(opt.value)
    closeMenu()
    triggerRef.current?.focus()
  }

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      openMenu()
      return
    }
    if (open) handleListKeyDown(e)
  }

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(options.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      commit(activeIndex)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      closeMenu()
      triggerRef.current?.focus()
    } else if (e.key.length === 1 && /[a-z0-9]/i.test(e.key)) {
      window.clearTimeout(typeaheadTimer.current)
      typeaheadRef.current += e.key.toLowerCase()
      const idx = options.findIndex((o) => o.label.toLowerCase().startsWith(typeaheadRef.current))
      if (idx >= 0) setActiveIndex(idx)
      typeaheadTimer.current = window.setTimeout(() => {
        typeaheadRef.current = ''
      }, 500)
    }
  }

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {!hideLabel && (
        <label className="field-label flex items-center gap-1">
          {label}
          {required && <span className="text-gold" aria-hidden="true">*</span>}
        </label>
      )}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={hideLabel ? label : undefined}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-navy-deep/50 px-3 py-2 font-body text-sm text-white outline-none transition-all duration-200 hover:border-white/20 hover:bg-navy-deep/70 focus:border-gold focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-gold)_35%,transparent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:bg-navy-deep/50"
      >
        <span className={selected ? 'truncate text-white' : 'truncate text-white/25'}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          viewBox="0 0 16 16"
          className={`h-3.5 w-3.5 shrink-0 text-gold/80 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {mounted &&
        rect &&
        createPortal(
          <ul
            ref={popoverRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            style={{ position: 'fixed', top: rect.top, left: rect.left, width: Math.max(rect.width, 120) }}
            className="z-[200] max-h-64 overflow-y-auto rounded-lg border border-white/10 bg-navy-deep/95 p-1 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl"
            onKeyDown={handleListKeyDown}
          >
            {options.length === 0 && (
              <li className="px-3 py-2 font-body text-sm text-white/40">No options</li>
            )}
            {options.map((opt, i) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => commit(i)}
                className={[
                  'flex cursor-pointer items-center justify-between rounded-md px-3 py-1.5 font-body text-sm transition-colors duration-100',
                  i === activeIndex ? 'bg-gold/15 text-gold' : 'text-white/80',
                  opt.value === value ? 'font-semibold' : '',
                ].join(' ')}
              >
                {opt.label}
                {opt.value === value && (
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" aria-hidden="true">
                    <path d="M3 8.5 L6.2 11.5 L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  )
}
