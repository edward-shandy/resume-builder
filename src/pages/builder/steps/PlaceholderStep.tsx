interface PlaceholderStepProps {
  label: string
}

/**
 * Steps 2-7 aren't built yet this iteration. Themed stand-in so the
 * wizard reads as "coming soon", not broken.
 */
export function PlaceholderStep({ label }: PlaceholderStepProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <svg viewBox="0 0 24 24" className="h-8 w-8 text-gold/50" fill="currentColor" aria-hidden="true">
        <path d="M12 2 L13.8 9.5 L21 12 L13.8 14.5 L12 22 L10.2 14.5 L3 12 L10.2 9.5 Z" />
      </svg>
      <span className="label-readout text-gold/70">Section incoming // Next iteration</span>
      <p className="max-w-xs font-body text-sm text-white/40">
        The {label} step is charted but not yet built. Contact is fully live — the rest of the
        constellation follows next.
      </p>
    </div>
  )
}
