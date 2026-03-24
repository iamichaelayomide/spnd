export type TimeTheme = 'morning' | 'afternoon' | 'evening' | 'night'

export function getTimeTheme(date = new Date()): TimeTheme {
  const h = date.getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}
