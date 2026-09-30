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
const ANA_DELETED_CONNECTION_ID = 'ana-deleted-connection'
const IGOR_CONNECTION_ID = 'igor-connection'
const MESSAGE_ID = 'message-1'

const RECIPIENTS = [{ contactId: 'contact-1', name: 'Maria Souza', phone: '+5511999998888' }]

let testEnv: RulesTestEnvironment

const firestoreAs = (uid: string) => testEnv.authenticatedContext(uid).firestore()
const messageRefAs = (uid: string) => doc(firestoreAs(uid), 'messages', MESSAGE_ID)

const minutesFromNow = (minutes: number) => Timestamp.fromMillis(Date.now() + minutes * 60_000)

const buildExistingConnection = (tenantId: string, deletedAt: Timestamp | null = null) => ({
  tenantId,
  name: 'WhatsApp Vendas',
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  deletedAt,
})

const buildImmediateMessage = (tenantId: string, connectionId: string) => ({
  tenantId,
  connectionId,
  content: 'Promoção de hoje!',
  recipients: RECIPIENTS,
  status: 'sent',
  scheduledAt: null,
  sentAt: serverTimestamp(),
  editedAt: null,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})

const buildScheduledMessage = (tenantId: string, connectionId: string) => ({
  ...buildImmediateMessage(tenantId, connectionId),
  status: 'scheduled',
  scheduledAt: minutesFromNow(30),
  sentAt: null,
})

const seedMessage = (overrides: Record<string, unknown> = {}) =>
  seedDocument(testEnv, 'messages', MESSAGE_ID, {
    tenantId: ANA_UID,
    connectionId: ANA_CONNECTION_ID,
    content: 'Promoção de hoje!',
    recipients: RECIPIENTS,
    status: 'scheduled',
    scheduledAt: minutesFromNow(30),
    sentAt: null,
    editedAt: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ...overrides,
  })

const seedSentMessage = () =>
  seedMessage({ status: 'sent', scheduledAt: minutesFromNow(-10), sentAt: minutesFromNow(-9) })

