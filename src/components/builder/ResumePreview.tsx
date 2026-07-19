import { useEffect, useRef, useState } from 'react'
import { useResumeStore } from '../../store/resumeStore'
import { useBuilderUiStore } from '../../store/builderUiStore'
import { getTemplate } from '../../templates'
import {
  paperWidthPx,
  paperHeightPx,
  effectivePageHeightPx,
  PRINT_MARGIN_Y_PX,
} from '../../templates/NorthStarClassic/paperSizes'
import { useAutoScale } from '../../templates/NorthStarClassic/useAutoScale'
import { gsap, useGSAP } from '../../gsap/gsapConfig'

/**
 * Live ATS resume preview. The "paper" is always rendered at its true
 * pixel size (never resized fonts) and scaled down as a whole via
 * `transform: scale()` to fit whatever width the pane has — a real
 * sheet, just shrunk to fit, exactly like print preview.
 *
 * Content is allowed to grow past one page — real pagination only
 * happens at print time (the browser breaks pages naturally, honoring
 * `@page` margin + the `break-inside`/`break-after` rules in
 * globals.css). What this view adds on top is a purely visual,
 * non-printable guide: a dashed rule + "Page N" label at every page
 * boundary, computed from the SAME margin values print uses (see
 * paperSizes.ts) so the guide lines up with where pages actually cut.
 * It does not simulate break-avoidance (an entry print would push
 * whole onto the next page) — see ReviewStep / print CSS for that.
 */
export function ResumePreview() {
  const data = useResumeStore((s) => s.data)
  const paperSize = useBuilderUiStore((s) => s.paperSize)
  const templateId = useBuilderUiStore((s) => s.templateId)
  const containerRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)
  const paperWidth = paperWidthPx(paperSize)
  const paperHeight = paperHeightPx(paperSize)
  const scale = useAutoScale(containerRef, paperWidth)
  const [contentHeight, setContentHeight] = useState(paperHeight)
  const TemplatePaper = getTemplate(templateId).component

  // Crossfade the paper whenever the chosen template changes — a plain
  // swap would be a jarring cut since the layouts differ substantially.
  useGSAP(
    () => {
      const el = paperRef.current
      if (!el) return
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' })
    },
    { dependencies: [templateId] },
  )

  useEffect(() => {
    const el = paperRef.current
    if (!el) return
    const measure = () => setContentHeight(el.scrollHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [data, paperSize])

  // Content flow height excludes the top/bottom padding (= the print
  // margin) baked into the paper element itself.
  const contentFlowHeight = Math.max(0, contentHeight - 2 * PRINT_MARGIN_Y_PX)
  const effectivePageHeight = effectivePageHeightPx(paperSize)
  const pageCount = Math.max(1, Math.ceil(contentFlowHeight / effectivePageHeight))
  const pageBreaks = Array.from({ length: pageCount - 1 }, (_, i) => {
    // Measured from the top of the paper element (padding included) —
    // page 1's usable area starts right after the top margin, so break
    // n lands margin + (n+1) effective-page-heights down.
    return PRINT_MARGIN_Y_PX + (i + 1) * effectivePageHeight
  })

  return (
    <div ref={containerRef} className="flex w-full justify-center">
      <div
        className="relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]"
        style={{
          width: paperWidth * scale,
          height: Math.max(contentHeight, paperHeight) * scale,
        }}
      >
        <div
          ref={paperRef}
          className="resume-paper"
          style={{
            width: paperWidth,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <TemplatePaper data={data} paperSize={paperSize} frame="screen" />
        </div>

        {/* Page-break guides — screen only, never printed (the browser's
            own pagination takes over for the real thing). */}
        <div className="pointer-events-none absolute inset-0 print:hidden">
          {pageBreaks.map((y, i) => (
            <div key={y} className="absolute left-0 right-0" style={{ top: y * scale }}>
              <div className="border-t border-dashed border-red-400/50" />
              <span className="absolute right-1 top-1 rounded-sm bg-red-400/90 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-ink">
                Page {i + 2}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
