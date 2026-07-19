import { useRef } from 'react'
import type { ResumeData } from '../../store/resumeStore'
import { useFlashOnChange } from '../NorthStarClassic/useFlashOnChange'
import { formatMonthYear } from '../dateFormat'
import { visibleSections } from '../resumeSections'
import {
  type PaperSizeId,
  paperWidthPx,
  paperHeightPx,
  PRINT_MARGIN_X_PX,
  PRINT_MARGIN_Y_PX,
} from '../NorthStarClassic/paperSizes'

const NAVY = '#1f3a5f'

interface ModernPaperProps {
  data: ResumeData
  paperSize?: PaperSizeId
  frame?: 'screen' | 'print'
}

/**
 * Bold navy sans heading — the single accent color of this template.
 * Real text (never an image), dark enough to stay legible on a
 * black-and-white printer; @media print additionally forces it to
 * near-black via .print-accent-text (globals.css).
 */
/**
 * Section heading with a short thick navy accent tab on its left — the
 * signature motif of this template. Vertical ticks down the page read
 * as distinctly "Modern" even at preview scale, and unlike Classic's
 * full-width horizontal rules or Compact's ruleless headings, they give
 * this template its own silhouette. Both the navy text and the tab are
 * forced to near-black in print (print-accent-text / print-accent-rule)
 * so a grayscale printer never washes them out.
 */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="print-accent-text print-accent-rule mb-2 border-l-[3px] pl-2.5 text-[12px] font-bold uppercase leading-tight tracking-[0.1em]"
      style={{ fontFamily: 'Inter, sans-serif', color: NAVY, borderColor: NAVY }}
    >
      {children}
    </h2>
  )
}

/**
 * "Modern Professional" ATS template — the 2026 "one muted accent
 * color" style popularized by Jobscan/Teal/Enhancv: bold left-aligned
 * name, a solid navy rule under the header block, and navy bold
 * section headings. Everything else stays strict ATS: single column,
 * linear DOM, no tables/photos/icons/rating bars, empty sections
 * never render, print-safe via @media print overrides.
 */
