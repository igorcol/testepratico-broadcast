import { useState, type MouseEvent } from 'react'
import {
  Alert,
  Autocomplete,
  Button,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import MarkChatUnreadRoundedIcon from '@mui/icons-material/MarkChatUnreadRounded'
import SendIcon from '@mui/icons-material/Send'
import { useSearchParams } from 'react-router'
import { filterAndSortContacts } from '@/features/contacts/filterContacts'
import { useContacts } from '@/features/contacts/hooks/useContact'
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
import { ScrollRegion } from '@/shared/components/ScrollRegion'
import { getFirestoreErrorMessage } from '@/shared/lib/firestoreErrors'

const FILTER_LABELS: Record<MessageFilter, string> = {
  all: 'Todas',
  scheduled: 'Agendadas',
  sent: 'Enviadas',
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

  const contacts = contactsState.status === 'success' ? contactsState.data : []
  const sortedContacts = filterAndSortContacts(contacts, '', 'name-asc')

  const filterParam = searchParams.get('filter')
  const filter: MessageFilter = isMessageFilter(filterParam) ? filterParam : 'all'

  const selectedContact = contacts.find(({ id }) => id === searchParams.get('contact')) ?? null
  const selectedContactId = selectedContact?.id ?? null

  const allMessages = messagesState.status === 'success' ? messagesState.data : []
  const visibleMessages = filterAndSortMessages(allMessages, filter, selectedContactId)
  const counts = countMessagesByFilter(allMessages, selectedContactId)

  const isLoading = contactsState.status === 'loading' || messagesState.status === 'loading'
  const hasError = contactsState.status === 'error' || messagesState.status === 'error'
  const hasNoContacts = contactsState.status === 'success' && contacts.length === 0
  const hasActiveFilters = filter !== 'all' || selectedContactId !== null

  const updateSearchParam = (key: string, value: string | null) => {
    setSearchParams(
      (params) => {
        if (value) params.set(key, value)
        else params.delete(key)
        return params
      },
      { replace: true },
    )
  }

  const handleFilterChange = (_event: MouseEvent<HTMLElement>, value: MessageFilter | null) => {
    if (value) updateSearchParam('filter', value)
  }

  const clearFilters = () => {
    setSearchParams(
      (params) => {
        params.delete('filter')
        params.delete('contact')
        return params
      },
      { replace: true },
    )
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
    <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1">
      <Paper variant="outlined" className="flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex flex-wrap items-center gap-3">

          <ToggleButtonGroup
            exclusive
            size="small"
            value={filter}
            onChange={handleFilterChange}
            aria-label="Filtrar mensagens por status"
            className="gap-1 rounded-xl bg-slate-100 p-1 [&_.MuiToggleButtonGroup-grouped]:rounded-lg [&_.MuiToggleButtonGroup-grouped]:border-0 [&_.MuiToggleButtonGroup-grouped]:px-3 [&_.MuiToggleButtonGroup-grouped.Mui-selected]:bg-white [&_.MuiToggleButtonGroup-grouped.Mui-selected]:text-primary [&_.MuiToggleButtonGroup-grouped.Mui-selected]:shadow-sm"
          >
            {MESSAGE_FILTERS.map((option) => (
              <ToggleButton key={option} value={option}>
                {FILTER_LABELS[option]}
                <span className="ml-2 rounded-full bg-slate-200/80 px-1.5 text-xs tabular-nums">
                  {counts[option]}
                </span>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Autocomplete
            size="small"
            options={sortedContacts}
            value={selectedContact}
            onChange={(_event, contact) => updateSearchParam('contact', contact?.id ?? null)}
            getOptionLabel={({ name }) => name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="Nenhum contato encontrado"
            disabled={contacts.length === 0}
            className="w-60"
            renderInput={(params) => (
              <TextField {...params} label="Contato" placeholder="Todos os contatos" />
            )}
          />
        </div>

        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={openComposer}
          disabled={isLoading || hasNoContacts}
        >
          Nova mensagem
        </Button>
      </Paper>

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
          icon={<MarkChatUnreadRoundedIcon />}
          title={hasActiveFilters ? 'Nenhuma mensagem encontrada' : 'Nenhuma mensagem ainda'}
          description={
            hasActiveFilters
              ? 'Nada corresponde aos filtros escolhidos.'
              : 'Envie agora ou agende uma mensagem para os contatos desta conexão.'
          }
          action={
            hasActiveFilters ? (
              <Button variant="outlined" onClick={clearFilters}>
                Limpar filtros
              </Button>
            ) : undefined
          }
        />
      )}

      {visibleMessages.length > 0 && (
        <ScrollRegion label="Lista de mensagens">
          <MessageList
            messages={visibleMessages}
            onEdit={(message) => setDialog({ type: 'edit', message })}
            onDelete={(message) => setDialog({ type: 'delete', message })}
          />
        </ScrollRegion>
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