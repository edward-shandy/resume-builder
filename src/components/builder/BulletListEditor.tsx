interface BulletListEditorProps {
  bullets: string[]
  onChange: (bullets: string[]) => void
}

/**
 * One glass input per bullet, each with its own remove (×), plus a
 * single "+ Add bullet" row at the bottom — cleaner UX than a raw
 * one-bullet-per-line textarea (no ambiguity about blank lines, easy
 * to reorder-by-delete-and-retype for a short list like this).
 */
export function BulletListEditor({ bullets, onChange }: BulletListEditorProps) {
  const update = (index: number, value: string) => {
    const next = bullets.slice()
    next[index] = value
    onChange(next)
  }

  const remove = (index: number) => {
    onChange(bullets.filter((_, i) => i !== index))
  }

  const add = () => {
    onChange([...bullets, ''])
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="label-readout flex items-center gap-1 text-white/60">Achievements</label>
      <div className="flex flex-col gap-1.5">
        {bullets.map((bullet, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="shrink-0 text-white/25">•</span>
            <input
              value={bullet}
              onChange={(e) => update(i, e.target.value)}
              placeholder="Cut regression testing time by 60% by building an automated Playwright suite"
              className="flex-1 rounded-lg border border-white/10 bg-navy-deep/50 px-3 py-1.5 font-body text-sm text-white placeholder:text-white/25 outline-none transition-all duration-200 focus:border-gold/60 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-gold)_22%,transparent)]"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove bullet"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/10 hover:text-white"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="label-readout self-start rounded-md px-2 py-1 text-teal/80 transition-colors hover:bg-teal/10 hover:text-teal"
      >
        + Add bullet
      </button>
      <span className="font-body text-xs text-white/35">
        Start with an action verb, include numbers where you can.
      </span>
    </div>
  )
}
