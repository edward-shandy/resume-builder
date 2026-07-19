interface RemoveButtonProps {
  onClick: () => void
  label?: string
  className?: string
}

/**
 * Small ghost remove action shared by the compact Extras entries
 * (certification / language / project cards) — trash icon + text,
 * red tint on hover with a slight scale for feedback. These entries
 * are small enough that a two-click confirm (like EntryCard's delete)
 * would be overkill; the hover state and icon make intent clear.
 */
export function RemoveButton({ onClick, label = 'Remove', className = '' }: RemoveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex cursor-pointer items-center gap-1.5 self-start rounded-md px-2 py-1 font-body text-xs font-medium text-white/40 transition-all duration-150 hover:scale-105 hover:bg-red-500/15 hover:text-red-300 ${className}`}
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" aria-hidden="true">
        <path
          d="M3.5 4.5 H12.5 M6 4.5 V3 a1 1 0 0 1 1 -1 h2 a1 1 0 0 1 1 1 v1.5 M4.5 4.5 L5 13 a1 1 0 0 0 1 1 h4 a1 1 0 0 0 1 -1 L11.5 4.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </button>
  )
}
