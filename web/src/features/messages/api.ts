import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type FirestoreError,
  type Unsubscribe,
} from 'firebase/firestore'
import { messageSchema, type Message, type Recipient } from '@/features/messages/schemas'
import { db } from '@/shared/lib/firebase'
import { parseDocument } from '@/shared/lib/firestore'

const messagesCollection = collection(db, 'messages')

interface MessageContent {
  content: string
  recipients: Recipient[]
}

export const subscribeToMessages = (
  tenantId: string,
  connectionId: string,
  onData: (messages: Message[]) => void,
  onError: (error: FirestoreError) => void,
): Unsubscribe => {
  const connectionMessagesQuery = query(
    messagesCollection,
    where('tenantId', '==', tenantId),
    where('connectionId', '==', connectionId),
  )

  return onSnapshot(
    connectionMessagesQuery,
    (snapshot) => {
      onData(snapshot.docs.flatMap((document) => parseDocument(messageSchema, document) ?? []))
    },
    onError,
  )
}

// Envio simulado - Já nasce enviada
export const sendMessageNow = (
  tenantId: string,
  connectionId: string,
  { content, recipients }: MessageContent,
) =>
  addDoc(messagesCollection, {
    tenantId,
    connectionId,
    content,
    recipients,
    status: 'sent',
    scheduledAt: null,
    sentAt: serverTimestamp(),
    editedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

// Nasce agendada - Cloud Function que muda para enviada 
export const scheduleMessage = (
  tenantId: string,
  connectionId: string,
  { content, recipients }: MessageContent,
  scheduledAt: Date,
) =>
  addDoc(messagesCollection, {
    tenantId,
    connectionId,
    content,
    recipients,
    status: 'scheduled',
    scheduledAt: Timestamp.fromDate(scheduledAt),
    sentAt: null,
    editedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

export const editSentMessage = (messageId: string, { content, recipients }: MessageContent) =>
  updateDoc(doc(messagesCollection, messageId), {
    content,
    recipients,
    editedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

export const editScheduledMessage = (
  messageId: string,
  { content, recipients }: MessageContent,
  scheduledAt: Date,
) =>
  updateDoc(doc(messagesCollection, messageId), {
    content,
    recipients,
    scheduledAt: Timestamp.fromDate(scheduledAt),
    editedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

export const deleteMessage = (messageId: string) => deleteDoc(doc(messagesCollection, messageId))