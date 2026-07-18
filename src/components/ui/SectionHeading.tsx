import type { ReactNode } from 'react'

interface SectionHeadingProps {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
}

/**
 * Consistent heading block used at the top of every section: a small
 * "star coordinate" style monospace eyebrow, a big Fraunces display
 * title, and an optional body-face description line.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'items-center text-center mx-auto' : 'items-start text-left'

  return (
    <div className={`flex flex-col gap-4 ${alignment}`}>
      <span className="label-readout flex items-center gap-3 text-gold">
        <span className="h-px w-8 bg-gold/60" aria-hidden="true" />
        {eyebrow}
      </span>
      <h2 className="font-display text-4xl font-medium leading-[1.1] text-white sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-xl font-body text-base leading-relaxed text-slate sm:text-lg">
          {description}
        </p>
      )}
    </div>
  )
}
