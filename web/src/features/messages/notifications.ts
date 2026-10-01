import type { Message, Recipient } from '@/features/messages/schemas'
import { formatRelativeDateTime, formatTime } from '@/shared/lib/formatters'

export const describeSentNow = (recipients: Recipient[]) => {
  const [onlyRecipient] = recipients
  return recipients.length === 1 && onlyRecipient
    ? `Mensagem enviada para ${onlyRecipient.name}`
    : `Mensagem enviada para ${recipients.length} contatos`
}

export const describeScheduled = (scheduledAt: Date) =>
  `Mensagem agendada para ${formatRelativeDateTime(scheduledAt)}`

export const describeScheduledSent = (messages: Message[]) => {
  const scheduledTimes = new Set(
    messages.flatMap(({ scheduledAt }) => (scheduledAt ? [formatTime(scheduledAt)] : [])),
  )
  const [onlyTime] = scheduledTimes
  const timeLabel = scheduledTimes.size === 1 && onlyTime ? ` para as ${onlyTime}` : ''

  return messages.length === 1
    ? `Mensagem agendada${timeLabel} foi enviada`
    : `${messages.length} mensagens agendadas${timeLabel} foram enviadas`
}