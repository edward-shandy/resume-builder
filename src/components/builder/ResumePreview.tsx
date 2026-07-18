import { useRef } from 'react'
import { useResumeStore } from '../../store/resumeStore'
import {
  NorthStarClassicPaper,
  PAPER_WIDTH,
  PAPER_HEIGHT,
} from '../../templates/NorthStarClassic/NorthStarClassicPaper'
import { useAutoScale } from '../../templates/NorthStarClassic/useAutoScale'

/**
 * Live ATS resume preview. The "paper" is always rendered at its true
 * pixel size (never resized fonts) and scaled down as a whole via
 * `transform: scale()` to fit whatever width the pane has — a real
 * Letter-ratio sheet, just shrunk to fit, exactly like print preview.
 */
export function ResumePreview() {
  const data = useResumeStore((s) => s.data)
  const containerRef = useRef<HTMLDivElement>(null)
  const scale = useAutoScale(containerRef, PAPER_WIDTH)

  return (
    <div ref={containerRef} className="flex w-full justify-center">
      <div
        className="relative overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]"
        style={{
          width: PAPER_WIDTH * scale,
          height: PAPER_HEIGHT * scale,
        }}
      >
        <div
          style={{
            width: PAPER_WIDTH,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <NorthStarClassicPaper data={data} />
        </div>
      </div>
    </div>
  )
}
