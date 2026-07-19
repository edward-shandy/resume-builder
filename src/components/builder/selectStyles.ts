import type { CSSProperties } from 'react'

/**
 * Shared visual language for every native <select> in the wizard:
 * appearance-none plus a hand-drawn chevron background so the arrow
 * never collides with the native OS affordance (the "chevron mentok
 * kanan" bug) and every select — DateSelect, Proficiency, anything
 * future — looks identical.
 */
const CHEVRON_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23ffd98e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E"

export const selectFieldClass =
  `appearance-none rounded-lg border border-white/10 bg-navy-deep/50 bg-no-repeat bg-[length:14px] px-3 py-2 pr-8 font-body text-sm text-white outline-none transition-all duration-200 focus:border-gold/60 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-gold)_22%,transparent)] disabled:opacity-40 disabled:cursor-not-allowed [background-position:right_0.65rem_center]`

export const selectFieldStyle: CSSProperties = {
  backgroundImage: `url("${CHEVRON_SVG}")`,
}
