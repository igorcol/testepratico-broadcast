import type { Contact } from '@/features/contacts/schemas'
import { toDigits } from '@/shared/lib/phone'

export const CONTACT_SORT_OPTIONS = ['name-asc', 'name-desc', 'recent'] as const

export type ContactSort = (typeof CONTACT_SORT_OPTIONS)[number]

export const isContactSort = (value: string | null): value is ContactSort =>
  CONTACT_SORT_OPTIONS.some((option) => option === value)

const nameCollator = new Intl.Collator('pt-BR', { sensitivity: 'base' })

const removeAccents = (value: string) =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

// Nome ignora acento e caps. Telefone compara só os dígitos
const matchesSearch = (contact: Contact, search: string) => {
  const normalizedSearch = removeAccents(search.trim())
  if (!normalizedSearch) return true

  const searchDigits = toDigits(search)
  const matchesName = removeAccents(contact.name).includes(normalizedSearch)
  const matchesPhone = searchDigits.length > 0 && contact.phone.includes(searchDigits)

  return matchesName || matchesPhone
}

const contactComparators: Record<ContactSort, (a: Contact, b: Contact) => number> = {
  'name-asc': (a, b) => nameCollator.compare(a.name, b.name),
  'name-desc': (a, b) => nameCollator.compare(b.name, a.name),
  recent: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
}

export const filterAndSortContacts = (contacts: Contact[], search: string, sort: ContactSort) =>
  contacts.filter((contact) => matchesSearch(contact, search)).toSorted(contactComparators[sort])