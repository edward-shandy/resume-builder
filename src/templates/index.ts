import type { ComponentType } from 'react'
import type { ResumeData } from '../store/resumeStore'
import type { PaperSizeId } from './NorthStarClassic/paperSizes'
import { NorthStarClassicPaper } from './NorthStarClassic/NorthStarClassicPaper'
import { ExecutivePaper } from './Executive/ExecutivePaper'
import { CompactPaper } from './Compact/CompactPaper'
import { ModernPaper } from './Modern/ModernPaper'

export type TemplateId = 'classic' | 'executive' | 'compact' | 'modern'

export interface TemplatePaperProps {
  data: ResumeData
  paperSize?: PaperSizeId
  frame?: 'screen' | 'print'
}

export interface TemplateDef {
  id: TemplateId
  name: string
  description: string
  component: ComponentType<TemplatePaperProps>
}

/**
 * Single source of truth for every ATS resume template. Every entry's
 * component accepts the same props (`data`, `paperSize`, `frame`), so
 * callers can swap templates by id without branching on shape.
 */
export const TEMPLATES: TemplateDef[] = [
  {
    id: 'classic',
    name: 'NorthStar Classic',
    description: 'Balanced single-column layout with a teal accent rule.',
    component: NorthStarClassicPaper,
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Centered, formal, generously spaced — old-money professional.',
    component: ExecutivePaper,
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Dense modern layout that fits more experience on one page.',
    component: CompactPaper,
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Bold name with a solid navy accent rule and navy headings.',
    component: ModernPaper,
  },
]

export const DEFAULT_TEMPLATE_ID: TemplateId = 'classic'

export function getTemplate(id: TemplateId): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
}
