import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type FirestoreError,
  type Unsubscribe,
} from 'firebase/firestore'
import { contactSchema, type Contact, type ContactFormValues } from '@/features/contacts/schemas'
import { db } from '@/shared/lib/firebase'
import { parseDocument } from '@/shared/lib/firestore'

const contactsCollection = collection(db, 'contacts')

export const subscribeToContacts = (
  tenantId: string,
  connectionId: string,
  onData: (contacts: Contact[]) => void,
  onError: (error: FirestoreError) => void,
): Unsubscribe => {
  const connectionContactsQuery = query(
    contactsCollection,
    where('tenantId', '==', tenantId),
    where('connectionId', '==', connectionId),
  )

  return onSnapshot(
    connectionContactsQuery,
    (snapshot) => {
      onData(snapshot.docs.flatMap((document) => parseDocument(contactSchema, document) ?? []))
    },
    onError,
  )
}

export const createContact = (
  tenantId: string,
  connectionId: string,
  { name, phone }: ContactFormValues,
) =>
  addDoc(contactsCollection, {
    tenantId,
    connectionId,
    name,
    phone,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

export const updateContact = (contactId: string, { name, phone }: ContactFormValues) =>
  updateDoc(doc(contactsCollection, contactId), {
    name,
    phone,
    updatedAt: serverTimestamp(),
  })

export const deleteContact = (contactId: string) => deleteDoc(doc(contactsCollection, contactId))