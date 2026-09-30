import { FieldValue, type Firestore } from 'firebase-admin/firestore'
import { updateIfUnchanged } from './updateIfUnchanged'

// Cancela mensagens agendadas de uma conexão
export const cancelScheduledMessages = async (
  db: Firestore,
  connectionId: string,
): Promise<number> => {
  const snapshot = await db
    .collection('messages')
    .where('connectionId', '==', connectionId)
    .where('status', '==', 'scheduled')
    .get()

  if (snapshot.empty) return 0

  return updateIfUnchanged(snapshot.docs, {
    status: 'canceled',
    updatedAt: FieldValue.serverTimestamp(),
  })
}