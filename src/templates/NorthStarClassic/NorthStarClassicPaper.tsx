import { useRef } from 'react'
import type { ResumeData } from '../../store/resumeStore'
import { useFlashOnChange } from './useFlashOnChange'
import { formatMonthYear } from '../dateFormat'
import {
  type PaperSizeId,
  paperWidthPx,
  paperHeightPx,
  PRINT_MARGIN_X_PX,
  PRINT_MARGIN_Y_PX,
} from './paperSizes'

// Legacy Letter-only constants — still exported for any call site that
// hasn't been migrated to the size-aware helpers in paperSizes.ts.
export const PAPER_WIDTH = paperWidthPx('letter')
export const PAPER_HEIGHT = paperHeightPx('letter')

interface NorthStarClassicPaperProps {
  data: ResumeData
  paperSize?: PaperSizeId
  /**
   * "screen" (default): fixed width + padding equal to the print
   * margin, for the live preview. "print": full width, zero padding —
   * the real margin comes from `@page` at print time (see
   * PrintablePaper.tsx), never from element padding. Padding on both
   * would double the whitespace at the top of every page.
   */
  frame?: 'screen' | 'print'
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="print-accent-line mb-2 border-b border-[#0b6e64] pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {children}
    </h2>
  )
}

/**
 * The actual printable resume — strict single-column ATS layout.
 * Deliberately plain: no tables, no multi-column grids, no icons, no
 * photo, no rating bars. Theme accents are limited to a thin teal
 * section rule and a hairline gold underline beneath the candidate's
 * name; everything else is print-safe dark-on-white body copy.
 * Sections with no data are not rendered into the DOM at all.
 */
