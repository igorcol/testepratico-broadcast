import { info } from 'firebase-functions/logger'
import { onDocumentUpdated } from 'firebase-functions/firestore'
import { db } from '../lib/firebaseAdmin'
import { cancelScheduledMessages } from '../messages/cancelScheduledMessages'

// Cancela mensagens agendadas quando a conexão é excluída

export const onConnectionDeleted = onDocumentUpdated('connections/{connectionId}', async (event) => {
  const wasActive = event.data?.before.data().deletedAt === null
  const isDeleted = Boolean(event.data?.after.data().deletedAt)

  if (!wasActive || !isDeleted) return

  const { connectionId } = event.params
  const canceledCount = await cancelScheduledMessages(db, connectionId)

  info('Scheduled messages canceled after connection deletion', { connectionId, canceledCount })
})