import { useRef } from 'react'
import { gsap, useGSAP } from '../../gsap/gsapConfig'
import { WIZARD_STEPS, useBuilderUiStore, type WizardStepId } from '../../store/builderUiStore'
import { useResumeStore } from '../../store/resumeStore'
import { getAtsWarnings } from '../../pages/builder/steps/atsChecklist'

const STEP_COUNT = WIZARD_STEPS.length
// Each <li> is an equal 1/N flex slice with its dot centered inside it,
// so dot centers sit at (i + 0.5)/N of the row width. The track/fill
// span exactly from the first dot's center to the last dot's center
// (not the row edges), so progress math lines up with dot positions.
const EDGE_PERCENT = 50 / STEP_COUNT

/**
 * Compact HORIZONTAL 7-step wizard bar — one row, ~68px tall, not a
 * tall half-empty panel. The active step must read unmistakably: a
 * gold ring with a soft breathing pulse. The connecting line uses the
 * same visual language as the landing page's ScrollProgressBar — a
 * thin translucent track with a violet→gold→teal gradient fill that
 * scales in from the left, always growing (or shrinking) to land
 * exactly on the active step's dot. Completed steps get a solid,
 * fully opaque checkmark dot — nothing shows through it. Every step
 * is independently clickable (non-linear navigation — nothing here
 * is gated).
 */
export function StepperNav() {
  const currentStep = useBuilderUiStore((s) => s.currentStep)
  const completedSteps = useBuilderUiStore((s) => s.completedSteps)
  const goToStep = useBuilderUiStore((s) => s.goToStep)
  const contact = useResumeStore((s) => s.data.contact)
  const summary = useResumeStore((s) => s.data.summary)
  const experience = useResumeStore((s) => s.data.experience)
  const education = useResumeStore((s) => s.data.education)
  const skills = useResumeStore((s) => s.data.skills)
  const extras = useResumeStore((s) => s.data.extras)
  const resumeData = useResumeStore((s) => s.data)

  const rootRef = useRef<HTMLDivElement>(null)
  const lineFillRef = useRef<HTMLDivElement>(null)
  const activeDotRef = useRef<HTMLSpanElement>(null)

  const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep)
  const progressFraction = currentIndex / (STEP_COUNT - 1)

  // Contact/Summary completion reflects live data (checkmark appears the
  // moment required fields are filled, not only after clicking Next);
  // steps without a live-computable state fall back to visited history.
  const isStepDataComplete = (id: WizardStepId): boolean => {
    if (id === 'contact') {
      return Boolean(contact.fullName.trim() && contact.email.trim() && contact.phone.trim())
    }
    if (id === 'summary') {
      return Boolean(summary.text.trim())
    }
    if (id === 'experience') {
      return experience.some((e) => e.jobTitle.trim() && e.company.trim() && e.startDate.trim())
    }
    if (id === 'education') {
      return education.some((e) => e.degree.trim() && e.institution.trim())
    }
    if (id === 'skills') {
      return skills.some((g) => g.items.length > 0)
    }
    if (id === 'extras') {
      return (
        (extras.certifications.enabled && extras.certifications.items.some((c) => c.name.trim())) ||
        (extras.languages.enabled && extras.languages.items.some((l) => l.name.trim())) ||
        (extras.projects.enabled && extras.projects.items.some((p) => p.name.trim()))
      )
    }
    if (id === 'review') {
      return getAtsWarnings(resumeData).length === 0
    }
    return completedSteps.has(id)
  }

  useGSAP(
    () => {
      gsap.to(lineFillRef.current, {
        scaleX: progressFraction,
        duration: 0.65,
        ease: 'power2.inOut',
        overwrite: 'auto',
      })
    },
    { scope: rootRef, dependencies: [currentStep] },
  )

  useGSAP(
    () => {
      if (!activeDotRef.current) return
      const tween = gsap.fromTo(
        activeDotRef.current,
        { scale: 1, opacity: 0.55 },
        {
          scale: 1.8,
          opacity: 0,
          duration: 1.6,
          repeat: -1,
          ease: 'sine.out',
        },
      )
      return () => {
        tween.kill()
      }
    },
    { scope: rootRef, dependencies: [currentStep] },
  )

  return (
    <nav ref={rootRef} aria-label="Resume builder steps" className="relative">
      <ol className="relative flex items-start justify-between">
        {/* Track + gradient fill, running behind the dots — same visual
            language as the landing ScrollProgressBar (thin translucent
            track, violet→gold→teal fill, scaleX from the left). */}
        <div
          className="absolute top-4 h-[3px] -translate-y-1/2 bg-white/5"
          style={{ left: `${EDGE_PERCENT}%`, right: `${EDGE_PERCENT}%` }}
          aria-hidden="true"
        />
        <div
          ref={lineFillRef}
          className="absolute top-4 h-[3px] origin-left -translate-y-1/2 bg-gradient-to-r from-violet via-gold to-teal will-change-transform"
          style={{ left: `${EDGE_PERCENT}%`, right: `${EDGE_PERCENT}%`, transform: 'scaleX(0)' }}
          aria-hidden="true"
        />

        {WIZARD_STEPS.map((step, index) => {
          const isActive = step.id === currentStep
          const isComplete = isStepDataComplete(step.id) && !isActive

          return (
            <li key={step.id} className="relative z-10 flex-1">
              <button
                type="button"
                onClick={() => goToStep(step.id)}
                aria-current={isActive ? 'step' : undefined}
                className="group flex w-full flex-col items-center gap-1.5 rounded-lg px-1 py-1 text-center transition-colors hover:bg-white/5"
              >
                <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                  {isActive && (
                    <span
                      ref={activeDotRef}
                      className="pointer-events-none absolute inset-0 rounded-full bg-gold"
                      aria-hidden="true"
                    />
                  )}
                  {/* Solid, fully opaque backing — the connecting line must
                      never show through a dot, complete or otherwise. */}
                  <span
                    className={[
                      'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold transition-all duration-300',
                      isActive
                        ? 'border-gold bg-gold text-ink'
                        : isComplete
                          ? 'border-teal bg-teal text-ink'
                          : 'border-white/20 bg-ink-soft text-white/50 group-hover:border-white/40',
                    ].join(' ')}
                  >
                    {isComplete ? (
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                        <path
                          d="M3 8.5 L6.2 11.5 L13 4.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </span>
                </span>

                <span
                  className={[
                    'hidden font-body text-[11px] leading-tight transition-colors sm:block',
                    isActive ? 'font-semibold text-white' : 'text-white/50 group-hover:text-white/80',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export type { WizardStepId }
