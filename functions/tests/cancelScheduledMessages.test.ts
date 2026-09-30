import { deleteApp } from 'firebase-admin/app'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { cancelScheduledMessages } from '../src/messages/cancelScheduledMessages'
import { clearMessages, createTestDb, getMessage, minutesFromNow, seedMessage } from './helpers'

const { app, db } = createTestDb('cancel-scheduled-messages-test')

beforeEach(async () => {
  await clearMessages(db)
})

afterAll(async () => {
  await deleteApp(app)
})

describe('cancelScheduledMessages', () => {
  it('cancela as agendadas da conexão', async () => {
    await seedMessage(db, 'scheduled', { scheduledAt: minutesFromNow(30) })

    const canceledCount = await cancelScheduledMessages(db, 'ana-connection')

    expect(canceledCount).toBe(1)
    expect((await getMessage(db, 'scheduled'))?.status).toBe('canceled')
  })

  it('mantém as enviadas no histórico', async () => {
    await seedMessage(db, 'sent', { status: 'sent', sentAt: minutesFromNow(-5) })

    await cancelScheduledMessages(db, 'ana-connection')

    expect((await getMessage(db, 'sent'))?.status).toBe('sent')
  })

  it('não mexe nas mensagens de outra conexão', async () => {
    await seedMessage(db, 'other', { connectionId: 'other-connection' })

    const canceledCount = await cancelScheduledMessages(db, 'ana-connection')

    expect(canceledCount).toBe(0)
    expect((await getMessage(db, 'other'))?.status).toBe('scheduled')
  })

  it('rodar duas vezes dá o mesmo resultado', async () => {
    await seedMessage(db, 'scheduled', { scheduledAt: minutesFromNow(30) })

    await cancelScheduledMessages(db, 'ana-connection')
    const secondRunCount = await cancelScheduledMessages(db, 'ana-connection')

    expect(secondRunCount).toBe(0)
    expect((await getMessage(db, 'scheduled'))?.status).toBe('canceled')
  })
})