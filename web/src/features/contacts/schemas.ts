import { z } from 'zod'
import { timestampSchema } from '@/shared/lib/firestore'
import { normalizePhone } from '@/shared/lib/phone'

export const contactSchema = z.object({
  id: z.string(),
  connectionId: z.string(),
  name: z.string(),
  phone: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})

export type Contact = z.infer<typeof contactSchema>

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe o nome do contato.')
    .max(80, 'Use no máximo 80 caracteres.'),
  phone: z
    .string()
    .trim()
    .min(1, 'Informe o telefone.')
    .transform((value, context) => {
      const phone = normalizePhone(value)

      if (!phone) {
        context.addIssue({ code: 'custom', message: 'Telefone inválido. Use DDD e número.' })
        return z.NEVER
      }

      return phone
    }),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>