import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PaperSizeId } from '../templates/NorthStarClassic/paperSizes'

export type WizardStepId =
  | 'contact'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'extras'
  | 'review'

export const WIZARD_STEPS: { id: WizardStepId; label: string }[] = [
  { id: 'contact', label: 'Contact' },
  { id: 'summary', label: 'Summary' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'extras', label: 'Extras' },
  { id: 'review', label: 'Review' },
]

interface BuilderUiStore {
  currentStep: WizardStepId
  /** Steps the user has already visited/completed — drives the checkmark. */
  completedSteps: Set<WizardStepId>
  mobileView: 'edit' | 'preview'
  paperSize: PaperSizeId
  goToStep: (step: WizardStepId) => void
  nextStep: () => void
  prevStep: () => void
  markComplete: (step: WizardStepId) => void
  setMobileView: (view: 'edit' | 'preview') => void
  setPaperSize: (size: PaperSizeId) => void
}

export const useBuilderUiStore = create<BuilderUiStore>()(
  persist(
    (set, get) => ({
  currentStep: 'contact',
  completedSteps: new Set(),
  mobileView: 'edit',
  paperSize: 'letter',

  goToStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep, completedSteps } = get()
    const idx = WIZARD_STEPS.findIndex((s) => s.id === currentStep)
    const next = WIZARD_STEPS[Math.min(idx + 1, WIZARD_STEPS.length - 1)]
    const updated = new Set(completedSteps)
    updated.add(currentStep)
    set({ currentStep: next.id, completedSteps: updated })
  },

  prevStep: () => {
    const idx = WIZARD_STEPS.findIndex((s) => s.id === get().currentStep)
    const prev = WIZARD_STEPS[Math.max(idx - 1, 0)]
    set({ currentStep: prev.id })
  },

  markComplete: (step) =>
    set((s) => {
      const updated = new Set(s.completedSteps)
      updated.add(step)
      return { completedSteps: updated }
    }),

  setMobileView: (view) => set({ mobileView: view }),
  setPaperSize: (size) => set({ paperSize: size }),
    }),
    {
      name: 'northstar-builder-ui',
      // Only the paper size preference is worth remembering across visits —
      // step position/completion should always start fresh.
      partialize: (s) => ({ paperSize: s.paperSize }),
    },
  ),
)
