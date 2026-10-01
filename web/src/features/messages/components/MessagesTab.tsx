import { useState, type MouseEvent } from 'react'
import { Alert, Button, ToggleButton, ToggleButtonGroup } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import { useSearchParams } from 'react-router'
import { deleteMessage } from '@/features/messages/api'
import { MessageComposerDialog } from '@/features/messages/components/MessageComposerDialog'
import { MessageList } from '@/features/messages/components/MessageList'
import {
  countMessagesByFilter,
  filterAndSortMessages,
  isMessageFilter,
  MESSAGE_FILTERS,
  type MessageFilter,
} from '@/features/messages/filterMessages'
import { useMessages } from '@/features/messages/hooks/useMessages'
import type { Message } from '@/features/messages/schemas'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { ListSkeleton } from '@/shared/components/ListSkeleton'
import { getFirestoreErrorMessage } from '@/shared/lib/firestoreErrors'
import { useContacts } from '@/features/contacts/hooks/useContact'

const FILTER_LABELS: Record<MessageFilter, string> = {
  all: 'Todas',
  scheduled: 'Agendadas',
  sent: 'Enviadas',
}

const EMPTY_FILTER_TITLES: Record<MessageFilter, string> = {
  all: 'Nenhuma mensagem ainda',
  scheduled: 'Nenhuma mensagem agendada',
  sent: 'Nenhuma mensagem enviada',
}

type DialogState =
  | { type: 'closed' }
  | { type: 'compose' }
  | { type: 'edit'; message: Message }
  | { type: 'delete'; message: Message }

interface MessagesTabProps {
  connectionId: string
}

export function MessagesTab({ connectionId }: MessagesTabProps) {
  const contactsState = useContacts(connectionId)
  const messagesState = useMessages(connectionId)
  const [searchParams, setSearchParams] = useSearchParams()
  const [dialog, setDialog] = useState<DialogState>({ type: 'closed' })

  const filterParam = searchParams.get('filter')
  const filter: MessageFilter = isMessageFilter(filterParam) ? filterParam : 'all'

  const contacts = contactsState.status === 'success' ? contactsState.data : []
  const allMessages = messagesState.status === 'success' ? messagesState.data : []
  const visibleMessages = filterAndSortMessages(allMessages, filter)
  const counts = countMessagesByFilter(allMessages)

  const isLoading = contactsState.status === 'loading' || messagesState.status === 'loading'
  const hasError = contactsState.status === 'error' || messagesState.status === 'error'
  const hasNoContacts = contactsState.status === 'success' && contacts.length === 0

  const changeFilter = (nextFilter: MessageFilter) => {
    setSearchParams(
      (params) => {
        params.set('filter', nextFilter)
        return params
      },
      { replace: true },
    )
  }

  const handleFilterChange = (_event: MouseEvent<HTMLElement>, value: MessageFilter | null) => {
    if (value) changeFilter(value)
  }

  const goToContactsTab = () => {
    setSearchParams((params) => {
      params.set('tab', 'contacts')
      return params
    })
  }

  const openComposer = () => setDialog({ type: 'compose' })
  const closeDialog = () => setDialog({ type: 'closed' })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleButtonGroup
          exclusive
          size="small"
          value={filter}
          onChange={handleFilterChange}
          aria-label="Filtrar mensagens"
        >
          {MESSAGE_FILTERS.map((option) => (
            <ToggleButton key={option} value={option}>
              {FILTER_LABELS[option]} ({counts[option]})
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={openComposer}
          disabled={isLoading || hasNoContacts}
        >
          Nova mensagem
        </Button>
      </div>

      {hasNoContacts && (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={goToContactsTab}>
              Ir para contatos
            </Button>
          }
        >
          Cadastre contatos nesta conexão para poder enviar mensagens.
        </Alert>
      )}

      {isLoading && <ListSkeleton />}

      {hasError && (
        <Alert severity="error">Não foi possível carregar as mensagens. Recarregue a página.</Alert>
      )}

      {!isLoading && !hasError && visibleMessages.length === 0 && (
        <EmptyState
          title={EMPTY_FILTER_TITLES[filter]}
          description={
            filter === 'all'
              ? 'Envie agora ou agende uma mensagem para os contatos desta conexão.'
              : 'Nada por aqui com esse filtro.'
          }
          action={
            filter === 'all' ? undefined : (
              <Button variant="outlined" onClick={() => changeFilter('all')}>
                Ver todas
              </Button>
            )
          }
        />
      )}

      {visibleMessages.length > 0 && (
        <MessageList
          messages={visibleMessages}
          onEdit={(message) => setDialog({ type: 'edit', message })}
          onDelete={(message) => setDialog({ type: 'delete', message })}
        />
      )}

      {dialog.type === 'compose' && (
        <MessageComposerDialog
          connectionId={connectionId}
          contacts={contacts}
          onClose={closeDialog}
        />
      )}

      {dialog.type === 'edit' && (
        <MessageComposerDialog
          connectionId={connectionId}
          contacts={contacts}
          message={dialog.message}
          onClose={closeDialog}
        />
      )}

      {dialog.type === 'delete' && (
        <ConfirmDialog
          title="Excluir mensagem?"
          description={
            dialog.message.status === 'scheduled'
              ? 'A mensagem agendada é removida e não será enviada.'
              : 'A mensagem sai do histórico desta conexão.'
          }
          confirmLabel="Excluir"
          onConfirm={() => deleteMessage(dialog.message.id)}
          onClose={closeDialog}
          getErrorMessage={getFirestoreErrorMessage}
        />
      )}
    </div>
  )
}