beforeAll(async () => {
  testEnv = await createRulesTestEnvironment()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
  await seedDocument(testEnv, 'connections', ANA_CONNECTION_ID, buildExistingConnection(ANA_UID))
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

describe('messages: leitura', () => {
  it('dono lê a própria mensagem', async () => {
    await seedMessage()
    await assertSucceeds(getDoc(messageRefAs(ANA_UID)))
  })

  it('outro cliente não lê a mensagem', async () => {
    await seedMessage()
    await assertFails(getDoc(messageRefAs(IGOR_UID)))
  })

  it('dono lista as mensagens da conexão filtrando pelo tenant', async () => {
    await seedMessage()
    const messagesQuery = query(
      collection(firestoreAs(ANA_UID), 'messages'),
      where('tenantId', '==', ANA_UID),
      where('connectionId', '==', ANA_CONNECTION_ID),
    )
    await assertSucceeds(getDocs(messagesQuery))
  })
})

describe('messages: criação', () => {
  it('envia agora', async () => {
    await assertSucceeds(
      setDoc(messageRefAs(ANA_UID), buildImmediateMessage(ANA_UID, ANA_CONNECTION_ID)),
    )
  })

  it('agenda para o futuro', async () => {
    await assertSucceeds(
      setDoc(messageRefAs(ANA_UID), buildScheduledMessage(ANA_UID, ANA_CONNECTION_ID)),
    )
  })

  it('não agenda para o passado', async () => {
    const message = {
      ...buildScheduledMessage(ANA_UID, ANA_CONNECTION_ID),
      scheduledAt: minutesFromNow(-5),
    }
    await assertFails(setDoc(messageRefAs(ANA_UID), message))
  })

  it('não forja a data de envio', async () => {
    const message = {
      ...buildImmediateMessage(ANA_UID, ANA_CONNECTION_ID),
      sentAt: minutesFromNow(-60),
    }
    await assertFails(setDoc(messageRefAs(ANA_UID), message))
  })

  it('não cria enviada com data de agendamento', async () => {
    const message = {
      ...buildImmediateMessage(ANA_UID, ANA_CONNECTION_ID),
      scheduledAt: minutesFromNow(30),
    }
    await assertFails(setDoc(messageRefAs(ANA_UID), message))
  })

  it('não cria mensagem já cancelada', async () => {
    const message = {
      ...buildScheduledMessage(ANA_UID, ANA_CONNECTION_ID),
      status: 'canceled',
    }
    await assertFails(setDoc(messageRefAs(ANA_UID), message))
  })

  it('não cria na conexão de outro cliente', async () => {
    await assertFails(
      setDoc(messageRefAs(ANA_UID), buildImmediateMessage(ANA_UID, IGOR_CONNECTION_ID)),
    )
  })

  it('não cria em conexão excluída', async () => {
    await assertFails(
      setDoc(messageRefAs(ANA_UID), buildImmediateMessage(ANA_UID, ANA_DELETED_CONNECTION_ID)),
    )
  })

  it('recusa mensagem sem destinatários', async () => {
    const message = { ...buildImmediateMessage(ANA_UID, ANA_CONNECTION_ID), recipients: [] }
    await assertFails(setDoc(messageRefAs(ANA_UID), message))
  })

  it('recusa mais de 500 destinatários', async () => {
    const recipients = Array.from({ length: 501 }, (_, index) => ({
      contactId: `contact-${index}`,
      name: `Contato ${index}`,
      phone: '+5511999998888',
    }))
    const message = { ...buildImmediateMessage(ANA_UID, ANA_CONNECTION_ID), recipients }
    await assertFails(setDoc(messageRefAs(ANA_UID), message))
  })

  it('recusa texto só com espaços', async () => {
    const message = { ...buildImmediateMessage(ANA_UID, ANA_CONNECTION_ID), content: '   ' }
    await assertFails(setDoc(messageRefAs(ANA_UID), message))
  })

  it('recusa texto com mais de 1000 caracteres', async () => {
    const message = {
      ...buildImmediateMessage(ANA_UID, ANA_CONNECTION_ID),
      content: 'a'.repeat(1001),
    }
    await assertFails(setDoc(messageRefAs(ANA_UID), message))
  })
})

describe('messages: edição', () => {
  it('dono edita o texto de uma agendada', async () => {
    await seedMessage()
    await assertSucceeds(
      updateDoc(messageRefAs(ANA_UID), {
        content: 'Texto novo',
        editedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('dono reagenda para outra data futura', async () => {
    await seedMessage()
    await assertSucceeds(
      updateDoc(messageRefAs(ANA_UID), {
        scheduledAt: minutesFromNow(120),
        editedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('não reagenda para o passado', async () => {
    await seedMessage()
    await assertFails(
      updateDoc(messageRefAs(ANA_UID), {
        scheduledAt: minutesFromNow(-5),
        editedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('cliente não marca uma agendada como enviada', async () => {
    await seedMessage()
    await assertFails(
      updateDoc(messageRefAs(ANA_UID), {
        status: 'sent',
        sentAt: serverTimestamp(),
        editedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('dono edita o texto de uma enviada', async () => {
    await seedSentMessage()
    await assertSucceeds(
      updateDoc(messageRefAs(ANA_UID), {
        content: 'Texto corrigido',
        editedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('não muda a data de uma enviada', async () => {
    await seedSentMessage()
    await assertFails(
      updateDoc(messageRefAs(ANA_UID), {
        scheduledAt: minutesFromNow(60),
        editedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('não edita mensagem cancelada', async () => {
    await seedMessage({ status: 'canceled' })
    await assertFails(
      updateDoc(messageRefAs(ANA_UID), {
        content: 'Texto novo',
        editedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('não edita sem marcar como editada', async () => {
    await seedMessage()
    await assertFails(
      updateDoc(messageRefAs(ANA_UID), { content: 'Texto novo', updatedAt: serverTimestamp() }),
    )
  })

  it('outro cliente não edita a mensagem', async () => {
    await seedMessage()
    await assertFails(
      updateDoc(messageRefAs(IGOR_UID), {
        content: 'Invadido',
        editedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
  })
})

describe('messages: exclusão', () => {
  it('dono exclui a mensagem', async () => {
    await seedMessage()
    await assertSucceeds(deleteDoc(messageRefAs(ANA_UID)))
  })

  it('outro cliente não exclui a mensagem', async () => {
    await seedMessage()
    await assertFails(deleteDoc(messageRefAs(IGOR_UID)))
  })
})