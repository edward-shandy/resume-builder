import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Tab,
  TabStopType,
  TextRun,
  convertInchesToTwip,
} from 'docx'
import type { ResumeData } from '../store/resumeStore'
import type { TemplateId } from '../templates'
import type { PaperSizeId } from '../templates/NorthStarClassic/paperSizes'
import { formatMonthYear } from '../templates/dateFormat'
import { visibleSections } from '../templates/resumeSections'

// Matches PRINT_MARGIN_X_IN / PRINT_MARGIN_Y_IN in
// templates/NorthStarClassic/paperSizes.ts, and the Letter/A4 sizes
// used by the print stylesheet — kept in sync by hand since this file
// intentionally does not import anything that touches the DOM.
const MARGIN_X_IN = 0.6
const MARGIN_Y_IN = 0.55
const PAGE_SIZE_IN: Record<PaperSizeId, { width: number; height: number }> = {
  letter: { width: 8.5, height: 11 },
  a4: { width: 8.27, height: 11.69 },
}

const TWIP_PER_IN = 1440

interface TemplateSkin {
  nameFont: string
  bodyFont: string
  nameColor: string
  nameSize: number
  nameBold: boolean
  nameUnderline: boolean
  nameCentered: boolean
  headerCentered: boolean
  headingFont: string
  headingSize: number
  headingColor: string
  headingBold: boolean
  headingCaps: boolean
  headingSpacing: boolean
  headingBorder: 'bottom' | 'topbottom' | 'left' | 'none'
  headingBorderColor: string
  bodySize: number
  metaSize: number
  sectionSpaceBefore: number
  sectionSpaceAfter: number
  headerRuleAfter: boolean
}

const SKINS: Record<TemplateId, TemplateSkin> = {
  classic: {
    nameFont: 'Georgia',
    bodyFont: 'Calibri',
    nameColor: '101010',
    nameSize: 30,
    nameBold: true,
    nameUnderline: true,
    nameCentered: false,
    headerCentered: false,
    headingFont: 'Calibri',
    headingSize: 18,
    headingColor: '1A1A1A',
    headingBold: true,
    headingCaps: true,
    headingSpacing: true,
    headingBorder: 'bottom',
    headingBorderColor: '0B6E64',
    bodySize: 21,
    metaSize: 18,
    sectionSpaceBefore: 220,
    sectionSpaceAfter: 90,
    headerRuleAfter: false,
  },
  executive: {
    nameFont: 'Georgia',
    bodyFont: 'Calibri',
    nameColor: '101010',
    nameSize: 34,
    nameBold: false,
    nameUnderline: false,
    nameCentered: true,
    headerCentered: true,
    headingFont: 'Calibri',
    headingSize: 18,
    headingColor: '1A1A1A',
    headingBold: true,
    headingCaps: true,
    headingSpacing: true,
    headingBorder: 'topbottom',
    headingBorderColor: '1A1A1A',
    bodySize: 21,
    metaSize: 18,
    sectionSpaceBefore: 300,
    sectionSpaceAfter: 140,
    headerRuleAfter: false,
  },
  compact: {
    nameFont: 'Arial',
    bodyFont: 'Arial',
    nameColor: '101010',
    nameSize: 24,
    nameBold: true,
    nameUnderline: false,
    nameCentered: false,
    headerCentered: false,
    headingFont: 'Arial',
    headingSize: 15,
    headingColor: '555555',
    headingBold: true,
    headingCaps: true,
    headingSpacing: true,
    headingBorder: 'none',
    headingBorderColor: '555555',
    bodySize: 19,
    metaSize: 17,
    sectionSpaceBefore: 140,
    sectionSpaceAfter: 40,
    headerRuleAfter: false,
  },
  modern: {
    nameFont: 'Arial',
    bodyFont: 'Arial',
    nameColor: '1F3A5F',
    nameSize: 30,
    nameBold: true,
    nameUnderline: false,
    nameCentered: false,
    headerCentered: false,
    headingFont: 'Arial',
    headingSize: 18,
    headingColor: '1F3A5F',
    headingBold: true,
    headingCaps: true,
    headingSpacing: true,
    headingBorder: 'left',
    headingBorderColor: '1F3A5F',
    bodySize: 21,
    metaSize: 18,
    sectionSpaceBefore: 220,
    sectionSpaceAfter: 90,
    headerRuleAfter: true,
  },
}

