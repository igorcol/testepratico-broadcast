import { describe, expect, it } from 'vitest'
import { filterAndSortContacts } from '@/features/contacts/filterContacts'
import type { Contact } from '@/features/contacts/schemas'

const buildContact = (name: string, phone: string, createdAt: string): Contact => ({
  id: name,
  connectionId: 'connection-1',
  name,
  phone,
  createdAt: new Date(createdAt),
  updatedAt: new Date(createdAt),
})

const contacts = [
  buildContact('Bruno Lima', '+5511988887777', '2026-09-01'),
  buildContact('João Silva', '+5521999998888', '2026-09-03'),
  buildContact('Álvaro Souza', '+14155552671', '2026-09-02'),
]

const namesOf = (list: Contact[]) => list.map((contact) => contact.name)

describe('filterAndSortContacts', () => {
  it('sem busca devolve todos em ordem alfabética', () => {
    expect(namesOf(filterAndSortContacts(contacts, '', 'name-asc'))).toEqual([
      'Álvaro Souza',
      'Bruno Lima',
      'João Silva',
    ])
  })

  it('ordena de Z a A', () => {
    expect(namesOf(filterAndSortContacts(contacts, '', 'name-desc'))).toEqual([
      'João Silva',
      'Bruno Lima',
      'Álvaro Souza',
    ])
  })

  it('ordena pelos mais recentes', () => {
    expect(namesOf(filterAndSortContacts(contacts, '', 'recent'))).toEqual([
      'João Silva',
      'Álvaro Souza',
      'Bruno Lima',
    ])
  })

  it('busca por nome ignorando acento e maiúscula', () => {
    expect(namesOf(filterAndSortContacts(contacts, 'JOAO', 'name-asc'))).toEqual(['João Silva'])
  })

  it('busca por telefone digitado com máscara', () => {
    expect(namesOf(filterAndSortContacts(contacts, '(21) 99999', 'name-asc'))).toEqual([
      'João Silva',
    ])
  })

  it('não altera a lista original', () => {
    const original = [...contacts]
    filterAndSortContacts(contacts, '', 'name-asc')
    expect(contacts).toEqual(original)
  })
})