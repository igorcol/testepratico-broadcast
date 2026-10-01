const AVATAR_COLORS = [
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-teal-100 text-teal-700',
]

const DEFAULT_AVATAR_COLOR = 'bg-emerald-100 text-emerald-700'

export const getAvatarColorClasses = (name: string) => {
  const charSum = [...name].reduce((sum, char) => sum + (char.codePointAt(0) ?? 0), 0)
  return AVATAR_COLORS[charSum % AVATAR_COLORS.length] ?? DEFAULT_AVATAR_COLOR
}

export const getInitials = (name: string) => {
  const words = name.trim().split(/\s+/)
  const first = words[0]?.charAt(0) ?? ''
  const last = words.length > 1 ? (words.at(-1)?.charAt(0) ?? '') : ''
  return (first + last).toUpperCase()
}