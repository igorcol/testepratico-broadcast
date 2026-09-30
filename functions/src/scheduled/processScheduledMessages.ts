import { Timestamp } from 'firebase-admin/firestore'
import { info } from 'firebase-functions/logger'
import { onSchedule } from 'firebase-functions/scheduler'
import { db } from '../lib/firebaseAdmin'
import { sendDueMessages } from '../messages/sendDueMessages'

// Executado a cada minuto
export const processScheduledMessages = onSchedule('every 1 minutes', async () => {
    const sentCount = await sendDueMessages(db, Timestamp.now())

    if (sentCount > 0) {
        info('Scheduled message sent', { sentCount })
    }
})