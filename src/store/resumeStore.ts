import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ContactInfo {
  fullName: string
  jobTitle: string
  email: string
  phone: string
  location: string
  linkedinUrl?: string
  portfolioUrl?: string
}

export interface SummaryData {
  text: string
}

export interface WorkExperienceEntry {
  id: string
  jobTitle: string
  company: string
  location: string
  startDate: string // MM/YYYY
  endDate: string // MM/YYYY, ignored if isCurrent
  isCurrent: boolean
  bullets: string[]
}

export interface EducationEntry {
  id: string
  degree: string
  institution: string
  location: string
  startDate: string
  endDate: string // ignored if isCurrent
  isCurrent: boolean
  gpa?: string
  honors?: string
  bullets: string[]
}

export interface SkillGroup {
  id: string
  label: string
  items: string[]
}

export interface CertificationItem {
  id: string
  name: string
  issuer: string
  date: string
  url?: string
}

export interface LanguageItem {
  id: string
  name: string
  proficiency: string
}

export interface ProjectItem {
  id: string
  name: string
  description: string
  url?: string
}

export interface ExtrasData {
  certifications: { enabled: boolean; items: CertificationItem[] }
  languages: { enabled: boolean; items: LanguageItem[] }
  projects: { enabled: boolean; items: ProjectItem[] }
}

export interface ResumeData {
  contact: ContactInfo
  summary: SummaryData
  experience: WorkExperienceEntry[]
  education: EducationEntry[]
  skills: SkillGroup[]
  extras: ExtrasData
}

const emptyContact: ContactInfo = {
  fullName: '',
  jobTitle: '',
  email: '',
  phone: '',
  location: '',
  linkedinUrl: '',
  portfolioUrl: '',
}

const initialData: ResumeData = {
  contact: emptyContact,
  summary: { text: '' },
  experience: [],
  education: [],
  skills: [],
  extras: {
    certifications: { enabled: false, items: [] },
    languages: { enabled: false, items: [] },
    projects: { enabled: false, items: [] },
  },
}

function makeId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

interface ResumeStore {
  data: ResumeData
  hasHydrated: boolean
  setHasHydrated: (v: boolean) => void

  updateContact: (patch: Partial<ContactInfo>) => void

  updateSummary: (text: string) => void

  addExperience: () => void
  updateExperience: (id: string, patch: Partial<WorkExperienceEntry>) => void
  removeExperience: (id: string) => void
  reorderExperience: (fromIndex: number, toIndex: number) => void

  addEducation: () => void
  updateEducation: (id: string, patch: Partial<EducationEntry>) => void
  removeEducation: (id: string) => void
  reorderEducation: (fromIndex: number, toIndex: number) => void
  sortExperienceByDate: () => void
  sortEducationByDate: () => void

  addSkillGroup: () => void
  updateSkillGroup: (id: string, patch: Partial<SkillGroup>) => void
  removeSkillGroup: (id: string) => void
  reorderSkillGroup: (fromIndex: number, toIndex: number) => void

  toggleExtrasSection: (section: keyof ExtrasData, enabled: boolean) => void
  addCertification: () => void
  updateCertification: (id: string, patch: Partial<CertificationItem>) => void
  removeCertification: (id: string) => void
  addLanguage: () => void
  updateLanguage: (id: string, patch: Partial<LanguageItem>) => void
  removeLanguage: (id: string) => void
  addProject: () => void
  updateProject: (id: string, patch: Partial<ProjectItem>) => void
  removeProject: (id: string) => void

  resetResume: () => void
}

function reorder<T>(list: T[], from: number, to: number): T[] {
  const copy = list.slice()
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}