export function ModernPaper({ data, paperSize = 'letter', frame = 'screen' }: ModernPaperProps) {
  const s = visibleSections(data)
  const { contact } = s
  const headerRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLElement>(null)
  const experienceRef = useRef<HTMLElement>(null)
  const educationRef = useRef<HTMLElement>(null)
  const skillsRef = useRef<HTMLElement>(null)
  const certificationsRef = useRef<HTMLElement>(null)
  const languagesRef = useRef<HTMLElement>(null)
  const projectsRef = useRef<HTMLElement>(null)

  useFlashOnChange(
    headerRef,
    `${contact.fullName}|${contact.jobTitle}|${contact.email}|${contact.phone}|${contact.location}|${contact.linkedinUrl}|${contact.portfolioUrl}`,
  )
  useFlashOnChange(summaryRef, data.summary.text)
  useFlashOnChange(experienceRef, JSON.stringify(s.visibleExperience))
  useFlashOnChange(educationRef, JSON.stringify(s.visibleEducation))
  useFlashOnChange(skillsRef, JSON.stringify(s.visibleSkillGroups))
  useFlashOnChange(certificationsRef, JSON.stringify(s.visibleCertifications))
  useFlashOnChange(languagesRef, JSON.stringify(s.visibleLanguages))
  useFlashOnChange(projectsRef, JSON.stringify(s.visibleProjects))

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
      className="text-[13.5px] leading-[1.42]"
    >
      {/* Header — bold name + navy accent rule under the whole block */}
      <div
        ref={headerRef}
        className="print-accent-rule rounded-sm border-b-[3px] pb-3 transition-colors"
        style={{ borderColor: NAVY }}
      >
        {s.hasName ? (
          <h1
            className="print-accent-text text-[27px] font-extrabold leading-tight tracking-tight"
            style={{ fontFamily: 'Inter, sans-serif', color: NAVY }}
          >
            {contact.fullName}
          </h1>
        ) : (
          <h1 className="text-[27px] font-extrabold leading-tight text-[#b8b8b8]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Your Name
          </h1>
        )}

        {contact.jobTitle && (
          <p className="mt-0.5 text-[14px] font-medium text-[#3a3a3a]">{contact.jobTitle}</p>
        )}

        {s.contactLine ? (
          <p className="mt-1.5 text-[11px] text-[#555]">{s.contactLine}</p>
        ) : (
          <p className="mt-1.5 text-[11px] italic text-[#bbb]">
            Add your email and phone in Step 1 — they'll appear here.
          </p>
        )}
      </div>

      {s.hasSummary && (
        <section ref={summaryRef} className="mt-5 rounded-sm transition-colors">
          <SectionLabel>Summary</SectionLabel>
          <p className="text-[12.5px] text-[#262626]">{data.summary.text}</p>
        </section>
      )}

      {s.visibleExperience.length > 0 && (
        <section ref={experienceRef} className="mt-5 rounded-sm transition-colors">
          <SectionLabel>Work Experience</SectionLabel>
          <div className="flex flex-col gap-3.5">
            {s.visibleExperience.map((entry) => (
              <div key={entry.id} className="print-avoid-break">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] font-bold text-[#151515]">{entry.jobTitle}</span>
                  <span className="whitespace-nowrap text-[11px] font-medium text-[#555]">
                    {formatMonthYear(entry.startDate) || '—'} –{' '}
                    {entry.isCurrent ? 'Present' : formatMonthYear(entry.endDate) || '—'}
                  </span>
                </div>
                {(entry.company || entry.location) && (
                  <p className="text-[11.5px] font-medium text-[#444]">
                    {[entry.company, entry.location].filter(Boolean).join('   ·   ')}
                  </p>
                )}
                {entry.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1 list-disc pl-4 text-[12px] text-[#262626]">
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

      {s.visibleEducation.length > 0 && (
        <section ref={educationRef} className="mt-5 rounded-sm transition-colors">
          <SectionLabel>Education</SectionLabel>
          <div className="flex flex-col gap-2.5">
            {s.visibleEducation.map((entry) => (
              <div key={entry.id} className="print-avoid-break">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] font-bold text-[#151515]">{entry.degree}</span>
                  <span className="whitespace-nowrap text-[11px] font-medium text-[#555]">
                    {formatMonthYear(entry.startDate) || '—'} –{' '}
                    {entry.isCurrent ? 'Present' : formatMonthYear(entry.endDate) || '—'}
                  </span>
                </div>
                {(entry.institution || entry.location) && (
                  <p className="text-[11.5px] font-medium text-[#444]">
                    {[entry.institution, entry.location].filter(Boolean).join('   ·   ')}
                  </p>
                )}
                {(entry.gpa || entry.honors) && (
                  <p className="text-[11.5px] text-[#666]">
                    {[entry.gpa && `GPA: ${entry.gpa}`, entry.honors].filter(Boolean).join('   ·   ')}
                  </p>
                )}
                {entry.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1 list-disc pl-4 text-[12px] text-[#262626]">
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

      {s.visibleSkillGroups.length > 0 && (
        <section ref={skillsRef} className="mt-5 rounded-sm transition-colors">
          <SectionLabel>Skills</SectionLabel>
          <div className="flex flex-col gap-1">
            {s.visibleSkillGroups.map((group) => (
              <p key={group.id} className="text-[12px] text-[#262626]">
                {group.label && <span className="font-bold">{group.label}: </span>}
                {group.items.join(', ')}
              </p>
            ))}
          </div>
        </section>
      )}

      {s.hasCertifications && (
        <section ref={certificationsRef} className="mt-5 rounded-sm transition-colors">
          <SectionLabel>Certifications</SectionLabel>
          <ul className="flex flex-col gap-1 text-[12px] text-[#262626]">
            {s.visibleCertifications.map((c) => (
              <li key={c.id} className="print-avoid-break">
                <div>
                  <span className="font-medium">{c.name}</span>
                  {c.issuer ? ` — ${c.issuer}` : ''}
                  {c.date ? `, ${formatMonthYear(c.date)}` : ''}
                </div>
                {c.url && <div className="text-[10.5px] text-[#555]">{c.url}</div>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {s.hasLanguages && (
        <section ref={languagesRef} className="mt-5 rounded-sm transition-colors">
          <SectionLabel>Languages</SectionLabel>
          <p className="text-[12px] text-[#262626]">
            {s.visibleLanguages.map((l) => (l.proficiency ? `${l.name} (${l.proficiency})` : l.name)).join('   ·   ')}
          </p>
        </section>
      )}

      {s.hasProjects && (
        <section ref={projectsRef} className="mt-5 rounded-sm transition-colors">
          <SectionLabel>Projects</SectionLabel>
          <div className="flex flex-col gap-2">
            {s.visibleProjects.map((p) => (
              <div key={p.id} className="print-avoid-break">
                <p className="text-[12.5px] font-bold text-[#151515]">{p.name}</p>
                {p.description && <p className="text-[11.5px] text-[#333]">{p.description}</p>}
                {p.url && <p className="text-[10.5px] text-[#555]">{p.url}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
