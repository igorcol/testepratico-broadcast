import {
  FieldValue,
  type Firestore,
  type QueryDocumentSnapshot,
  type Timestamp,
} from 'firebase-admin/firestore'
import { warn } from 'firebase-functions/logger'

const BATCH_SIZE = 500

const findDueMessages = (db: Firestore, now: Timestamp) => 
    db
        .collection('messages')
        .where('status', '==', 'scheduled')
        .where('scheduledAt', '<=', now)
        .orderBy('scheduledAt')
        .limit(BATCH_SIZE)
        .get()

const markAsSent = async (messages: QueryDocumentSnapshot[]) => {
    const results = await Promise.allSettled(
        messages.map((message) =>
            message.ref.update(
                {
                    status: 'sent',
                    sentAt: FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp()
                },
                { lastUpdateTime: message.updateTime } // Evita sobrescrever mensagem editada ou cancelada
            )
        )
    )

    results.forEach((result, index) => {
        if (result.status === 'rejected') {
            warn('Mensagem agendada ignorada. A tentativa será repetida na próxima execução.', {
                messageId: messages[index]?.id,
                reason: String(result.reason),
            })
        }
    })

    return results.filter((result) => result.status === 'fulfilled').length
}

// Envio em lotes.
export const sendDueMessages = async (
  db: Firestore,
  now: Timestamp,
  sentSoFar = 0,
): Promise<number> => {
    const snapshot = await findDueMessages(db, now)
    if (snapshot.empty) return sentSoFar

    const sentInBatch = await markAsSent(snapshot.docs)
    const totalSent = sentSoFar + sentInBatch

    // Lote incompleto vai por ultimo.
    const hasMoreBatches = snapshot.size === BATCH_SIZE && sentInBatch > 0

    return hasMoreBatches ? sendDueMessages(db, now, totalSent) : totalSent
}