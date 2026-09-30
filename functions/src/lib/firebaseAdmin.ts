import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const adminApp = initializeApp()

export const db = getFirestore(adminApp)