import { useRef, useState } from 'react'
import { gsap, useGSAP } from '../../gsap/gsapConfig'

interface SkillChipInputProps {
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  /** Curated ghost-chip suggestions; already-added ones are filtered out. */
  suggestions?: string[]
}

/**
 * Type-ahead chip input: Enter or comma commits the current text as a
 * pill, Backspace on an empty field pops the last chip. New chips pop
 * in with a quick GSAP scale — this is the part of the step that has
 * to feel fast, so the tween is short and unapologetic.
 */
export function SkillChipInput({
  items,
  onChange,
  placeholder = 'Playwright, TypeScript…',
  suggestions = [],
}: SkillChipInputProps) {
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const lastAddedRef = useRef<string | null>(null)

  const { contextSafe } = useGSAP({ scope: listRef })

  const lowerItems = items.map((i) => i.toLowerCase())
  const visibleSuggestions = suggestions.filter((s) => !lowerItems.includes(s.toLowerCase()))

  const commit = (raw: string) => {
    const value = raw.trim()
    if (!value) return
    if (items.some((i) => i.toLowerCase() === value.toLowerCase())) {
      setDraft('')
      return
    }
    lastAddedRef.current = value
    onChange([...items, value])
    setDraft('')
  }

  const removeAt = contextSafe((index: number) => {
    const chip = listRef.current?.children[index] as HTMLElement | undefined
    if (chip) {
      gsap.to(chip, {
        scale: 0.7,
        opacity: 0,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => onChange(items.filter((_, i) => i !== index)),
      })
    } else {
      onChange(items.filter((_, i) => i !== index))
    }
  })

  useGSAP(
    () => {
      if (!lastAddedRef.current || !listRef.current) return
      const chip = listRef.current.lastElementChild as HTMLElement | null
      lastAddedRef.current = null
      if (!chip) return
      gsap.fromTo(
        chip,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.32, ease: 'back.out(2.4)' },
      )
    },
    { scope: listRef, dependencies: [items.length] },
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit(draft)
      return
    }
    if (e.key === 'Backspace' && draft === '' && items.length > 0) {
      removeAt(items.length - 1)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={listRef}
        className="flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-navy-deep/50 px-2.5 py-2 transition-all duration-200 hover:border-white/20 hover:bg-navy-deep/70 focus-within:border-gold focus-within:shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-gold)_35%,transparent)]"
      >
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="group flex items-center gap-1 rounded-full border border-white/15 bg-white/10 py-1 pl-3 pr-1.5 font-body text-xs font-medium text-white backdrop-blur-sm"
          >
            {item}
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label={`Remove ${item}`}
              className="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/50 transition-all duration-150 hover:scale-110 hover:bg-red-500/70 hover:text-white"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => commit(draft)}
          placeholder={items.length === 0 ? placeholder : 'Add another…'}
          className="min-w-[8ch] flex-1 bg-transparent px-1 py-1 font-body text-sm text-white placeholder:text-white/25 outline-none"
        />
      </div>
      <span className="font-body text-xs text-white/35">Type a skill and press Enter or comma to add it.</span>

      {visibleSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => commit(s)}
              className="cursor-pointer rounded-full border border-dashed border-white/25 px-3 py-1 font-body text-xs text-white/50 transition-all duration-150 hover:scale-105 hover:border-gold/60 hover:bg-gold/10 hover:text-gold"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
