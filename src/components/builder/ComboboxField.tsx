import { useEffect, useRef, useState, useId } from 'react'
import { createPortal } from 'react-dom'
import { gsap, useGSAP } from '../../gsap/gsapConfig'

interface ComboboxFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  wrapperClassName?: string
}

/**
 * Themed autocomplete: a text input the user can type freely into
 * (the value is never constrained to the option list — this replaces
 * the old <input list="…"> datalist pattern, whose popup was
 * unstyled OS chrome) plus a filtered, keyboard-navigable custom
 * listbox for the common case of picking from the curated list.
 */
export function ComboboxField({
  label,
  value,
  onChange,
  options,
  placeholder,
  wrapperClassName = '',
}: ComboboxFieldProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null)
  // Separate from `value` on purpose: opening the popover with an
  // existing value (e.g. re-opening "English") should show the full
  // ~30-language list, not just the one entry that matches the current
  // text. Filtering only kicks in once the user actually types.
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLUListElement>(null)
  const listboxId = useId()

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()))
    : options

  const updateRect = () => {
    const el = inputRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setRect({ top: r.bottom + 6, left: r.left, width: r.width })
  }

  const openMenu = () => {
    updateRect()
    setActiveIndex(-1)
    setQuery('')
    setMounted(true)
    setOpen(true)
  }
  const closeMenu = () => setOpen(false)

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
      if (inputRef.current?.contains(target) || popoverRef.current?.contains(target)) return
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
    const opt = filtered[index]
    if (!opt) return
    onChange(opt)
    closeMenu()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) openMenu()
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      if (open && activeIndex >= 0) {
        e.preventDefault()
        commit(activeIndex)
      } else {
        closeMenu()
      }
    } else if (e.key === 'Escape') {
      closeMenu()
    }
  }

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      <label className="field-label flex items-center gap-1">{label}</label>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setQuery(e.target.value)
          if (!open) {
            updateRect()
            setActiveIndex(-1)
            setMounted(true)
            setOpen(true)
          } else {
            updateRect()
          }
        }}
        onFocus={openMenu}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        autoComplete="off"
        className="rounded-lg border border-white/10 bg-navy-deep/50 px-4 py-2 font-body text-sm text-white placeholder:text-white/25 outline-none transition-all duration-200 hover:border-white/20 hover:bg-navy-deep/70 focus:border-gold focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-gold)_35%,transparent)]"
      />

      {mounted &&
        rect &&
        filtered.length > 0 &&
        createPortal(
          <ul
            ref={popoverRef}
            id={listboxId}
            role="listbox"
            style={{ position: 'fixed', top: rect.top, left: rect.left, width: Math.max(rect.width, 160) }}
            className="z-[200] max-h-[280px] scroll-smooth overflow-y-auto rounded-lg border border-white/10 bg-navy-deep/95 p-1 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl"
          >
            {filtered.map((opt, i) => (
              <li
                key={opt}
                role="option"
                aria-selected={opt === value}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(i)}
                className={[
                  'cursor-pointer rounded-md px-3 py-1.5 font-body text-sm transition-colors duration-100',
                  i === activeIndex ? 'bg-gold/15 text-gold' : 'text-white/80',
                ].join(' ')}
              >
                {opt}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  )
}
