import { FieldValue, type Firestore, type Timestamp } from 'firebase-admin/firestore'
import { updateIfUnchanged } from './updateIfUnchanged'

const BATCH_SIZE = 500

const findDueMessages = (db: Firestore, now: Timestamp) =>
  db
    .collection('messages')
    .where('status', '==', 'scheduled')
    .where('scheduledAt', '<=', now)
    .orderBy('scheduledAt')
    .limit(BATCH_SIZE)
    .get()

// Envio
export const sendDueMessages = async (
  db: Firestore,
  now: Timestamp,
  sentSoFar = 0,
): Promise<number> => {
  const snapshot = await findDueMessages(db, now)
  if (snapshot.empty) return sentSoFar

  const sentInBatch = await updateIfUnchanged(snapshot.docs, {
    status: 'sent',
    sentAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  const totalSent = sentSoFar + sentInBatch

  // Lote incompleto
  const hasMoreBatches = snapshot.size === BATCH_SIZE && sentInBatch > 0

  return hasMoreBatches ? sendDueMessages(db, now, totalSent) : totalSent
}