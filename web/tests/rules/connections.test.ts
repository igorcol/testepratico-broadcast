import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { createRulesTestEnvironment } from './testEnvironment.ts'

const ANA_UID = 'ana'
const IGOR_UID = 'igor'
const CONNECTION_ID = 'connection-1'

let testEnv: RulesTestEnvironment

const firestoreAs = (uid: string) => testEnv.authenticatedContext(uid).firestore()
const anonymousFirestore = () => testEnv.unauthenticatedContext().firestore()
const connectionRefAs = (uid: string) => doc(firestoreAs(uid), 'connections', CONNECTION_ID)

const buildNewConnection = (tenantId: string) => ({
  tenantId,
  name: 'WhatsApp Vendas',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  deletedAt: null,
})

// Grava ignorando as rules 
// Simula um documento que já existe no banco
const seedConnection = (overrides: Record<string, unknown> = {}) =>
  testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'connections', CONNECTION_ID), {
      tenantId: ANA_UID,
      name: 'WhatsApp Vendas',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      deletedAt: null,
      ...overrides,
    })
  })

beforeAll(async () => {
  testEnv = await createRulesTestEnvironment()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

afterAll(async () => {
  await testEnv.cleanup()
})

describe('connections: leitura', () => {
  it('dono lê a própria conexão', async () => {
    await seedConnection()
    await assertSucceeds(getDoc(connectionRefAs(ANA_UID)))
  })

  it('outro cliente não lê a conexão', async () => {
    await seedConnection()
    await assertFails(getDoc(connectionRefAs(IGOR_UID)))
  })

  it('visitante não autenticado não lê', async () => {
    await seedConnection()
    await assertFails(getDoc(doc(anonymousFirestore(), 'connections', CONNECTION_ID)))
  })

  it('dono lista filtrando pelo próprio tenant', async () => {
    await seedConnection()
    const connectionsQuery = query(
      collection(firestoreAs(ANA_UID), 'connections'),
      where('tenantId', '==', ANA_UID),
    )
    await assertSucceeds(getDocs(connectionsQuery))
  })

  it('listagem sem filtro de tenant é recusada', async () => {
    await assertFails(getDocs(collection(firestoreAs(ANA_UID), 'connections')))
  })

  it('listagem filtrando pelo tenant de outro cliente é recusada', async () => {
    const connectionsQuery = query(
      collection(firestoreAs(ANA_UID), 'connections'),
      where('tenantId', '==', IGOR_UID),
    )
    await assertFails(getDocs(connectionsQuery))
  })
})

describe('connections: criação', () => {
  it('cria conexão válida no próprio tenant', async () => {
    await assertSucceeds(setDoc(connectionRefAs(ANA_UID), buildNewConnection(ANA_UID)))
  })

  it('não cria conexão no tenant de outro cliente', async () => {
    await assertFails(setDoc(connectionRefAs(ANA_UID), buildNewConnection(IGOR_UID)))
  })

  it('visitante não autenticado não cria', async () => {
    const connectionRef = doc(anonymousFirestore(), 'connections', CONNECTION_ID)
    await assertFails(setDoc(connectionRef, buildNewConnection(ANA_UID)))
  })

  it('recusa campo fora da lista permitida', async () => {
    const connection = { ...buildNewConnection(ANA_UID), isAdmin: true }
    await assertFails(setDoc(connectionRefAs(ANA_UID), connection))
  })

  it('recusa nome só com espaços', async () => {
    const connection = { ...buildNewConnection(ANA_UID), name: '   ' }
    await assertFails(setDoc(connectionRefAs(ANA_UID), connection))
  })

  it('recusa nome com mais de 80 caracteres', async () => {
    const connection = { ...buildNewConnection(ANA_UID), name: 'a'.repeat(81) }
    await assertFails(setDoc(connectionRefAs(ANA_UID), connection))
  })

  it('recusa data de criação enviada pelo cliente', async () => {
    const connection = {
      ...buildNewConnection(ANA_UID),
      createdAt: Timestamp.fromDate(new Date('2020-01-01')),
    }
    await assertFails(setDoc(connectionRefAs(ANA_UID), connection))
  })
})

describe('connections: edição', () => {
  it('dono renomeia a conexão', async () => {
    await seedConnection()
    await assertSucceeds(
      updateDoc(connectionRefAs(ANA_UID), { name: 'Novo nome', updatedAt: serverTimestamp() }),
    )
  })

  it('outro cliente não renomeia', async () => {
    await seedConnection()
    await assertFails(
      updateDoc(connectionRefAs(IGOR_UID), { name: 'Invadido', updatedAt: serverTimestamp() }),
    )
  })

  it('não permite transferir a conexão para outro tenant', async () => {
    await seedConnection()
    await assertFails(
      updateDoc(connectionRefAs(ANA_UID), { tenantId: IGOR_UID, updatedAt: serverTimestamp() }),
    )
  })

  it('dono exclui logicamente', async () => {
    await seedConnection()
    await assertSucceeds(
      updateDoc(connectionRefAs(ANA_UID), {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('não renomeia e exclui na mesma operação', async () => {
    await seedConnection()
    await assertFails(
      updateDoc(connectionRefAs(ANA_UID), {
        name: 'Novo nome',
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('conexão excluída não pode ser renomeada', async () => {
    await seedConnection({ deletedAt: Timestamp.now() })
    await assertFails(
      updateDoc(connectionRefAs(ANA_UID), { name: 'Novo nome', updatedAt: serverTimestamp() }),
    )
  })

  it('conexão excluída não pode ser restaurada', async () => {
    await seedConnection({ deletedAt: Timestamp.now() })
    await assertFails(
      updateDoc(connectionRefAs(ANA_UID), { deletedAt: null, updatedAt: serverTimestamp() }),
    )
  })
})

describe('connections: exclusão definitiva', () => {
  it('nem o dono apaga a conexão de verdade', async () => {
    await seedConnection()
    await assertFails(deleteDoc(connectionRefAs(ANA_UID)))
  })
})