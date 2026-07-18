import { useResumeStore } from '../../../store/resumeStore'
import { useBuilderUiStore } from '../../../store/builderUiStore'
import { Button } from '../../../components/ui/Button'

const RECOMMENDED_MIN = 300
const RECOMMENDED_MAX = 500

const EXAMPLE_PLACEHOLDER =
  'QA Automation Engineer with 5+ years testing web and mobile platforms. Built a Playwright suite that cut regression time by 60% and caught production-bound bugs before every release. Known for pairing sharp attention to detail with clear, fast bug reports that keep releases moving.'

/**
 * Step 2 — Summary. Optional: Next is always enabled here. A soft
 * character counter nudges toward a 300-500 char sweet spot without
 * blocking anyone who writes shorter or longer.
 */
export function SummaryStep() {
  const text = useResumeStore((s) => s.data.summary.text)
  const updateSummary = useResumeStore((s) => s.updateSummary)
  const nextStep = useBuilderUiStore((s) => s.nextStep)
  const prevStep = useBuilderUiStore((s) => s.prevStep)

  const length = text.length
  const tooLong = length > RECOMMENDED_MAX
  const tooShort = length > 0 && length < RECOMMENDED_MIN

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-xl font-medium text-white">Summary</h3>
        <p className="mt-1 font-body text-sm text-slate">
          Two to three sentences that open your resume. Optional, but recruiters read this first.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="summary-text" className="label-readout flex items-center gap-1 text-white/60">
          Professional Summary
        </label>
        <textarea
          id="summary-text"
          value={text}
          onChange={(e) => updateSummary(e.target.value)}
          placeholder={EXAMPLE_PLACEHOLDER}
          rows={7}
          className="resize-none rounded-lg border border-white/10 bg-navy-deep/50 px-4 py-3 font-body text-sm leading-relaxed text-white placeholder:text-white/25 outline-none transition-all duration-200 focus:border-gold/60 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-gold)_22%,transparent)]"
        />
        <div className="flex items-center justify-between">
          <span className="font-body text-xs text-white/35">
            2-3 sentences. Mention your role, years of experience, and top achievement.
          </span>
          <span
            className={[
              'label-readout shrink-0',
              tooLong ? 'text-gold' : tooShort ? 'text-white/40' : 'text-teal/80',
            ].join(' ')}
          >
            {length} / {RECOMMENDED_MIN}–{RECOMMENDED_MAX}
          </span>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between gap-3">
        <Button variant="secondary" size="sm" onClick={() => prevStep()}>
          Back
        </Button>
        <Button variant="primary" size="sm" onClick={() => nextStep()}>
          Next: Experience
        </Button>
      </div>
    </div>
  )
}
