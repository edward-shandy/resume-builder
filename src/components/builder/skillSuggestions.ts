/**
 * Static, curated skill suggestions keyed off a skill group's label.
 * Deliberately not API-backed — a hand-picked list is instant, works
 * offline, and never returns anything weird. Matching is a simple
 * case-insensitive keyword scan so "Technical Skills", "Tech Stack",
 * etc. all hit the same bucket.
 */
const TECHNICAL = [
  'JavaScript',
  'TypeScript',
  'Python',
  'React',
  'Node.js',
  'SQL',
  'Git',
  'Docker',
  'AWS',
  'REST API',
  'CI/CD',
  'Playwright',
]

const SOFT = [
  'Communication',
  'Leadership',
  'Problem Solving',
  'Teamwork',
  'Time Management',
  'Adaptability',
  'Critical Thinking',
]

const TOOLS = ['Jira', 'Figma', 'Excel', 'Notion', 'Slack', 'GitHub', 'Postman']

// Default bucket for anything that doesn't match a known keyword — a
// mixed spread of generally-popular skills across categories.
const POPULAR_MIX = [
  'Communication',
  'JavaScript',
  'Git',
  'Leadership',
  'Excel',
  'Problem Solving',
  'SQL',
  'Notion',
  'Teamwork',
  'Docker',
]

export function getSkillSuggestions(groupLabel: string): string[] {
  const label = groupLabel.toLowerCase()
  if (label.includes('technical') || label.includes('tech')) return TECHNICAL
  if (label.includes('soft')) return SOFT
  if (label.includes('tool') || label.includes('platform')) return TOOLS
  return POPULAR_MIX
}
