import { type InputHTMLAttributes, type Ref } from 'react'

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string
  required?: boolean
  hint?: string
  inputRef?: Ref<HTMLInputElement>
  wrapperClassName?: string
}

/**
 * Glassmorphism text field for the wizard: translucent navy fill,
 * hairline white border, gold glow ring on focus. Label is the small
 * tracked-out mono style used everywhere else in NorthStar.
 */
export function FormField({
  label,
  required,
  hint,
  inputRef,
  id,
  wrapperClassName = '',
  ...rest
}: FormFieldProps) {
  const fieldId = id ?? `field-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      <label htmlFor={fieldId} className="field-label flex items-center gap-1">
        {label}
        {required && <span className="text-gold" aria-hidden="true">*</span>}
      </label>
      <input
        ref={inputRef}
        id={fieldId}
        className="rounded-lg border border-white/10 bg-navy-deep/50 px-4 py-2 font-body text-sm text-white placeholder:text-white/25 outline-none transition-all duration-200 hover:border-white/20 hover:bg-navy-deep/70 focus:border-gold focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-gold)_35%,transparent)]"
        {...rest}
      />
      {hint && <span className="font-body text-xs text-white/35">{hint}</span>}
    </div>
  )
}
