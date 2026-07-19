import type { ResumeData } from '../store/resumeStore'

/**
 * Shared "what actually has content" filtering, used by every ATS
 * template so a freshly-added-but-empty card (experience, education,
 * skill group, etc.) never renders as a blank section on the page —
 * and so a section with zero real entries is never rendered into the
 * DOM at all (not just hidden via CSS).
 */
export function visibleSections(data: ResumeData) {
  const { contact, summary, experience, education, skills, extras } = data

  const visibleExperience = experience.filter((e) => e.jobTitle.trim() || e.company.trim())
  const visibleEducation = education.filter((e) => e.degree.trim() || e.institution.trim())
  const visibleSkillGroups = skills.filter((g) => g.items.length > 0)
  const visibleCertifications = extras.certifications.items.filter((c) => c.name.trim())
  const visibleLanguages = extras.languages.items.filter((l) => l.name.trim())
  const visibleProjects = extras.projects.items.filter((p) => p.name.trim())

  const contactLine = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedinUrl,
    contact.portfolioUrl,
  ]
    .filter((v) => v && v.trim().length > 0)
    .join('   ·   ')

  const hasName = contact.fullName.trim().length > 0
  const hasSummary = summary.text.trim().length > 0
  const hasCertifications = extras.certifications.enabled && visibleCertifications.length > 0
  const hasLanguages = extras.languages.enabled && visibleLanguages.length > 0
  const hasProjects = extras.projects.enabled && visibleProjects.length > 0

  return {
    contact,
    summary,
    contactLine,
    hasName,
    hasSummary,
    visibleExperience,
    visibleEducation,
    visibleSkillGroups,
    visibleCertifications,
    visibleLanguages,
    visibleProjects,
    hasCertifications,
    hasLanguages,
    hasProjects,
  }
}
