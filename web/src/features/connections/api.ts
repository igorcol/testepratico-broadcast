import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type FirestoreError,
  type Unsubscribe,
} from 'firebase/firestore'
import {
  connectionSchema,
  type Connection,
  type ConnectionFormValues,
} from '@/features/connections/schemas'
import { db } from '@/shared/lib/firebase'
import { parseDocument } from '@/shared/lib/firestore'

const connectionsCollection = collection(db, 'connections')

export const subscribeToConnections = (
  tenantId: string,
  onData: (connections: Connection[]) => void,
  onError: (error: FirestoreError) => void,
): Unsubscribe => {
  const activeConnectionsQuery = query(
    connectionsCollection,
    where('tenantId', '==', tenantId),
    where('deletedAt', '==', null),
    orderBy('createdAt', 'desc'),
  )

  return onSnapshot(
    activeConnectionsQuery,
    (snapshot) => {
      onData(snapshot.docs.flatMap((document) => parseDocument(connectionSchema, document) ?? []))
    },
    onError,
  )
}

export const subscribeToConnection = (
  connectionId: string,
  onData: (connection: Connection | null) => void,
  onError: (error: FirestoreError) => void,
): Unsubscribe =>
  onSnapshot(
    doc(connectionsCollection, connectionId),
    (snapshot) => {
      onData(snapshot.exists() ? parseDocument(connectionSchema, snapshot) : null)
    },
    onError,
  )

export const createConnection = (tenantId: string, { name }: ConnectionFormValues) =>
  addDoc(connectionsCollection, {
    tenantId,
    name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    deletedAt: null,
  })

export const renameConnection = (connectionId: string, { name }: ConnectionFormValues) =>
  updateDoc(doc(connectionsCollection, connectionId), {
    name,
    updatedAt: serverTimestamp(),
  })

export const softDeleteConnection = (connectionId: string) =>
  updateDoc(doc(connectionsCollection, connectionId), {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })