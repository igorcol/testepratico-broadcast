import { deleteApp } from 'firebase-admin/app'
import { Timestamp } from 'firebase-admin/firestore'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { sendDueMessages } from '../src/messages/sendDueMessages'
import { clearMessages, createTestDb, getMessage, minutesFromNow, NOW, seedMessage } from './helpers'

const { app, db } = createTestDb('send-due-messages-test')

beforeEach(async () => {
  await clearMessages(db)
})

afterAll(async () => {
  await deleteApp(app)
})

describe('sendDueMessages', () => {
  it('marca como enviada a agendada cujo horário já passou', async () => {
    await seedMessage(db, 'due')

    const sentCount = await sendDueMessages(db, NOW)
    const message = await getMessage(db, 'due')

    expect(sentCount).toBe(1)
    expect(message?.status).toBe('sent')
    expect(message?.sentAt).toBeInstanceOf(Timestamp)
  })

  it('mantém a data original do agendamento', async () => {
    await seedMessage(db, 'due')

    await sendDueMessages(db, NOW)

    expect((await getMessage(db, 'due'))?.scheduledAt).toEqual(minutesFromNow(-1))
  })

  it('não mexe em agendada do futuro', async () => {
    await seedMessage(db, 'future', { scheduledAt: minutesFromNow(10) })

    const sentCount = await sendDueMessages(db, NOW)

    expect(sentCount).toBe(0)
    expect((await getMessage(db, 'future'))?.status).toBe('scheduled')
  })

  it('não mexe em mensagem enviada ou cancelada', async () => {
    await seedMessage(db, 'sent', { status: 'sent', sentAt: minutesFromNow(-5) })
    await seedMessage(db, 'canceled', { status: 'canceled' })

    const sentCount = await sendDueMessages(db, NOW)

    expect(sentCount).toBe(0)
    expect((await getMessage(db, 'sent'))?.sentAt).toEqual(minutesFromNow(-5))
    expect((await getMessage(db, 'canceled'))?.status).toBe('canceled')
  })

  it('processa mais de um lote', { timeout: 30_000 }, async () => {
    await Promise.all(Array.from({ length: 501 }, (_, index) => seedMessage(db, `due-${index}`)))

    const sentCount = await sendDueMessages(db, NOW)

    expect(sentCount).toBe(501)
  })
})