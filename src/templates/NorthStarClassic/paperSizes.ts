/**
 * Single source of truth for paper geometry — shared by the live
 * preview (screen px, scaled) and the real print output (inches, via
 * `@page`). Keeping both derived from the same inch values is what
 * makes the preview's page-break guide land where the browser will
 * actually cut the page.
 */
export type PaperSizeId = 'letter' | 'a4'

export const DPI = 96

export const PAPER_DIMENSIONS_IN: Record<PaperSizeId, { width: number; height: number; cssSize: string; label: string }> = {
  letter: { width: 8.5, height: 11, cssSize: 'letter', label: 'Letter · 8.5 × 11' },
  a4: { width: 8.27, height: 11.69, cssSize: 'A4', label: 'A4 · 210 × 297mm' },
}

// Matches the @page margin injected for print (globals.css / PrintablePaper).
// The preview paper's own padding is set to these same values (in px) so
// the on-screen layout and the printed layout land in the same place.
export const PRINT_MARGIN_X_IN = 0.6
export const PRINT_MARGIN_Y_IN = 0.55

export const PRINT_MARGIN_X_PX = PRINT_MARGIN_X_IN * DPI
export const PRINT_MARGIN_Y_PX = PRINT_MARGIN_Y_IN * DPI

export function paperWidthPx(size: PaperSizeId): number {
  return PAPER_DIMENSIONS_IN[size].width * DPI
}

export function paperHeightPx(size: PaperSizeId): number {
  return PAPER_DIMENSIONS_IN[size].height * DPI
}

/** Usable content height per printed page — page height minus the top+bottom @page margin, repeated on every page. */
export function effectivePageHeightPx(size: PaperSizeId): number {
  return paperHeightPx(size) - 2 * PRINT_MARGIN_Y_PX
}
