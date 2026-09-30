import { setGlobalOptions } from 'firebase-functions'

setGlobalOptions({ region: 'southamerica-east1', maxInstances: 10 })

// Function agendada
export { processScheduledMessages } from './scheduled/processScheduledMessages'