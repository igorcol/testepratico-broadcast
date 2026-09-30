import { initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp, type Firestore } from 'firebase-admin/firestore'

// Relógio fixo
export const NOW = Timestamp.fromDate(new Date('2026-09-30T12:00:00Z'))

export const minutesFromNow = (minutes: number) =>
  Timestamp.fromMillis(NOW.toMillis() + minutes * 60_000)

// Cada arquivo de teste cria um  app com nome próprio
export const createTestDb = (appName: string) => {
  const app = initializeApp({ projectId: 'demo-broadcast-functions' }, appName)
  return { app, db: getFirestore(app) }
}

export const seedMessage = (
  db: Firestore,
  messageId: string,
  overrides: Record<string, unknown> = {},
) =>
  db
    .collection('messages')
    .doc(messageId)
    .set({
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

export const getMessage = async (db: Firestore, messageId: string) =>
  (await db.collection('messages').doc(messageId).get()).data()

export const clearMessages = (db: Firestore) => db.recursiveDelete(db.collection('messages'))