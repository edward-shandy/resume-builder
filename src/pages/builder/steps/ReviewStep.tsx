import { useRef, useState } from 'react'
import { useResumeStore } from '../../../store/resumeStore'
import { useBuilderUiStore } from '../../../store/builderUiStore'
import { Button } from '../../../components/ui/Button'
import { getAtsWarnings, STATIC_ATS_CHECKS } from './atsChecklist'
import { TEMPLATES, type TemplateId } from '../../../templates'

/**
 * Step 7 — Review. The wizard's last stop: an ATS compliance summary
 * (what the template already guarantees, plus soft warnings computed
 * from the current draft), a print-to-PDF action, and a two-click
 * "Start Over" that wipes the draft.
 */
export function ReviewStep() {
  const data = useResumeStore((s) => s.data)
  const resetResume = useResumeStore((s) => s.resetResume)
  const goToStep = useBuilderUiStore((s) => s.goToStep)
  const prevStep = useBuilderUiStore((s) => s.prevStep)
  const templateId = useBuilderUiStore((s) => s.templateId)
  const setTemplateId = useBuilderUiStore((s) => s.setTemplateId)

  const warnings = getAtsWarnings(data)

  const [confirmingReset, setConfirmingReset] = useState(false)
  const disarmTimer = useRef<number | undefined>(undefined)

  const handleStartOver = () => {
    if (!confirmingReset) {
      setConfirmingReset(true)
      disarmTimer.current = window.setTimeout(() => setConfirmingReset(false), 3000)
      return
    }
    window.clearTimeout(disarmTimer.current)
    resetResume()
    goToStep('contact')
  }

  const handleDownload = () => {
    window.print()
  }

  return (
    <div className="flex max-h-full min-h-0 flex-col gap-4">
      <div className="-mx-4 flex min-h-0 flex-col gap-4 overflow-y-auto px-4">
      <div>
        <h3 className="font-display text-xl font-medium text-white">Review</h3>
        <p className="mt-1 font-body text-sm text-slate">
          A last check before you send it out — then print straight to PDF.
        </p>
      </div>

      <div className="flex max-h-[min(56vh,520px)] flex-col gap-4 overflow-y-auto pb-2 pr-1">
        <div className="rounded-xl border border-white/10 bg-navy-deep/40 p-4">
          <span className="label-readout text-teal">Template</span>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {TEMPLATES.map((t) => {
              const selected = t.id === templateId
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setTemplateId(t.id as TemplateId)}
                  className={[
                    'group flex flex-col gap-1 rounded-lg border p-2.5 text-left transition-all duration-200 ease-out',
                    'hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)]',
                    selected
                      ? 'border-gold/70 bg-gold/10 shadow-[0_0_0_1px_rgba(232,196,115,0.35)]'
                      : 'border-white/10 bg-navy-deep/50 hover:border-white/25',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'text-xs font-semibold transition-colors duration-200',
                      selected ? 'text-gold' : 'text-white/85 group-hover:text-white',
                    ].join(' ')}
                  >
                    {t.name}
                  </span>
                  <span className="text-[10.5px] leading-snug text-white/45">{t.description}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-navy-deep/40 p-4">
          <span className="label-readout text-teal">ATS Compliance</span>
          <ul className="mt-3 flex flex-col gap-2">
            {STATIC_ATS_CHECKS.map((check) => (
              <li key={check} className="flex items-center gap-2 font-body text-sm text-white/80">
                <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-teal" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M4.8 8.2 L6.8 10.2 L11.2 5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {check}
              </li>
            ))}
          </ul>
        </div>

        {warnings.length > 0 ? (
          <div className="rounded-xl border border-gold/25 bg-gold/5 p-4">
            <span className="label-readout text-gold">Worth a look</span>
            <ul className="mt-3 flex flex-col gap-2.5">
              {warnings.map((w) => (
                <li key={w.id} className="flex items-start justify-between gap-3 font-body text-sm text-white/80">
                  <span className="flex items-start gap-2">
                    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-gold" fill="none" aria-hidden="true">
                      <path
                        d="M8 1.5 L15 14 H1 Z"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinejoin="round"
                      />
                      <path d="M8 6.5 V9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      <circle cx="8" cy="11.8" r="0.9" fill="currentColor" />
                    </svg>
                    {w.message}
                  </span>
                  <button
                    type="button"
                    onClick={() => goToStep(w.step)}
                    className="label-readout shrink-0 cursor-pointer text-gold/90 transition-all duration-150 hover:translate-x-0.5 hover:text-gold"
                  >
                    Fix →
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-teal/25 bg-teal/5 p-4 font-body text-sm text-teal">
            <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
              <path d="M4.8 8.2 L6.8 10.2 L11.2 5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Looking good — nothing outstanding.
          </div>
        )}
      </div>
      </div>

      <div className="mt-2 flex shrink-0 flex-col gap-2.5">
        <Button variant="primary" size="sm" onClick={handleDownload} className="w-full">
          Download PDF
        </Button>
        <button
          type="button"
          onClick={handleStartOver}
          className={[
            'label-readout w-full cursor-pointer rounded-full border px-5 py-2.5 text-center transition-all duration-200',
            confirmingReset
              ? 'animate-pulse border-red-400/60 bg-red-500/20 text-red-200 hover:bg-red-500/30'
              : 'border-white/20 bg-transparent text-white/50 hover:border-red-400/40 hover:text-red-300',
          ].join(' ')}
        >
          {confirmingReset ? 'Confirm — erase everything?' : 'Start Over'}
        </button>
        <div className="flex items-center justify-between gap-3 pt-1">
          <Button variant="secondary" size="sm" onClick={() => prevStep()}>
            Back
          </Button>
          <div />
        </div>
      </div>
    </div>
  )
}