export function NorthStarClassicPaper({ data, paperSize = 'letter', frame = 'screen' }: NorthStarClassicPaperProps) {
  const { contact, summary, experience, education, skills, extras } = data
  const headerRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLElement>(null)
  const experienceRef = useRef<HTMLElement>(null)
  const educationRef = useRef<HTMLElement>(null)
  const skillsRef = useRef<HTMLElement>(null)
  const certificationsRef = useRef<HTMLElement>(null)
  const languagesRef = useRef<HTMLElement>(null)
  const projectsRef = useRef<HTMLElement>(null)

  // Only entries with real content render — an empty freshly-added card
  // never shows up as a blank line on the printable page.
  const visibleExperience = experience.filter((e) => e.jobTitle.trim() || e.company.trim())
  const visibleEducation = education.filter((e) => e.degree.trim() || e.institution.trim())
  const visibleSkillGroups = skills.filter((g) => g.items.length > 0)
  const visibleCertifications = extras.certifications.items.filter((c) => c.name.trim())
  const visibleLanguages = extras.languages.items.filter((l) => l.name.trim())
  const visibleProjects = extras.projects.items.filter((p) => p.name.trim())

  useFlashOnChange(
    headerRef,
    `${contact.fullName}|${contact.jobTitle}|${contact.email}|${contact.phone}|${contact.location}|${contact.linkedinUrl}|${contact.portfolioUrl}`,
  )
  useFlashOnChange(summaryRef, summary.text)
  useFlashOnChange(experienceRef, JSON.stringify(visibleExperience))
  useFlashOnChange(educationRef, JSON.stringify(visibleEducation))
  useFlashOnChange(skillsRef, JSON.stringify(visibleSkillGroups))
  useFlashOnChange(certificationsRef, JSON.stringify(visibleCertifications))
  useFlashOnChange(languagesRef, JSON.stringify(visibleLanguages))
  useFlashOnChange(projectsRef, JSON.stringify(visibleProjects))

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
  const isPrint = frame === 'print'

  return (
    <div
      style={{
        width: isPrint ? '100%' : paperWidthPx(paperSize),
        minHeight: isPrint ? undefined : paperHeightPx(paperSize),
        fontFamily: 'Inter, sans-serif',
        color: '#1a1a1a',
        background: '#ffffff',
        paddingLeft: isPrint ? 0 : PRINT_MARGIN_X_PX,
        paddingRight: isPrint ? 0 : PRINT_MARGIN_X_PX,
        paddingTop: isPrint ? 0 : PRINT_MARGIN_Y_PX,
        paddingBottom: isPrint ? 0 : PRINT_MARGIN_Y_PX,
      }}
      className="text-[14px] leading-[1.4]"
    >
      {/* Header / Contact */}
      <div ref={headerRef} className="rounded-sm transition-colors">
        {hasName ? (
          <h1
            className="text-[26px] font-semibold leading-tight text-[#101010]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            <span className="print-accent-underline border-b-2 border-[#e8c473] pb-0.5">{contact.fullName}</span>
          </h1>
        ) : (
          <h1
            className="text-[26px] font-semibold leading-tight text-[#b8b8b8]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Your Name
          </h1>
        )}

        {contact.jobTitle && (
          <p className="mt-1 text-[15px] text-[#3a3a3a]">{contact.jobTitle}</p>
        )}

        {contactLine ? (
          <p className="mt-2 text-[11.5px] text-[#555]">{contactLine}</p>
        ) : (
          <p className="mt-2 text-[11.5px] italic text-[#bbb]">
            Add your email and phone in Step 1 — they'll appear here.
          </p>
        )}
      </div>

      {summary.text.trim() && (
        <section ref={summaryRef} className="mt-6 rounded-sm transition-colors">
          <SectionLabel>Summary</SectionLabel>
          <p className="text-[13px] text-[#262626]">{summary.text}</p>
        </section>
      )}

      {visibleExperience.length > 0 && (
        <section ref={experienceRef} className="mt-6 rounded-sm transition-colors">
          <SectionLabel>Work Experience</SectionLabel>
          <div className="flex flex-col gap-4">
            {visibleExperience.map((entry) => (
              <div key={entry.id} className="print-avoid-break">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13.5px] font-semibold text-[#151515]">{entry.jobTitle}</span>
                  <span className="whitespace-nowrap text-[11px] text-[#666]">
                    {formatMonthYear(entry.startDate) || '—'} –{' '}
                    {entry.isCurrent ? 'Present' : formatMonthYear(entry.endDate) || '—'}
                  </span>
                </div>
                {(entry.company || entry.location) && (
                  <p className="text-[11.5px] italic text-[#555]">
                    {[entry.company, entry.location].filter(Boolean).join('   ·   ')}
                  </p>
                )}
                {entry.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1 list-disc pl-4 text-[12.5px] text-[#262626]">
                    {entry.bullets
                      .filter((b) => b.trim())
                      .map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {visibleEducation.length > 0 && (
        <section ref={educationRef} className="mt-6 rounded-sm transition-colors">
          <SectionLabel>Education</SectionLabel>
          <div className="flex flex-col gap-3">
            {visibleEducation.map((entry) => (
              <div key={entry.id} className="print-avoid-break">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13.5px] font-semibold text-[#151515]">{entry.degree}</span>
                  <span className="whitespace-nowrap text-[11px] text-[#666]">
                    {formatMonthYear(entry.startDate) || '—'} –{' '}
                    {entry.isCurrent ? 'Present' : formatMonthYear(entry.endDate) || '—'}
                  </span>
                </div>
                {(entry.institution || entry.location) && (
                  <p className="text-[11.5px] italic text-[#555]">
                    {[entry.institution, entry.location].filter(Boolean).join('   ·   ')}
                  </p>
                )}
                {(entry.gpa || entry.honors) && (
                  <p className="text-[11.5px] text-[#666]">
                    {[entry.gpa && `GPA: ${entry.gpa}`, entry.honors].filter(Boolean).join('   ·   ')}
                  </p>
                )}
                {entry.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1 list-disc pl-4 text-[12.5px] text-[#262626]">
                    {entry.bullets
                      .filter((b) => b.trim())
                      .map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {visibleSkillGroups.length > 0 && (
        <section ref={skillsRef} className="mt-6 rounded-sm transition-colors">
          <SectionLabel>Skills</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {visibleSkillGroups.map((group) => (
              <p key={group.id} className="text-[12.5px] text-[#262626]">
                {group.label && <span className="font-semibold">{group.label}: </span>}
                {group.items.join(', ')}
              </p>
            ))}
          </div>
        </section>
      )}

      {extras.certifications.enabled && visibleCertifications.length > 0 && (
        <section ref={certificationsRef} className="mt-6 rounded-sm transition-colors">
          <SectionLabel>Certifications</SectionLabel>
          <ul className="flex flex-col gap-1.5 text-[12.5px] text-[#262626]">
            {visibleCertifications.map((c) => (
              <li key={c.id} className="print-avoid-break">
                <div>
                  {c.name}
                  {c.issuer ? ` — ${c.issuer}` : ''}
                  {c.date ? `, ${formatMonthYear(c.date)}` : ''}
                </div>
                {c.url && <div className="text-[11px] text-[#555]">{c.url}</div>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {extras.languages.enabled && visibleLanguages.length > 0 && (
        <section ref={languagesRef} className="mt-6 rounded-sm transition-colors">
          <SectionLabel>Languages</SectionLabel>
          <p className="text-[12.5px] text-[#262626]">
            {visibleLanguages.map((l) => (l.proficiency ? `${l.name} (${l.proficiency})` : l.name)).join('   ·   ')}
          </p>
        </section>
      )}

      {extras.projects.enabled && visibleProjects.length > 0 && (
        <section ref={projectsRef} className="mt-6 rounded-sm transition-colors">
          <SectionLabel>Projects</SectionLabel>
          <div className="flex flex-col gap-2">
            {visibleProjects.map((p) => (
              <div key={p.id} className="print-avoid-break">
                <p className="text-[13px] font-semibold text-[#151515]">{p.name}</p>
                {p.description && <p className="text-[12px] text-[#333]">{p.description}</p>}
                {p.url && <p className="text-[11px] text-[#555]">{p.url}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
