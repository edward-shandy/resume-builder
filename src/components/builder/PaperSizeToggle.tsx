import { useBuilderUiStore } from '../../store/builderUiStore'
import { PAPER_DIMENSIONS_IN, type PaperSizeId } from '../../templates/NorthStarClassic/paperSizes'

const OPTIONS: PaperSizeId[] = ['letter', 'a4']

/**
 * Small themed segmented control swapping the preview label — Letter
 * ↔ A4 — instead of a static caption. Drives paperSize in
 * builderUiStore, which the preview, print `@page` rule, and
 * page-break math all read from the same source.
 */
export function PaperSizeToggle() {
  const paperSize = useBuilderUiStore((s) => s.paperSize)
  const setPaperSize = useBuilderUiStore((s) => s.setPaperSize)

  return (
    <div
      role="radiogroup"
      aria-label="Paper size"
      className="flex items-center gap-0.5 rounded-full border border-white/10 bg-navy-deep/50 p-0.5"
    >
      {OPTIONS.map((size) => (
        <button
          key={size}
          type="button"
          role="radio"
          aria-checked={paperSize === size}
          onClick={() => setPaperSize(size)}
          className={[
            'label-readout rounded-full px-2.5 py-1 transition-colors duration-150',
            paperSize === size ? 'bg-teal text-ink' : 'text-white/40 hover:text-white/70',
          ].join(' ')}
        >
          {PAPER_DIMENSIONS_IN[size].cssSize === 'A4' ? 'A4' : 'Letter'}
        </button>
      ))}
    </div>
  )
}
