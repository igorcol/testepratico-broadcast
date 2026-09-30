import type { Message } from '@/features/messages/schemas'

export const MESSAGE_FILTERS = ['all', 'scheduled', 'sent'] as const

export type MessageFilter = (typeof MESSAGE_FILTERS)[number]

export const isMessageFilter = (value: string | null): value is MessageFilter =>
  MESSAGE_FILTERS.some((filter) => filter === value)

const timeOf = (date: Date | null) => date?.getTime() ?? 0

const compareMessages = (a: Message, b: Message) => {
  if (a.status !== b.status) return a.status === 'scheduled' ? -1 : 1
  if (a.status === 'scheduled') return timeOf(a.scheduledAt) - timeOf(b.scheduledAt)
  return timeOf(b.sentAt) - timeOf(a.sentAt)
}

const isVisible = (message: Message) => message.status !== 'canceled' // Canceladas não aparecem na tela

export const filterAndSortMessages = (messages: Message[], filter: MessageFilter) =>
  messages
    .filter((message) => isVisible(message) && (filter === 'all' || message.status === filter))
    .toSorted(compareMessages)

export const countMessagesByFilter = (messages: Message[]): Record<MessageFilter, number> => {
  const visibleMessages = messages.filter(isVisible)

  return {
    all: visibleMessages.length,
    scheduled: visibleMessages.filter((message) => message.status === 'scheduled').length,
    sent: visibleMessages.filter((message) => message.status === 'sent').length,
  }
}