/** "MM/YYYY" -> sortable number (yyyy*12+mm); invalid/empty sinks to the bottom. */
function parseMonthYear(value: string): number {
  const match = /^(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return -Infinity
  const month = Number(match[1])
  const year = Number(match[2])
  return year * 12 + month
}

/**
 * Reverse-chronological comparator shared by Experience and Education:
 * current/ongoing entries float to the top, then most-recent end date,
 * tiebreak by most-recent start date; entries with no usable dates
 * sink to the bottom (parseMonthYear returns -Infinity for those).
 */
function compareByDate<T extends { startDate: string; endDate: string; isCurrent: boolean }>(
  a: T,
  b: T,
): number {
  if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1
  const aEnd = a.isCurrent ? Infinity : parseMonthYear(a.endDate)
  const bEnd = b.isCurrent ? Infinity : parseMonthYear(b.endDate)
  if (aEnd !== bEnd) return bEnd - aEnd
  return parseMonthYear(b.startDate) - parseMonthYear(a.startDate)
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      data: initialData,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      updateContact: (patch) =>
        set((s) => ({ data: { ...s.data, contact: { ...s.data.contact, ...patch } } })),

      updateSummary: (text) => set((s) => ({ data: { ...s.data, summary: { text } } })),

      addExperience: () =>
        set((s) => ({
          data: {
            ...s.data,
            experience: [
              ...s.data.experience,
              {
                id: makeId(),
                jobTitle: '',
                company: '',
                location: '',
                startDate: '',
                endDate: '',
                isCurrent: false,
                bullets: [],
              },
            ],
          },
        })),
      updateExperience: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            experience: s.data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          },
        })),
      removeExperience: (id) =>
        set((s) => ({ data: { ...s.data, experience: s.data.experience.filter((e) => e.id !== id) } })),
      reorderExperience: (from, to) =>
        set((s) => ({ data: { ...s.data, experience: reorder(s.data.experience, from, to) } })),

      addEducation: () =>
        set((s) => ({
          data: {
            ...s.data,
            education: [
              ...s.data.education,
              {
                id: makeId(),
                degree: '',
                institution: '',
                location: '',
                startDate: '',
                endDate: '',
                isCurrent: false,
                gpa: '',
                honors: '',
                bullets: [],
              },
            ],
          },
        })),
      updateEducation: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            education: s.data.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          },
        })),
      removeEducation: (id) =>
        set((s) => ({ data: { ...s.data, education: s.data.education.filter((e) => e.id !== id) } })),
      reorderEducation: (from, to) =>
        set((s) => ({ data: { ...s.data, education: reorder(s.data.education, from, to) } })),

      sortExperienceByDate: () =>
        set((s) => ({ data: { ...s.data, experience: s.data.experience.slice().sort(compareByDate) } })),
      sortEducationByDate: () =>
        set((s) => ({ data: { ...s.data, education: s.data.education.slice().sort(compareByDate) } })),

      addSkillGroup: () =>
        set((s) => ({
          data: { ...s.data, skills: [...s.data.skills, { id: makeId(), label: '', items: [] }] },
        })),
      updateSkillGroup: (id, patch) =>
        set((s) => ({
          data: { ...s.data, skills: s.data.skills.map((g) => (g.id === id ? { ...g, ...patch } : g)) },
        })),
      removeSkillGroup: (id) =>
        set((s) => ({ data: { ...s.data, skills: s.data.skills.filter((g) => g.id !== id) } })),
      reorderSkillGroup: (from, to) =>
        set((s) => ({ data: { ...s.data, skills: reorder(s.data.skills, from, to) } })),

      toggleExtrasSection: (section, enabled) =>
        set((s) => ({
          data: {
            ...s.data,
            extras: { ...s.data.extras, [section]: { ...s.data.extras[section], enabled } },
          },
        })),

      addCertification: () =>
        set((s) => ({
          data: {
            ...s.data,
            extras: {
              ...s.data.extras,
              certifications: {
                ...s.data.extras.certifications,
                items: [
                  ...s.data.extras.certifications.items,
                  { id: makeId(), name: '', issuer: '', date: '', url: '' },
                ],
              },
            },
          },
        })),
      updateCertification: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            extras: {
              ...s.data.extras,
              certifications: {
                ...s.data.extras.certifications,
                items: s.data.extras.certifications.items.map((c) =>
                  c.id === id ? { ...c, ...patch } : c,
                ),
              },
            },
          },
        })),
      removeCertification: (id) =>
        set((s) => ({
          data: {
            ...s.data,
            extras: {
              ...s.data.extras,
              certifications: {
                ...s.data.extras.certifications,
                items: s.data.extras.certifications.items.filter((c) => c.id !== id),
              },
            },
          },
        })),

      addLanguage: () =>
        set((s) => ({
          data: {
            ...s.data,
            extras: {
              ...s.data.extras,
              languages: {
                ...s.data.extras.languages,
                items: [...s.data.extras.languages.items, { id: makeId(), name: '', proficiency: '' }],
              },
            },
          },
        })),
      updateLanguage: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            extras: {
              ...s.data.extras,
              languages: {
                ...s.data.extras.languages,
                items: s.data.extras.languages.items.map((l) => (l.id === id ? { ...l, ...patch } : l)),
              },
            },
          },
        })),
      removeLanguage: (id) =>
        set((s) => ({
          data: {
            ...s.data,
            extras: {
              ...s.data.extras,
              languages: {
                ...s.data.extras.languages,
                items: s.data.extras.languages.items.filter((l) => l.id !== id),
              },
            },
          },
        })),

      addProject: () =>
        set((s) => ({
          data: {
            ...s.data,
            extras: {
              ...s.data.extras,
              projects: {
                ...s.data.extras.projects,
                items: [
                  ...s.data.extras.projects.items,
                  { id: makeId(), name: '', description: '', url: '' },
                ],
              },
            },
          },
        })),
      updateProject: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            extras: {
              ...s.data.extras,
              projects: {
                ...s.data.extras.projects,
                items: s.data.extras.projects.items.map((p) => (p.id === id ? { ...p, ...patch } : p)),
              },
            },
          },
        })),
      removeProject: (id) =>
        set((s) => ({
          data: {
            ...s.data,
            extras: {
              ...s.data.extras,
              projects: {
                ...s.data.extras.projects,
                items: s.data.extras.projects.items.filter((p) => p.id !== id),
              },
            },
          },
        })),

      resetResume: () => set({ data: initialData }),
    }),
    {
      name: 'resume-builder:v1',
      version: 3,
      partialize: (state) => ({ data: state.data }),
      // v1 -> v2: EducationEntry gained `bullets` and `isCurrent`. Old
      // saved entries never had these fields — backfill them so existing
      // user data loads instead of being wiped by the version bump.
      // v2 -> v3: CertificationItem gained an optional `url` — backfill
      // undefined so old drafts load without a migration error.
      migrate: (persistedState, version) => {
        const state = persistedState as { data: ResumeData }
        if (version < 2 && state?.data?.education) {
          state.data = {
            ...state.data,
            education: state.data.education.map((e) => {
              const legacy = e as Partial<EducationEntry>
              return {
                ...e,
                bullets: legacy.bullets ?? [],
                isCurrent: legacy.isCurrent ?? false,
              }
            }),
          }
        }
        if (version < 3 && state?.data?.extras?.certifications?.items) {
          state.data = {
            ...state.data,
            extras: {
              ...state.data.extras,
              certifications: {
                ...state.data.extras.certifications,
                items: state.data.extras.certifications.items.map((c) => ({
                  ...c,
                  url: (c as Partial<CertificationItem>).url ?? '',
                })),
              },
            },
          }
        }
        return state
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
