import { setGlobalOptions } from 'firebase-functions'

setGlobalOptions({ region: 'southamerica-east1', maxInstances: 10 })

// Agendada
export { processScheduledMessages } from './scheduled/processScheduledMessages'

// Trigger
export { onConnectionDeleted } from './triggers/onConnectionDeleted'