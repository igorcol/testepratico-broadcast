import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { useAuthenticatedUser } from '@/features/auth/useAuth'
import { createConnection, renameConnection } from '@/features/connections/api'
import { connectionFormSchema, type Connection } from '@/features/connections/schemas'
import { useFormSubmit } from '@/shared/hooks/useFormSubmit'
import { getFirestoreErrorMessage } from '@/shared/lib/firestoreErrors'

interface ConnectionFormDialogProps {
  connection?: Connection
  onClose: () => void
}

// Mesmo form pra criar e renomear conexão
export function ConnectionFormDialog({ connection, onClose }: ConnectionFormDialogProps) {
  const { uid } = useAuthenticatedUser()
  const isEditing = connection !== undefined

  const { handleSubmit, fieldErrors, formError, isSubmitting } = useFormSubmit({
    schema: connectionFormSchema,
    onSubmit: async (values) => {
      await (connection ? renameConnection(connection.id, values) : createConnection(uid, values))
      onClose()
    },
    getErrorMessage: getFirestoreErrorMessage,
  })

  return (
    <Dialog open onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="xs">
      <form noValidate onSubmit={handleSubmit}>
        <DialogTitle>{isEditing ? 'Renomear conexão' : 'Nova conexão'}</DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          <TextField
            name="name"
            label="Nome"
            placeholder="Ex. WhatsApp Vendas"
            defaultValue={connection?.name}
            autoFocus
            fullWidth
            margin="dense"
            error={Boolean(fieldErrors.name)}
            helperText={fieldErrors.name}
            slotProps={{ htmlInput: { maxLength: 80 } }}
          />
          {formError && <Alert severity="error">{formError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}