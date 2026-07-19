import { SelectField } from './SelectField'

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
const YEAR_OPTIONS = Array.from({ length: 60 }, (_, i) => {
  const y = String(CURRENT_YEAR + 5 - i)
  return { value: y, label: y }
})

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
 * Two custom SelectFields (month, year) that compose into a "MM/YYYY"
 * string — avoids free-text date parsing/masking bugs while staying
 * just as fast to fill. Same glassmorphism skin as FormField, with a
 * themed listbox popover instead of the unstyled native <select> menu.
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

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      <label className="field-label flex items-center gap-1">
        {label}
        {required && <span className="text-gold" aria-hidden="true">*</span>}
      </label>
      <div className="flex gap-2">
        <SelectField
          label={`${label} month`}
          hideLabel
          value={month}
          onChange={handleMonth}
          options={MONTHS}
          placeholder="MM"
          disabled={disabled}
          wrapperClassName="flex-1"
        />
        <SelectField
          label={`${label} year`}
          hideLabel
          value={year}
          onChange={handleYear}
          options={YEAR_OPTIONS}
          placeholder="YYYY"
          disabled={disabled}
          wrapperClassName="flex-[1.3]"
        />
      </div>
    </div>
  )
}