function sanitizeFileName(name: string): string {
  const cleaned = name.trim().replace(/[^a-z0-9\-_]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return cleaned.length > 0 ? cleaned : 'resume'
}

function headingBorders(skin: TemplateSkin) {
  const size = 6
  const rule = { style: BorderStyle.SINGLE, size, color: skin.headingBorderColor, space: 4 }
  if (skin.headingBorder === 'bottom') return { bottom: rule }
  if (skin.headingBorder === 'topbottom') return { top: rule, bottom: rule }
  if (skin.headingBorder === 'left') return { left: { ...rule, size: 24, space: 6 } }
  return undefined
}

function makeHeading(text: string, skin: TemplateSkin): Paragraph {
  return new Paragraph({
    spacing: { before: skin.sectionSpaceBefore, after: skin.headingSpacing ? 120 : 90 },
    border: headingBorders(skin),
    alignment: skin.headerCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
    children: [
      new TextRun({
        text: skin.headingCaps ? text.toUpperCase() : text,
        font: skin.headingFont,
        size: skin.headingSize,
        bold: skin.headingBold,
        color: skin.headingColor,
        allCaps: skin.headingCaps,
        characterSpacing: skin.headingSpacing ? 20 : undefined,
      }),
    ],
  })
}

function metaLine(text: string, skin: TemplateSkin, italics = false, forceLeft = false): Paragraph {
  return new Paragraph({
    // Entry sublines (company / institution / GPA) hug the left edge in
    // every on-screen template — including Executive, whose centering
    // only applies to the header and prose sections. forceLeft mirrors
    // that; the contact line keeps following the skin.
    alignment: !forceLeft && skin.headerCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { after: 40 },
    children: [
      new TextRun({ text, font: skin.bodyFont, size: skin.metaSize, italics, color: '555555' }),
    ],
  })
}

function bodyPara(text: string, skin: TemplateSkin, opts: { bold?: boolean; after?: number; before?: number } = {}): Paragraph {
  return new Paragraph({
    alignment: skin.headerCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { after: opts.after ?? 60, before: opts.before ?? 0 },
    children: [new TextRun({ text, font: skin.bodyFont, size: skin.bodySize, bold: opts.bold, color: '262626' })],
  })
}

function bulletPara(text: string, skin: TemplateSkin): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 30 },
    children: [new TextRun({ text, font: skin.bodyFont, size: skin.bodySize, color: '262626' })],
  })
}

function entryHeaderLine(left: string, right: string, skin: TemplateSkin, rightTabPos: number): Paragraph {
  return new Paragraph({
    // The right tab stop sits exactly at the content-box edge (page
    // width minus both margins) so every date's right edge lines up
    // flush with the full-width rules above it — a hardcoded position
    // fell ~1.4cm short of the margin and made the right side ragged.
    tabStops: [{ type: TabStopType.RIGHT, position: rightTabPos }],
    spacing: { after: 10 },
    // Always left+right, never centered: every on-screen template —
    // Executive included — renders entry titles left with the date
    // pushed to the right edge.
    alignment: AlignmentType.LEFT,
    children: [
      new TextRun({ text: left, font: skin.bodyFont, size: skin.bodySize + 1, bold: true, color: '151515' }),
      ...(right
        ? [
            // A literal "\t" inside `text` gets normalized to a space by
            // the docx library — the date never reached the tab stop.
            // An explicit Tab child is what actually emits <w:tab/>.
            new TextRun({
              children: [new Tab(), right],
              font: skin.bodyFont,
              size: skin.metaSize,
              color: '666666',
            }),
          ]
        : []),
    ],
  })
}

/**
 * Builds an ATS-safe, single-column .docx from the same visible-section
 * data the on-screen templates render, then triggers a browser download.
 * Styling is a per-template approximation (font, accent color, heading
 * border) — not a pixel copy of the print/HTML templates.
 */
