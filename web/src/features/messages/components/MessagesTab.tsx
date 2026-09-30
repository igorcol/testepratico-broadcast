import { useState } from 'react'
import { Button, Typography } from '@mui/material'
import { MessageComposerDialog } from '@/features/messages/components/MessageComposerDialog'
import { filterAndSortMessages } from '@/features/messages/filterMessages'
import { useMessages } from '@/features/messages/hooks/useMessages'
import type { Message } from '@/features/messages/schemas'
import { useContacts } from '@/features/contacts/hooks/useContact'

interface MessagesTabProps {
  connectionId: string
}

export function MessagesTab({ connectionId }: MessagesTabProps) {
  const contactsState = useContacts(connectionId)
  const messagesState = useMessages(connectionId)
  const [composer, setComposer] = useState<{ message?: Message } | null>(null)

  const contacts = contactsState.status === 'success' ? contactsState.data : []
  const messages =
    messagesState.status === 'success' ? filterAndSortMessages(messagesState.data, 'all') : []

  return (
    <div className="flex flex-col gap-4">
      <Button variant="contained" className="self-start" onClick={() => setComposer({})}>
        Nova mensagem
      </Button>

      {messages.map((message) => (
        <div key={message.id} className="flex items-center gap-4">
          <Typography>
            [{message.status}] {message.content} ({message.recipients.length} contatos)
            {message.editedAt && ' (editada)'}
          </Typography>
          <Button size="small" onClick={() => setComposer({ message })}>
            Editar
          </Button>
        </div>
      ))}

      {composer && (
        <MessageComposerDialog
          connectionId={connectionId}
          contacts={contacts}
          message={composer.message}
          onClose={() => setComposer(null)}
        />
      )}
    </div>
  )
}