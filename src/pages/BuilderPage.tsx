import { useEffect, useRef } from 'react'
import { CanvasRoot } from '../scenes/3d/CanvasRoot'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useIsMobile } from '../hooks/useIsMobile'
import { gsap, useGSAP } from '../gsap/gsapConfig'
import { RouteTransition } from '../components/layout/RouteTransition'
import { BuilderHeader } from '../components/builder/BuilderHeader'
import { StepperNav } from '../components/builder/StepperNav'
import { ResumePreview } from '../components/builder/ResumePreview'
import { PrintablePaper } from '../components/builder/PrintablePaper'
import { PaperSizeToggle } from '../components/builder/PaperSizeToggle'
import { PanelFrame } from '../components/ui/PanelFrame'
import { useBuilderUiStore, WIZARD_STEPS } from '../store/builderUiStore'
import { useResumeStore } from '../store/resumeStore'
import { ContactStep } from './builder/steps/ContactStep'
import { SummaryStep } from './builder/steps/SummaryStep'
import { ExperienceStep } from './builder/steps/ExperienceStep'
import { EducationStep } from './builder/steps/EducationStep'
import { SkillsStep } from './builder/steps/SkillsStep'
import { ExtrasStep } from './builder/steps/ExtrasStep'
import { ReviewStep } from './builder/steps/ReviewStep'
import { PlaceholderStep } from './builder/steps/PlaceholderStep'

function StepContent() {
  const currentStep = useBuilderUiStore((s) => s.currentStep)

  if (currentStep === 'contact') return <ContactStep />
  if (currentStep === 'summary') return <SummaryStep />
  if (currentStep === 'experience') return <ExperienceStep />
  if (currentStep === 'education') return <EducationStep />
  if (currentStep === 'skills') return <SkillsStep />
  if (currentStep === 'extras') return <ExtrasStep />
  if (currentStep === 'review') return <ReviewStep />

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
  const isReview = currentStep === 'review'

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
    <div ref={rootRef} className="relative h-[100dvh] overflow-hidden">
      <CanvasRoot isMobile={isMobile} reducedMotion={reducedMotion} mode="builder" />
      <PrintablePaper />

      {/* h-full + overflow-hidden here, plus min-h-0 down the whole tree
          below, is what keeps every step at zero page-level scroll: the
          previous approach (`max-h-[calc(100vh-13rem)]` on just the
          preview pane) assumed a fixed header height and drifted off by
          ~74px whenever the actual chrome above it was taller. Locking
          the root to the viewport and letting flex distribute the real
          remaining space removes the guesswork — only the panels'
          own internal areas scroll, never the page. */}
      <RouteTransition className="relative z-10 flex h-full flex-col overflow-hidden">
        <BuilderHeader />

        {/* Mobile Edit/Preview tab switch */}
        <div className="flex shrink-0 justify-center gap-2 border-b border-white/10 bg-ink/60 px-4 py-3 md:hidden">
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
        <div className="mx-auto w-full max-w-[1400px] shrink-0 px-4 pt-5 sm:px-8">
          <PanelFrame className="builder-panel px-4 py-3.5 sm:px-6">
            <StepperNav />
          </PanelFrame>
        </div>

        <main
          className={[
            'mx-auto grid w-full min-h-0 max-w-[1400px] flex-1 items-stretch gap-6 px-4 py-5 sm:px-8 md:gap-8',
            // Review step gives the preview more room — it's the star of
            // this step, the left pane is just a checklist + 2 buttons.
            isReview ? 'md:grid-cols-[32fr_68fr]' : 'md:grid-cols-[42fr_58fr]',
          ].join(' ')}
        >
          {/* Form pane */}
          <section
            className={[
              'builder-panel flex min-h-0 min-w-0 flex-col',
              mobileView === 'edit' ? 'flex' : 'hidden md:flex',
            ].join(' ')}
          >
            <PanelFrame className="flex h-fit max-h-full min-h-0 flex-col px-5 py-5 sm:px-7 sm:py-6">
              {!hasHydrated ? (
                <div className="flex h-64 items-center justify-center">
                  <span className="label-readout text-white/40">Loading your draft…</span>
                </div>
              ) : (
                /* No overflow/scroll handling at this level — each step
                   owns its own internal scroll area for fields and keeps
                   its nav row outside of it (shrink-0, un-clipped) so
                   button glows never get cut by an overflow:auto edge. */
                <div ref={stepContentRef} className="flex min-h-0 flex-col">
                  <StepContent />
                </div>
              )}
            </PanelFrame>
          </section>

          {/* Preview pane */}
          <section
            className={[
              'builder-panel flex min-h-0 min-w-0 flex-col',
              mobileView === 'preview' ? 'flex' : 'hidden md:flex',
            ].join(' ')}
          >
            <PanelFrame className="flex min-h-0 flex-1 min-w-0 flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6">
              <div className="flex shrink-0 items-center justify-between">
                <span className="label-readout text-teal" style={{ letterSpacing: '0.21em' }}>
                  Live ATS Preview
                </span>
                <PaperSizeToggle />
              </div>
              <div className="min-h-0 min-w-0 flex-1 overflow-auto rounded-lg bg-black/20 p-4">
                <ResumePreview />
              </div>
            </PanelFrame>
          </section>
        </main>
      </RouteTransition>
    </div>
  )
}

export default BuilderPage
