import { readFileSync } from 'node:fs'
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, setDoc } from 'firebase/firestore'

// Prefixo demo- para não tocar em um projeto real
const TEST_PROJECT_ID = 'demo-broadcast-rules'
const RULES_PATH = new URL('../../../firestore.rules', import.meta.url)

export const createRulesTestEnvironment = async (): Promise<RulesTestEnvironment> => {
  try {
    return await initializeTestEnvironment({
      projectId: TEST_PROJECT_ID,
      firestore: {
        host: '127.0.0.1',
        port: 8080,
        rules: readFileSync(RULES_PATH, 'utf8'),
      },
    })
  } catch (error) {
    throw new Error(
      'Could not connect to Firestore emulator at 127.0.0.1:8080. Run "firebase emulators:start" first.',
      { cause: error },
    )
  }
}

// Ignora as rules pra simular dados antigos no banco
export const seedDocument = (
  testEnv: RulesTestEnvironment,
  collectionName: string,
  documentId: string,
  data: Record<string, unknown>,
) =>
  testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), collectionName, documentId), data)
  })