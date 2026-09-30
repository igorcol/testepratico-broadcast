import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { sendDueMessages } from '../src/messages/sendDueMessages'

// Projeto demo- isolado
const testApp = initializeApp({ projectId: 'demo-broadcast-functions' }, 'send-due-messages-test')
const db = getFirestore(testApp)
const messagesCollection = db.collection('messages')

// Relógio ficticio
const NOW = Timestamp.fromDate(new Date('2026-09-30T12:00:00Z'))

const minutesFromNow = (minutes: number) => Timestamp.fromMillis(NOW.toMillis() + minutes * 60_000)

const seedMessage = (messageId: string, overrides: Record<string, unknown> = {}) =>
  messagesCollection.doc(messageId).set({
    tenantId: 'ana',
    connectionId: 'ana-connection',
    content: 'Promoção de hoje!',
    recipients: [{ contactId: 'contact-1', name: 'Maria Souza', phone: '+5511999998888' }],
    status: 'scheduled',
    scheduledAt: minutesFromNow(-1),
    sentAt: null,
    editedAt: null,
    createdAt: minutesFromNow(-60),
    updatedAt: minutesFromNow(-60),
    ...overrides,
  })

const getMessage = async (messageId: string) => (await messagesCollection.doc(messageId).get()).data()

beforeEach(async () => {
  await db.recursiveDelete(messagesCollection)
})

afterAll(async () => {
  await deleteApp(testApp)
})

describe('sendDueMessages', () => {
  it('marca como enviada a agendada cujo horário já passou', async () => {
    await seedMessage('due')

    const sentCount = await sendDueMessages(db, NOW)
    const message = await getMessage('due')

    expect(sentCount).toBe(1)
    expect(message?.status).toBe('sent')
    expect(message?.sentAt).toBeInstanceOf(Timestamp)
  })

  it('mantém a data original do agendamento', async () => {
    await seedMessage('due')

    await sendDueMessages(db, NOW)
    const message = await getMessage('due')

    expect(message?.scheduledAt).toEqual(minutesFromNow(-1))
  })

  it('não mexe em agendada do futuro', async () => {
    await seedMessage('future', { scheduledAt: minutesFromNow(10) })

    const sentCount = await sendDueMessages(db, NOW)

    expect(sentCount).toBe(0)
    expect((await getMessage('future'))?.status).toBe('scheduled')
  })

  it('não mexe em mensagem enviada ou cancelada', async () => {
    await seedMessage('sent', { status: 'sent', sentAt: minutesFromNow(-5) })
    await seedMessage('canceled', { status: 'canceled' })

    const sentCount = await sendDueMessages(db, NOW)

    expect(sentCount).toBe(0)
    expect((await getMessage('sent'))?.sentAt).toEqual(minutesFromNow(-5))
    expect((await getMessage('canceled'))?.status).toBe('canceled')
  })

  it('processa mais de um lote', { timeout: 30_000 }, async () => {
    await Promise.all(Array.from({ length: 501 }, (_, index) => seedMessage(`due-${index}`)))

    const sentCount = await sendDueMessages(db, NOW)

    expect(sentCount).toBe(501)
  })
})