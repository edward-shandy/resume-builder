import { type TextareaHTMLAttributes } from 'react'

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label: string
  required?: boolean
  hint?: string
  wrapperClassName?: string
}

/**
 * Multi-line sibling of FormField — same glass skin, but sized so a
 * full example placeholder (like a project description) is actually
 * readable instead of clipped to one line.
 */
export function TextAreaField({
  label,
  required,
  hint,
  id,
  wrapperClassName = '',
  rows = 3,
  ...rest
}: TextAreaFieldProps) {
  const fieldId = id ?? `field-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      <label htmlFor={fieldId} className="field-label flex items-center gap-1">
        {label}
        {required && <span className="text-gold" aria-hidden="true">*</span>}
      </label>
      <textarea
        id={fieldId}
        rows={rows}
        className="resize-y rounded-lg border border-white/10 bg-navy-deep/50 px-4 py-2 font-body text-sm text-white placeholder:text-white/25 outline-none transition-all duration-200 hover:border-white/20 hover:bg-navy-deep/70 focus:border-gold focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-gold)_35%,transparent)]"
        {...rest}
      />
      {hint && <span className="font-body text-xs text-white/35">{hint}</span>}
    </div>
  )
}
