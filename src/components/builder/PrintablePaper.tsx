import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useResumeStore } from '../../store/resumeStore'
import { useBuilderUiStore } from '../../store/builderUiStore'
import { getTemplate } from '../../templates'
import { PAPER_DIMENSIONS_IN, PRINT_MARGIN_X_IN, PRINT_MARGIN_Y_IN } from '../../templates/NorthStarClassic/paperSizes'

const PRINT_STYLE_ID = 'northstar-dynamic-page-size'

/**
 * Print target for "Download PDF". Portals a full, unscaled copy of
 * the resume straight to document.body — a sibling of the app root,
 * not nested inside the h-screen/overflow-hidden wizard chrome. The
 * print stylesheet (globals.css) hides everything under <body> except
 * `.print-only-root` and shows this instead, so window.print() only
 * ever rasterizes the paper, never the wizard UI around it.
 *
 * `frame="print"` on the paper itself means zero element padding — the
 * margin comes entirely from the `@page` rule injected here, which is
 * kept in sync with the user's Letter/A4 choice. Element padding AND
 * @page margin together would double the whitespace on every page.
 *
 * Kept `display: none` at all times outside `@media print` so it never
 * affects normal layout or gets seen while editing.
 */
export function PrintablePaper() {
  const data = useResumeStore((s) => s.data)
  const paperSize = useBuilderUiStore((s) => s.paperSize)
  const templateId = useBuilderUiStore((s) => s.templateId)
  const TemplatePaper = getTemplate(templateId).component

  useEffect(() => {
    const cssSize = PAPER_DIMENSIONS_IN[paperSize].cssSize
    let styleEl = document.getElementById(PRINT_STYLE_ID) as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = PRINT_STYLE_ID
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = `@media print { @page { size: ${cssSize}; margin: ${PRINT_MARGIN_Y_IN}in ${PRINT_MARGIN_X_IN}in; } }`
  }, [paperSize])

  return createPortal(
    <div className="print-only-root" style={{ display: 'none' }}>
      <TemplatePaper data={data} paperSize={paperSize} frame="print" />
    </div>,
    document.body,
  )
}
