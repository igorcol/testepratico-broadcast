import { useState } from 'react'
import { Alert, Button, InputAdornment, MenuItem, TextField, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { useSearchParams } from 'react-router'
import { deleteContact } from '@/features/contacts/api'
import { ContactFormDialog } from '@/features/contacts/components/ContactFormDialog'
import { ContactList } from '@/features/contacts/components/ContactList'
import {
  filterAndSortContacts,
  isContactSort,
  type ContactSort,
} from '@/features/contacts/filterContacts'
import type { Contact } from '@/features/contacts/schemas'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { ListSkeleton } from '@/shared/components/ListSkeleton'
import { getFirestoreErrorMessage } from '@/shared/lib/firestoreErrors'
import { useContacts } from '../hooks/useContact'

const SORT_LABELS: Record<ContactSort, string> = {
  'name-asc': 'Nome (A-Z)',
  'name-desc': 'Nome (Z-A)',
  recent: 'Mais recentes',
}

type DialogState =
  | { type: 'closed' }
  | { type: 'create' }
  | { type: 'edit'; contact: Contact }
  | { type: 'delete'; contact: Contact }

interface ContactsTabProps {
  connectionId: string
}

export function ContactsTab({ connectionId }: ContactsTabProps) {
  const contactsState = useContacts(connectionId)
  const [searchParams, setSearchParams] = useSearchParams()
  const [dialog, setDialog] = useState<DialogState>({ type: 'closed' })

  // Busca e ordenação na URL
  const search = searchParams.get('q') ?? ''
  const sortParam = searchParams.get('sort')
  const sort: ContactSort = isContactSort(sortParam) ? sortParam : 'name-asc'

  const updateSearchParam = (key: string, value: string) => {
    setSearchParams(
      (params) => {
        if (value) params.set(key, value)
        else params.delete(key)
        return params
      },
      { replace: true },
    )
  }

  const allContacts = contactsState.status === 'success' ? contactsState.data : []
  const visibleContacts = filterAndSortContacts(allContacts, search, sort)

  const openCreateDialog = () => setDialog({ type: 'create' })
  const closeDialog = () => setDialog({ type: 'closed' })

  const contactsCountLabel = search
    ? `${visibleContacts.length} de ${allContacts.length} contatos`
    : `${allContacts.length} ${allContacts.length === 1 ? 'contato' : 'contatos'}`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <TextField
          type="search"
          size="small"
          label="Buscar por nome ou telefone"
          value={search}
          onChange={(event) => updateSearchParam('q', event.target.value)}
          className="min-w-64 flex-1"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          label="Ordenar"
          value={sort}
          onChange={(event) => updateSearchParam('sort', event.target.value)}
          className="w-44"
        >
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          Novo contato
        </Button>
      </div>

      {contactsState.status === 'loading' && <ListSkeleton />}

      {contactsState.status === 'error' && (
        <Alert severity="error">Não foi possível carregar os contatos. Recarregue a página.</Alert>
      )}

      {contactsState.status === 'success' && allContacts.length === 0 && (
        <EmptyState
          title="Nenhum contato nesta conexão"
          description="Adicione contatos para poder enviar mensagens para eles."
          action={
            <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreateDialog}>
              Adicionar contato
            </Button>
          }
        />
      )}

      {contactsState.status === 'success' &&
        allContacts.length > 0 &&
        visibleContacts.length === 0 && (
          <EmptyState
            title="Nenhum contato encontrado"
            description={`Nada corresponde a "${search}".`}
            action={
              <Button variant="outlined" onClick={() => updateSearchParam('q', '')}>
                Limpar busca
              </Button>
            }
          />
        )}

      {visibleContacts.length > 0 && (
        <>
          <Typography variant="body2" color="text.secondary">
            {contactsCountLabel}
          </Typography>
          <ContactList
            contacts={visibleContacts}
            onEdit={(contact) => setDialog({ type: 'edit', contact })}
            onDelete={(contact) => setDialog({ type: 'delete', contact })}
          />
        </>
      )}

      {dialog.type === 'create' && (
        <ContactFormDialog
          connectionId={connectionId}
          existingContacts={allContacts}
          onClose={closeDialog}
        />
      )}

      {dialog.type === 'edit' && (
        <ContactFormDialog
          connectionId={connectionId}
          existingContacts={allContacts}
          contact={dialog.contact}
          onClose={closeDialog}
        />
      )}

      {dialog.type === 'delete' && (
        <ConfirmDialog
          title="Excluir contato?"
          description={
            <>
              O contato <strong>{dialog.contact.name}</strong> será excluído. Mensagens já enviadas
              para ele continuam no histórico.
            </>
          }
          confirmLabel="Excluir"
          onConfirm={() => deleteContact(dialog.contact.id)}
          onClose={closeDialog}
          getErrorMessage={getFirestoreErrorMessage}
        />
      )}
    </div>
  )
}