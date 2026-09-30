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