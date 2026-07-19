import type { ResumeData } from '../../../store/resumeStore'
import type { WizardStepId } from '../../../store/builderUiStore'

export interface AtsWarning {
  id: string
  message: string
  step: WizardStepId
}

/**
 * Static facts guaranteed by the NorthStarClassic template itself —
 * always true, never computed from user data.
 */
export const STATIC_ATS_CHECKS = [
  'Single column layout',
  'Standard section headings',
  'No photos or graphics',
  'Plain text dates',
]

/**
 * Soft warnings computed from the current draft — things worth fixing
 * before sending the resume out, but not blockers. Each links back to
 * the step that can fix it.
 */
export function getAtsWarnings(data: ResumeData): AtsWarning[] {
  const warnings: AtsWarning[] = []
  const { contact, summary, experience, skills } = data

  if (!contact.fullName.trim() || !contact.email.trim() || !contact.phone.trim()) {
    warnings.push({
      id: 'contact',
      message: 'Add your name, email, and phone number.',
      step: 'contact',
    })
  }

  if (!summary.text.trim()) {
    warnings.push({
      id: 'summary',
      message: 'Write a short professional summary.',
      step: 'summary',
    })
  }

  const namedExperience = experience.filter((e) => e.jobTitle.trim() || e.company.trim())
  if (namedExperience.length === 0) {
    warnings.push({
      id: 'experience-empty',
      message: 'Add at least one work experience entry.',
      step: 'experience',
    })
  } else if (namedExperience.some((e) => e.bullets.filter((b) => b.trim()).length === 0)) {
    warnings.push({
      id: 'experience-bullets',
      message: 'Add achievement bullets to your experience entries.',
      step: 'experience',
    })
  }

  if (skills.every((g) => g.items.length === 0)) {
    warnings.push({
      id: 'skills',
      message: 'Add at least one skill.',
      step: 'skills',
    })
  }

  return warnings
}
