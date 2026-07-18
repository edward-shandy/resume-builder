const MONTHS: { value: string; label: string }[] = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 60 }, (_, i) => String(CURRENT_YEAR + 5 - i))

interface DateSelectProps {
  label: string
  required?: boolean
  /** "MM/YYYY" or empty string. */
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  wrapperClassName?: string
}

/**
 * Two clean <select> dropdowns (month, year) that compose into a
 * "MM/YYYY" string — avoids free-text date parsing/masking bugs while
 * staying just as fast to fill. Same glassmorphism skin as FormField.
 */
export function DateSelect({
  label,
  required,
  value,
  onChange,
  disabled,
  wrapperClassName = '',
}: DateSelectProps) {
  const [month = '', year = ''] = value ? value.split('/') : []

  const handleMonth = (m: string) => {
    onChange(m && year ? `${m}/${year}` : m ? `${m}/` : year ? `/${year}` : '')
  }
  const handleYear = (y: string) => {
    onChange(month && y ? `${month}/${y}` : y ? `/${y}` : month ? `${month}/` : '')
  }

  const selectClass =
    'rounded-lg border border-white/10 bg-navy-deep/50 px-2.5 py-2 font-body text-sm text-white outline-none transition-all duration-200 focus:border-gold/60 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-gold)_22%,transparent)] disabled:opacity-40 disabled:cursor-not-allowed'

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      <label className="label-readout flex items-center gap-1 text-white/60">
        {label}
        {required && <span className="text-gold">*</span>}
      </label>
      <div className="flex gap-2">
        <select
          aria-label={`${label} month`}
          value={month}
          disabled={disabled}
          onChange={(e) => handleMonth(e.target.value)}
          className={`${selectClass} flex-1`}
        >
          <option value="">MM</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          aria-label={`${label} year`}
          value={year}
          disabled={disabled}
          onChange={(e) => handleYear(e.target.value)}
          className={`${selectClass} flex-[1.3]`}
        >
          <option value="">YYYY</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
