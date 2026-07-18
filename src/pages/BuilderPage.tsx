import { useEffect, useRef } from 'react'
import { CanvasRoot } from '../scenes/3d/CanvasRoot'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useIsMobile } from '../hooks/useIsMobile'
import { gsap, useGSAP } from '../gsap/gsapConfig'
import { BuilderHeader } from '../components/builder/BuilderHeader'
import { StepperNav } from '../components/builder/StepperNav'
import { ResumePreview } from '../components/builder/ResumePreview'
import { PanelFrame } from '../components/ui/PanelFrame'
import { useBuilderUiStore, WIZARD_STEPS } from '../store/builderUiStore'
import { useResumeStore } from '../store/resumeStore'
import { ContactStep } from './builder/steps/ContactStep'
import { SummaryStep } from './builder/steps/SummaryStep'
import { ExperienceStep } from './builder/steps/ExperienceStep'
import { EducationStep } from './builder/steps/EducationStep'
import { PlaceholderStep } from './builder/steps/PlaceholderStep'

function StepContent() {
  const currentStep = useBuilderUiStore((s) => s.currentStep)

  if (currentStep === 'contact') return <ContactStep />
  if (currentStep === 'summary') return <SummaryStep />
  if (currentStep === 'experience') return <ExperienceStep />
  if (currentStep === 'education') return <EducationStep />

  const label = WIZARD_STEPS.find((s) => s.id === currentStep)?.label ?? currentStep
  return <PlaceholderStep label={label} />
}

function BuilderPage() {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const mobileView = useBuilderUiStore((s) => s.mobileView)
  const setMobileView = useBuilderUiStore((s) => s.setMobileView)
  const currentStep = useBuilderUiStore((s) => s.currentStep)
  const hasHydrated = useResumeStore((s) => s.hasHydrated)

  const rootRef = useRef<HTMLDivElement>(null)
  const stepContentRef = useRef<HTMLDivElement>(null)

  // Entrance: form panel and preview panel fade/stagger up together.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.builder-panel', {
          opacity: 0,
          y: 24,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          delay: 0.1,
        })
      })
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.from('.builder-panel', { opacity: 0, duration: 0.4 })
      })
    },
    { scope: rootRef },
  )

  // Step transitions: fade + slide out/in whenever currentStep changes.
  const firstStepRender = useRef(true)
  useGSAP(
    () => {
      if (firstStepRender.current) {
        firstStepRender.current = false
        return
      }
      if (!stepContentRef.current) return
      gsap.fromTo(
        stepContentRef.current,
        { opacity: 0, x: reducedMotion ? 0 : 16 },
        { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' },
      )
    },
    { scope: rootRef, dependencies: [currentStep] },
  )

  // Keep the tab title stable across step changes for a11y announce.
  useEffect(() => {
    document.title = 'Resume Builder — NorthStar'
  }, [])

  return (
    <div ref={rootRef} className="relative min-h-screen">
      <CanvasRoot isMobile={isMobile} reducedMotion={reducedMotion} mode="builder" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <BuilderHeader />

        {/* Mobile Edit/Preview tab switch */}
        <div className="flex justify-center gap-2 border-b border-white/10 bg-ink/60 px-4 py-3 md:hidden">
          {(['edit', 'preview'] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setMobileView(view)}
              className={[
                'label-readout rounded-full px-4 py-1.5 transition-colors',
                mobileView === view ? 'bg-gold text-ink' : 'text-white/50 hover:text-white/80',
              ].join(' ')}
            >
              {view === 'edit' ? 'Edit' : 'Preview'}
            </button>
          ))}
        </div>

        {/* Stepper bar — full-width, compact, sits above both columns so
            the form and preview panels below start at the exact same
            top edge. */}
        <div className="mx-auto w-full max-w-[1400px] px-4 pt-5 sm:px-8">
          <PanelFrame className="builder-panel px-4 py-3.5 sm:px-6">
            <StepperNav />
          </PanelFrame>
        </div>

        <main className="mx-auto grid w-full max-w-[1400px] flex-1 items-start gap-6 px-4 py-5 sm:px-8 md:grid-cols-[42fr_58fr] md:gap-8">
          {/* Form pane */}
          <section
            className={[
              'builder-panel min-w-0',
              mobileView === 'edit' ? 'block' : 'hidden md:block',
            ].join(' ')}
          >
            <PanelFrame className="px-5 py-5 sm:px-7 sm:py-6">
              {!hasHydrated ? (
                <div className="flex h-64 items-center justify-center">
                  <span className="label-readout text-white/40">Loading your draft…</span>
                </div>
              ) : (
                <div ref={stepContentRef}>
                  <StepContent />
                </div>
              )}
            </PanelFrame>
          </section>

          {/* Preview pane */}
          <section
            className={[
              'builder-panel min-w-0 md:sticky md:top-5',
              mobileView === 'preview' ? 'block' : 'hidden md:block',
            ].join(' ')}
          >
            <PanelFrame className="flex min-w-0 flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6">
              <div className="flex items-center justify-between">
                <span className="label-readout text-teal">Live ATS Preview</span>
                <span className="label-readout text-white/30">Letter · 8.5 × 11</span>
              </div>
              <div className="min-w-0 max-h-[calc(100vh-13rem)] overflow-auto rounded-lg bg-black/20 p-4">
                <ResumePreview />
              </div>
            </PanelFrame>
          </section>
        </main>
      </div>
    </div>
  )
}

export default BuilderPage
