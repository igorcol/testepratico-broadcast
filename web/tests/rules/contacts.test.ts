import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { createRulesTestEnvironment, seedDocument } from './testEnvironment.ts'

const ANA_UID = 'ana'
const IGOR_UID = 'igor'
const ANA_CONNECTION_ID = 'ana-connection'
const ANA_OTHER_CONNECTION_ID = 'ana-other-connection'
const ANA_DELETED_CONNECTION_ID = 'ana-deleted-connection'
const IGOR_CONNECTION_ID = 'igor-connection'
const CONTACT_ID = 'contact-1'
const VALID_PHONE = '+5511999998888'

let testEnv: RulesTestEnvironment

const firestoreAs = (uid: string) => testEnv.authenticatedContext(uid).firestore()
const contactRefAs = (uid: string) => doc(firestoreAs(uid), 'contacts', CONTACT_ID)

const buildExistingConnection = (tenantId: string, deletedAt: Timestamp | null = null) => ({
  tenantId,
  name: 'WhatsApp Vendas',
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  deletedAt,
})

const buildNewContact = (tenantId: string, connectionId: string) => ({
  tenantId,
  connectionId,
  name: 'Maria Souza',
  phone: VALID_PHONE,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})

const seedContact = (overrides: Record<string, unknown> = {}) =>
  seedDocument(testEnv, 'contacts', CONTACT_ID, {
    tenantId: ANA_UID,
    connectionId: ANA_CONNECTION_ID,
    name: 'Maria Souza',
    phone: VALID_PHONE,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ...overrides,
  })

beforeAll(async () => {
  testEnv = await createRulesTestEnvironment()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
  await seedDocument(testEnv, 'connections', ANA_CONNECTION_ID, buildExistingConnection(ANA_UID))
  await seedDocument(testEnv, 'connections', ANA_OTHER_CONNECTION_ID, buildExistingConnection(ANA_UID))
  await seedDocument(
    testEnv,
    'connections',
    ANA_DELETED_CONNECTION_ID,
    buildExistingConnection(ANA_UID, Timestamp.now()),
  )
  await seedDocument(testEnv, 'connections', IGOR_CONNECTION_ID, buildExistingConnection(IGOR_UID))
})

afterAll(async () => {
  await testEnv.cleanup()
})

describe('contacts: leitura', () => {
  it('dono lê o próprio contato', async () => {
    await seedContact()
    await assertSucceeds(getDoc(contactRefAs(ANA_UID)))
  })

  it('outro cliente não lê o contato', async () => {
    await seedContact()
    await assertFails(getDoc(contactRefAs(IGOR_UID)))
  })

  it('dono lista os contatos da conexão filtrando pelo tenant', async () => {
    await seedContact()
    const contactsQuery = query(
      collection(firestoreAs(ANA_UID), 'contacts'),
      where('tenantId', '==', ANA_UID),
      where('connectionId', '==', ANA_CONNECTION_ID),
    )
    await assertSucceeds(getDocs(contactsQuery))
  })

  it('outro cliente não lista contatos sabendo o id da conexão', async () => {
    await seedContact()
    const contactsQuery = query(
      collection(firestoreAs(IGOR_UID), 'contacts'),
      where('connectionId', '==', ANA_CONNECTION_ID),
    )
    await assertFails(getDocs(contactsQuery))
  })
})

describe('contacts: criação', () => {
  it('cria contato válido na própria conexão', async () => {
    await assertSucceeds(setDoc(contactRefAs(ANA_UID), buildNewContact(ANA_UID, ANA_CONNECTION_ID)))
  })

  it('não cria contato na conexão de outro cliente, mesmo usando o próprio tenantId', async () => {
    await assertFails(setDoc(contactRefAs(ANA_UID), buildNewContact(ANA_UID, IGOR_CONNECTION_ID)))
  })

  it('não cria contato com o tenantId de outro cliente', async () => {
    await assertFails(setDoc(contactRefAs(ANA_UID), buildNewContact(IGOR_UID, IGOR_CONNECTION_ID)))
  })

  it('não cria contato em conexão excluída', async () => {
    await assertFails(
      setDoc(contactRefAs(ANA_UID), buildNewContact(ANA_UID, ANA_DELETED_CONNECTION_ID)),
    )
  })

  it('não cria contato em conexão inexistente', async () => {
    await assertFails(setDoc(contactRefAs(ANA_UID), buildNewContact(ANA_UID, 'connection-fantasma')))
  })

  it('recusa telefone fora do padrão internacional', async () => {
    const contact = { ...buildNewContact(ANA_UID, ANA_CONNECTION_ID), phone: '11999998888' }
    await assertFails(setDoc(contactRefAs(ANA_UID), contact))
  })

  it('recusa nome só com espaços', async () => {
    const contact = { ...buildNewContact(ANA_UID, ANA_CONNECTION_ID), name: '   ' }
    await assertFails(setDoc(contactRefAs(ANA_UID), contact))
  })

  it('recusa campo fora da lista permitida', async () => {
    const contact = { ...buildNewContact(ANA_UID, ANA_CONNECTION_ID), email: 'maria@email.com' }
    await assertFails(setDoc(contactRefAs(ANA_UID), contact))
  })
})

describe('contacts: edição', () => {
  it('dono edita nome e telefone', async () => {
    await seedContact()
    await assertSucceeds(
      updateDoc(contactRefAs(ANA_UID), {
        name: 'Maria S.',
        phone: '+5521988887777',
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('outro cliente não edita o contato', async () => {
    await seedContact()
    await assertFails(
      updateDoc(contactRefAs(IGOR_UID), { name: 'Invadido', updatedAt: serverTimestamp() }),
    )
  })

  it('não move o contato para outra conexão, mesmo do mesmo dono', async () => {
    await seedContact()
    await assertFails(
      updateDoc(contactRefAs(ANA_UID), {
        connectionId: ANA_OTHER_CONNECTION_ID,
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('recusa telefone inválido na edição', async () => {
    await seedContact()
    await assertFails(
      updateDoc(contactRefAs(ANA_UID), { phone: 'abc', updatedAt: serverTimestamp() }),
    )
  })

  it('não edita contato de conexão excluída', async () => {
    await seedContact({ connectionId: ANA_DELETED_CONNECTION_ID })
    await assertFails(
      updateDoc(contactRefAs(ANA_UID), { name: 'Maria S.', updatedAt: serverTimestamp() }),
    )
  })
})

describe('contacts: exclusão', () => {
  it('dono exclui o contato', async () => {
    await seedContact()
    await assertSucceeds(deleteDoc(contactRefAs(ANA_UID)))
  })

  it('outro cliente não exclui o contato', async () => {
    await seedContact()
    await assertFails(deleteDoc(contactRefAs(IGOR_UID)))
  })

  it('não exclui contato de conexão excluída', async () => {
    await seedContact({ connectionId: ANA_DELETED_CONNECTION_ID })
    await assertFails(deleteDoc(contactRefAs(ANA_UID)))
  })
})