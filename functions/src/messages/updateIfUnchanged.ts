import type {
  DocumentData,
  QueryDocumentSnapshot,
  UpdateData,
} from 'firebase-admin/firestore'
import { warn } from 'firebase-functions/logger'

// Atualiza cada documento se ele não mudou desde a leitura
export const updateIfUnchanged = async (
  documents: QueryDocumentSnapshot[],
  changes: UpdateData<DocumentData>,
): Promise<number> => {
  const results = await Promise.allSettled(
    documents.map((document) =>
      document.ref.update(changes, { lastUpdateTime: document.updateTime }),
    ),
  )

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      warn('Document skipped, it changed after being read', {
        path: documents[index]?.ref.path,
        reason: String(result.reason),
      })
    }
  })

  return results.filter((result) => result.status === 'fulfilled').length
}