export async function exportResumeDocx(
  data: ResumeData,
  templateId: TemplateId,
  paperSize: PaperSizeId,
): Promise<void> {
  const skin = SKINS[templateId]
  const s = visibleSections(data)
  const page = PAGE_SIZE_IN[paperSize] ?? PAGE_SIZE_IN.letter
  // Content-box width in twips — the anchor for right-aligned dates.
  const rightTabPos = Math.round((page.width - 2 * MARGIN_X_IN) * TWIP_PER_IN)

  const children: Paragraph[] = []

  // Header
  children.push(
    new Paragraph({
      alignment: skin.nameCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: s.hasName ? s.contact.fullName : 'Your Name',
          font: skin.nameFont,
          size: skin.nameSize,
          bold: skin.nameBold,
          underline: skin.nameUnderline ? { color: 'E8C473' } : undefined,
          color: skin.nameColor,
        }),
      ],
    }),
  )

  if (s.contact.jobTitle) {
    children.push(
      new Paragraph({
        alignment: skin.headerCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: 40 },
        children: [
          new TextRun({ text: s.contact.jobTitle, font: skin.bodyFont, size: skin.bodySize + 1, color: '3A3A3A' }),
        ],
      }),
    )
  }

  if (s.contactLine) {
    children.push(metaLine(s.contactLine, skin))
  }

  // Modern's header block ends in a thick solid navy rule (mirrors the
  // `border-b-[3px]` under the header in ModernPaper.tsx) — appended as
  // its own empty bordered paragraph rather than attached to the last
  // text line, so the border always spans the full content width.
  if (skin.headerRuleAfter) {
    children.push(
      new Paragraph({
        spacing: { before: 40, after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: skin.headingBorderColor, space: 6 } },
        children: [],
      }),
    )
  }

  if (s.hasSummary) {
    children.push(makeHeading('Summary', skin))
    children.push(bodyPara(data.summary.text, skin))
  }

  if (s.visibleExperience.length > 0) {
    children.push(makeHeading('Work Experience', skin))
    for (const entry of s.visibleExperience) {
      const dateRange = `${formatMonthYear(entry.startDate) || '—'} – ${entry.isCurrent ? 'Present' : formatMonthYear(entry.endDate) || '—'}`
      children.push(entryHeaderLine(entry.jobTitle, dateRange, skin, rightTabPos))
      const subline = [entry.company, entry.location].filter(Boolean).join('   ·   ')
      if (subline) children.push(metaLine(subline, skin, true, true))
      for (const bullet of entry.bullets.filter((b) => b.trim())) {
        children.push(bulletPara(bullet, skin))
      }
      children.push(new Paragraph({ spacing: { after: 100 }, children: [] }))
    }
  }

  if (s.visibleEducation.length > 0) {
    children.push(makeHeading('Education', skin))
    for (const entry of s.visibleEducation) {
      const dateRange = `${formatMonthYear(entry.startDate) || '—'} – ${entry.isCurrent ? 'Present' : formatMonthYear(entry.endDate) || '—'}`
      children.push(entryHeaderLine(entry.degree, dateRange, skin, rightTabPos))
      const subline = [entry.institution, entry.location].filter(Boolean).join('   ·   ')
      if (subline) children.push(metaLine(subline, skin, true, true))
      const extra = [entry.gpa && `GPA: ${entry.gpa}`, entry.honors].filter(Boolean).join('   ·   ')
      if (extra) children.push(metaLine(extra, skin, false, true))
      for (const bullet of entry.bullets.filter((b) => b.trim())) {
        children.push(bulletPara(bullet, skin))
      }
      children.push(new Paragraph({ spacing: { after: 100 }, children: [] }))
    }
  }

  if (s.visibleSkillGroups.length > 0) {
    children.push(makeHeading('Skills', skin))
    for (const group of s.visibleSkillGroups) {
      const text = group.label ? `${group.label}: ${group.items.join(', ')}` : group.items.join(', ')
      children.push(
        new Paragraph({
          alignment: skin.headerCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
          spacing: { after: 50 },
          children: group.label
            ? [
                new TextRun({ text: `${group.label}: `, font: skin.bodyFont, size: skin.bodySize, bold: true, color: '262626' }),
                new TextRun({ text: group.items.join(', '), font: skin.bodyFont, size: skin.bodySize, color: '262626' }),
              ]
            : [new TextRun({ text, font: skin.bodyFont, size: skin.bodySize, color: '262626' })],
        }),
      )
    }
  }

  if (s.hasCertifications) {
    children.push(makeHeading('Certifications', skin))
    for (const c of s.visibleCertifications) {
      const line = [c.name, c.issuer ? `— ${c.issuer}` : '', c.date ? `, ${formatMonthYear(c.date)}` : '']
        .filter(Boolean)
        .join(' ')
      children.push(bodyPara(line, skin, { after: c.url ? 10 : 50 }))
      if (c.url) children.push(metaLine(c.url, skin))
    }
  }

  if (s.hasLanguages) {
    children.push(makeHeading('Languages', skin))
    const text = s.visibleLanguages
      .map((l) => (l.proficiency ? `${l.name} (${l.proficiency})` : l.name))
      .join('   ·   ')
    children.push(bodyPara(text, skin))
  }

  if (s.hasProjects) {
    children.push(makeHeading('Projects', skin))
    for (const p of s.visibleProjects) {
      children.push(bodyPara(p.name, skin, { bold: true, after: 10 }))
      if (p.description) children.push(bodyPara(p.description, skin, { after: 10 }))
      if (p.url) children.push(metaLine(p.url, skin))
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: Math.round(page.width * TWIP_PER_IN),
              height: Math.round(page.height * TWIP_PER_IN),
            },
            margin: {
              top: convertInchesToTwip(MARGIN_Y_IN),
              bottom: convertInchesToTwip(MARGIN_Y_IN),
              left: convertInchesToTwip(MARGIN_X_IN),
              right: convertInchesToTwip(MARGIN_X_IN),
            },
          },
        },
        children,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const fileName = `${sanitizeFileName(data.contact.fullName || 'resume')}-${templateId}.docx`
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
