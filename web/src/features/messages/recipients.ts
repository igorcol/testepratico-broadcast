import type { Contact } from '@/features/contacts/schemas'
import type { Recipient } from '@/features/messages/schemas'

export const contactToRecipient = ({ id, name, phone }: Contact): Recipient => ({
  contactId: id,
  name,
  phone,
})

export const buildRecipientOptions = (
  contacts: Contact[],
  currentRecipients: Recipient[],
): Recipient[] => {
  const contactRecipients = contacts.map(contactToRecipient)
  const existingIds = new Set(contactRecipients.map(({ contactId }) => contactId))
  const removedContacts = currentRecipients.filter(({ contactId }) => !existingIds.has(contactId))

  return [...contactRecipients, ...removedContacts]
}

const NAMES_IN_SUMMARY = 2

// Resumo curto pro card
export const summarizeRecipients = (recipients: Recipient[]) => {
  const names = recipients.slice(0, NAMES_IN_SUMMARY).map(({ name }) => name)
  const remaining = recipients.length - names.length

  return remaining > 0 ? `${names.join(', ')} e mais ${remaining}` : names.join(' e ')
}