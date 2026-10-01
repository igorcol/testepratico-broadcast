
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export const formatDateTime = (date: Date) => dateTimeFormatter.format(date)

const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const dayMonthFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })
const fullDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const DAY_IN_MS = 86_400_000

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const formatTime = (date: Date) => timeFormatter.format(date)

export const isSameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime()

export const formatRelativeDateTime = (date: Date, now = new Date()) => {
  
  const dayDifference = Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / DAY_IN_MS)
  const time = formatTime(date)

  if (dayDifference === 0) return `hoje às ${time}`
  if (dayDifference === -1) return `ontem às ${time}`
  if (dayDifference === 1) return `amanhã às ${time}`

  const day =
    date.getFullYear() === now.getFullYear()
      ? dayMonthFormatter.format(date)
      : fullDateFormatter.format(date)

  return `${day} às ${time}`
}