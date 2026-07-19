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

interface CompactPaperProps {
  data: ResumeData
  paperSize?: PaperSizeId
  frame?: 'screen' | 'print'
}

/** Uppercase sans heading with a full-width hairline rule beneath it — dense, modern. */
/**
 * Ruleless run-in heading: tiny, heavily letter-spaced, no divider line
 * at all. The *absence* of section rules — combined with tight vertical
 * rhythm — is what gives Compact its distinct "wall of dense text"
 * silhouette versus the ruled Classic and the tab-marked Modern.
 */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-1 text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#555]"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {children}
    </h2>
  )
}

/**
 * "Compact" ATS template — dense, left-aligned, built to fit more
 * experience on one page without dipping below print-safe font
 * sizes (body copy holds at ~10.5px screen px ≈ 10.5pt, still ATS
 * legible). Same strict rules as Classic/Executive: single column,
 * linear DOM order, no tables/photos/icons/rating bars, empty
 * sections never render.
 */
export function CompactPaper({ data, paperSize = 'letter', frame = 'screen' }: CompactPaperProps) {
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
      className="text-[12.5px] leading-[1.32]"
    >
      {/* Header / Contact — left-aligned, bold, with a single hairline
          rule (the only rule in the whole template) to anchor the top. */}
      <div ref={headerRef} className="rounded-sm border-b border-[#d4d4d4] pb-2 transition-colors">
        {s.hasName ? (
          <h1
            className="text-[21px] font-bold leading-tight text-[#101010]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {contact.fullName}
          </h1>
        ) : (
          <h1
            className="text-[21px] font-bold leading-tight text-[#b8b8b8]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Your Name
          </h1>
        )}

        {contact.jobTitle && <p className="mt-0.5 text-[12.5px] text-[#3a3a3a]">{contact.jobTitle}</p>}

        {s.contactLine ? (
          <p className="mt-1 text-[10.5px] text-[#555]">{s.contactLine}</p>
        ) : (
          <p className="mt-1 text-[10.5px] italic text-[#bbb]">
            Add your email and phone in Step 1 — they'll appear here.
          </p>
        )}
      </div>

      {s.hasSummary && (
        <section ref={summaryRef} className="mt-3.5 rounded-sm transition-colors">
          <SectionLabel>Summary</SectionLabel>
          <p className="text-[11.5px] text-[#262626]">{data.summary.text}</p>
        </section>
      )}

      {s.visibleExperience.length > 0 && (
        <section ref={experienceRef} className="mt-3.5 rounded-sm transition-colors">
          <SectionLabel>Experience</SectionLabel>
          <div className="flex flex-col gap-2.5">
            {s.visibleExperience.map((entry) => (
              <div key={entry.id} className="print-avoid-break">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[12px] font-semibold text-[#151515]">{entry.jobTitle}</span>
                  <span className="whitespace-nowrap text-[10px] text-[#666]">
                    {formatMonthYear(entry.startDate) || '—'} –{' '}
                    {entry.isCurrent ? 'Present' : formatMonthYear(entry.endDate) || '—'}
                  </span>
                </div>
                {(entry.company || entry.location) && (
                  <p className="text-[10.5px] italic text-[#555]">
                    {[entry.company, entry.location].filter(Boolean).join('   ·   ')}
                  </p>
                )}
                {entry.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-0.5 list-disc pl-4 text-[11px] text-[#262626]">
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
        <section ref={educationRef} className="mt-3.5 rounded-sm transition-colors">
          <SectionLabel>Education</SectionLabel>
          <div className="flex flex-col gap-2">
            {s.visibleEducation.map((entry) => (
              <div key={entry.id} className="print-avoid-break">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[12px] font-semibold text-[#151515]">{entry.degree}</span>
                  <span className="whitespace-nowrap text-[10px] text-[#666]">
                    {formatMonthYear(entry.startDate) || '—'} –{' '}
                    {entry.isCurrent ? 'Present' : formatMonthYear(entry.endDate) || '—'}
                  </span>
                </div>
                {(entry.institution || entry.location) && (
                  <p className="text-[10.5px] italic text-[#555]">
                    {[entry.institution, entry.location].filter(Boolean).join('   ·   ')}
                  </p>
                )}
                {(entry.gpa || entry.honors) && (
                  <p className="text-[10.5px] text-[#666]">
                    {[entry.gpa && `GPA: ${entry.gpa}`, entry.honors].filter(Boolean).join('   ·   ')}
                  </p>
                )}
                {entry.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-0.5 list-disc pl-4 text-[11px] text-[#262626]">
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
        <section ref={skillsRef} className="mt-3.5 rounded-sm transition-colors">
          <SectionLabel>Skills</SectionLabel>
          <div className="flex flex-col gap-1">
            {s.visibleSkillGroups.map((group) => (
              <p key={group.id} className="text-[11px] text-[#262626]">
                {group.label && <span className="font-semibold">{group.label}: </span>}
                {group.items.join(', ')}
              </p>
            ))}
          </div>
        </section>
      )}

      {s.hasCertifications && (
        <section ref={certificationsRef} className="mt-3.5 rounded-sm transition-colors">
          <SectionLabel>Certifications</SectionLabel>
          <ul className="flex flex-col gap-1 text-[11px] text-[#262626]">
            {s.visibleCertifications.map((c) => (
              <li key={c.id} className="print-avoid-break">
                <div>
                  {c.name}
                  {c.issuer ? ` — ${c.issuer}` : ''}
                  {c.date ? `, ${formatMonthYear(c.date)}` : ''}
                </div>
                {c.url && <div className="text-[10px] text-[#555]">{c.url}</div>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {s.hasLanguages && (
        <section ref={languagesRef} className="mt-3.5 rounded-sm transition-colors">
          <SectionLabel>Languages</SectionLabel>
          <p className="text-[11px] text-[#262626]">
            {s.visibleLanguages.map((l) => (l.proficiency ? `${l.name} (${l.proficiency})` : l.name)).join('   ·   ')}
          </p>
        </section>
      )}

      {s.hasProjects && (
        <section ref={projectsRef} className="mt-3.5 rounded-sm transition-colors">
          <SectionLabel>Projects</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {s.visibleProjects.map((p) => (
              <div key={p.id} className="print-avoid-break">
                <p className="text-[11.5px] font-semibold text-[#151515]">{p.name}</p>
                {p.description && <p className="text-[10.5px] text-[#333]">{p.description}</p>}
                {p.url && <p className="text-[10px] text-[#555]">{p.url}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
