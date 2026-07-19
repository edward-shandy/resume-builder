const MONTH_ABBR: Record<string, string> = {
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Aug',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec',
}

/**
 * "MM/YYYY" -> "Mar 2021", matching the Jan-Dec labels used by
 * DateSelect so the printable preview never shows a raw numeric month.
 * Invalid or partial input degrades gracefully instead of ever
 * producing "NaN": unknown month -> just the year (or vice versa),
 * completely empty/unparseable -> the original string as-is.
 */
export function formatMonthYear(value: string): string {
  if (!value) return ''
  const match = /^(\d{2})\/(\d{4})$/.exec(value)
  if (!match) {
    // Partial values like "03/" or "/2021" from an in-progress DateSelect.
    const [month, year] = value.split('/')
    const abbr = month ? MONTH_ABBR[month] : undefined
    if (abbr && year) return `${abbr} ${year}`
    if (abbr) return abbr
    if (year) return year
    return value
  }
  const [, month, year] = match
  const abbr = MONTH_ABBR[month]
  return abbr ? `${abbr} ${year}` : value
}
