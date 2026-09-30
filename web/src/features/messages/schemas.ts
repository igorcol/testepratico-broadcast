import { z } from 'zod'
import { timestampSchema } from '@/shared/lib/firestore'

export const MAX_RECIPIENTS = 500
export const MAX_CONTENT_LENGTH = 1000

export const recipientSchema = z.object({
  contactId: z.string(),
  name: z.string(),
  phone: z.string(),
})

export type Recipient = z.infer<typeof recipientSchema>

export const messageSchema = z.object({
  id: z.string(),
  connectionId: z.string(),
  content: z.string(),
  recipients: z.array(recipientSchema),
  status: z.enum(['scheduled', 'sent', 'canceled']),
  scheduledAt: timestampSchema.nullable(),
  sentAt: timestampSchema.nullable(),
  editedAt: timestampSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})

export type Message = z.infer<typeof messageSchema>

export type MessageStatus = Message['status']

const contactIdsField = z
  .string()
  .transform((value) => value.split(',').filter(Boolean))
  .pipe(
    z
      .array(z.string())
      .min(1, 'Selecione pelo menos um contato.')
      .max(MAX_RECIPIENTS, `Selecione no máximo ${MAX_RECIPIENTS} contatos.`),
  )

const contentField = z
  .string()
  .trim()
  .min(1, 'Escreva a mensagem.')
  .max(MAX_CONTENT_LENGTH, `Use no máximo ${MAX_CONTENT_LENGTH} caracteres.`)

const futureDateField = z
  .string()
  .min(1, 'Escolha a data e o horário.')
  .transform((value) => new Date(value))
  .refine((date) => !Number.isNaN(date.getTime()), 'Data inválida.')
  .refine((date) => date.getTime() > Date.now(), 'Escolha um horário no futuro.')

export const sentMessageEditSchema = z.object({
  contactIds: contactIdsField,
  content: contentField,
})

export const scheduledMessageEditSchema = sentMessageEditSchema.extend({
  scheduledAt: futureDateField,
})

export const newMessageSchema = z.discriminatedUnion('sendMode', [
  sentMessageEditSchema.extend({ sendMode: z.literal('now') }),
  scheduledMessageEditSchema.extend({ sendMode: z.literal('schedule') }),
])

export type NewMessageValues = z.infer<typeof newMessageSchema>