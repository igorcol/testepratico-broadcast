import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useAuthenticatedUser } from '@/features/auth/useAuth'
import { createContact, updateContact } from '@/features/contacts/api'
import { contactFormSchema, type Contact } from '@/features/contacts/schemas'
import { useFormSubmit } from '@/shared/hooks/useFormSubmit'
import { getFirestoreErrorMessage } from '@/shared/lib/firestoreErrors'
import { formatPhone } from '@/shared/lib/phone'

interface ContactFormDialogProps {
  connectionId: string
  existingContacts: Contact[]
  contact?: Contact
  onClose: () => void
}

// Mesmo form pra criar e editar
export function ContactFormDialog({
  connectionId,
  existingContacts,
  contact,
  onClose,
}: ContactFormDialogProps) {
  const { uid } = useAuthenticatedUser()
  const isEditing = contact !== undefined

  // Telefones já usados na conexão - tirando o do próprio contato quando é edição
  const takenPhones = new Set(
    existingContacts.filter(({ id }) => id !== contact?.id).map(({ phone }) => phone),
  )

  const schema = contactFormSchema.refine(({ phone }) => !takenPhones.has(phone), {
    message: 'Esse telefone já está cadastrado nesta conexão.',
    path: ['phone'],
  })

  const { handleSubmit, fieldErrors, formError, isSubmitting } = useFormSubmit({
    schema,
    onSubmit: async (values) => {
      await (contact
        ? updateContact(contact.id, values)
        : createContact(uid, connectionId, values))
      onClose()
    },
    getErrorMessage: getFirestoreErrorMessage,
  })

  return (
    <Dialog open onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="xs">
      <form noValidate onSubmit={handleSubmit}>
        <DialogTitle>{isEditing ? 'Editar contato' : 'Novo contato'}</DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          <TextField
            name="name"
            label="Nome"
            defaultValue={contact?.name}
            autoFocus
            fullWidth
            margin="dense"
            autoComplete="off"
            error={Boolean(fieldErrors.name)}
            helperText={fieldErrors.name}
            slotProps={{ htmlInput: { maxLength: 80 } }}
          />
          <TextField
            name="phone"
            label="Telefone"
            type="tel"
            placeholder="(11) 99999-8888"
            defaultValue={contact ? formatPhone(contact.phone) : undefined}
            fullWidth
            autoComplete="off"
            error={Boolean(fieldErrors.phone)}
            helperText={fieldErrors.phone ?? 'DDD e número. Para outro país, comece com +.'}
          />
          {formError && <Alert severity="error">{formError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {isEditing ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}