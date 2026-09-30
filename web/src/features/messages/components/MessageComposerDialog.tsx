import { useState } from 'react'
import {
  Alert,
  Autocomplete,
  Button,
  createFilterOptions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useAuthenticatedUser } from '@/features/auth/useAuth'
import type { Contact } from '@/features/contacts/schemas'
import {
  editScheduledMessage,
  editSentMessage,
  scheduleMessage,
  sendMessageNow,
} from '@/features/messages/api'
import { buildRecipientOptions } from '@/features/messages/recipients'
import {
  MAX_CONTENT_LENGTH,
  messageComposerSchema,
  type ComposerMode,
  type Message,
  type MessageComposerValues,
  type Recipient,
} from '@/features/messages/schemas'
import { useFormSubmit } from '@/shared/hooks/useFormSubmit'
import { toDateTimeLocalValue } from '@/shared/lib/dateTimeLocal'
import { getFirestoreErrorMessage } from '@/shared/lib/firestoreErrors'
import { formatPhone } from '@/shared/lib/phone'

type NewMessageMode = Extract<ComposerMode, 'send-now' | 'schedule'>

const DIALOG_TITLES: Record<ComposerMode, string> = {
  'send-now': 'Nova mensagem',
  schedule: 'Nova mensagem',
  'edit-scheduled': 'Editar mensagem agendada',
  'edit-sent': 'Editar mensagem enviada',
}

const SUBMIT_LABELS: Record<ComposerMode, string> = {
  'send-now': 'Enviar agora',
  schedule: 'Agendar',
  'edit-scheduled': 'Salvar',
  'edit-sent': 'Salvar',
}

// Busca no seletor por nome ou telefone
const filterRecipients = createFilterOptions<Recipient>({
  stringify: ({ name, phone }) => `${name} ${phone}`,
})

const getEditMode = (message: Message): ComposerMode =>
  message.status === 'scheduled' ? 'edit-scheduled' : 'edit-sent'

const requireMessageId = (message: Message | undefined) => {
  if (!message) throw new Error('Edit mode requires a message')
  return message.id
}

interface MessageComposerDialogProps {
  connectionId: string
  contacts: Contact[]
  message?: Message
  onClose: () => void
}

export function MessageComposerDialog({
  connectionId,
  contacts,
  message,
  onClose,
}: MessageComposerDialogProps) {
  const { uid } = useAuthenticatedUser()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [newMessageMode, setNewMessageMode] = useState<NewMessageMode>('send-now')
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>(
    message?.recipients ?? [],
  )
  const [contentLength, setContentLength] = useState(message?.content.length ?? 0)

  const mode: ComposerMode = message ? getEditMode(message) : newMessageMode
  const recipientOptions = buildRecipientOptions(contacts, message?.recipients ?? [])
  const showsDateField = mode === 'schedule' || mode === 'edit-scheduled'

  const saveMessage = (values: MessageComposerValues) => {
    const recipientsById = new Map(recipientOptions.map((recipient) => [recipient.contactId, recipient]))
    const body = {
      content: values.content,
      recipients: values.contactIds.flatMap((contactId) => recipientsById.get(contactId) ?? []),
    }

    switch (values.mode) {
      case 'send-now':
        return sendMessageNow(uid, connectionId, body)
      case 'schedule':
        return scheduleMessage(uid, connectionId, body, values.scheduledAt)
      case 'edit-sent':
        return editSentMessage(requireMessageId(message), body)
      case 'edit-scheduled':
        return editScheduledMessage(requireMessageId(message), body, values.scheduledAt)
    }
  }

  const { handleSubmit, fieldErrors, formError, isSubmitting } = useFormSubmit({
    schema: messageComposerSchema,
    onSubmit: async (values) => {
      await saveMessage(values)
      onClose()
    },
    getErrorMessage: getFirestoreErrorMessage,
  })

  return (
    <Dialog
      open
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
    >
      <form noValidate onSubmit={handleSubmit}>
        <DialogTitle>{DIALOG_TITLES[mode]}</DialogTitle>

        <DialogContent className="flex flex-col gap-5">
          {mode === 'edit-sent' && (
            <Alert severity="info">
              Ela continua como enviada e passa a aparecer marcada como editada.
            </Alert>
          )}

          <div className="flex flex-col gap-1 pt-2">
            <Autocomplete
              multiple
              disableCloseOnSelect
              limitTags={4}
              options={recipientOptions}
              value={selectedRecipients}
              onChange={(_event, recipients) => setSelectedRecipients(recipients)}
              filterOptions={filterRecipients}
              getOptionLabel={({ name }) => name}
              isOptionEqualToValue={(option, value) => option.contactId === value.contactId}
              noOptionsText="Nenhum contato encontrado"
              renderOption={(props, recipient) => {
                const { key, ...optionProps } = props
                return (
                  <li key={key} {...optionProps}>
                    <div className="flex flex-col">
                      <span>{recipient.name}</span>
                      <Typography variant="body2" color="text.secondary">
                        {formatPhone(recipient.phone)}
                      </Typography>
                    </div>
                  </li>
                )
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Contatos"
                  placeholder={selectedRecipients.length === 0 ? 'Buscar por nome ou telefone' : ''}
                  error={Boolean(fieldErrors.contactIds)}
                  helperText={fieldErrors.contactIds}
                />
              )}
            />
            <input
              type="hidden"
              name="contactIds"
              value={selectedRecipients.map(({ contactId }) => contactId).join(',')}
            />
            <div className="flex gap-2">
              <Button
                size="small"
                onClick={() => setSelectedRecipients(recipientOptions)}
                disabled={recipientOptions.length === 0}
              >
                Selecionar todos ({recipientOptions.length})
              </Button>
              {selectedRecipients.length > 0 && (
                <Button size="small" color="inherit" onClick={() => setSelectedRecipients([])}>
                  Limpar
                </Button>
              )}
            </div>
          </div>

          <TextField
            name="content"
            label="Mensagem"
            defaultValue={message?.content}
            onChange={(event) => setContentLength(event.target.value.length)}
            multiline
            minRows={4}
            fullWidth
            error={Boolean(fieldErrors.content)}
            helperText={fieldErrors.content ?? `${contentLength}/${MAX_CONTENT_LENGTH}`}
            slotProps={{ htmlInput: { maxLength: MAX_CONTENT_LENGTH } }}
          />

          {message ? (
            <input type="hidden" name="mode" value={mode} />
          ) : (
            <RadioGroup
              row
              name="mode"
              value={newMessageMode}
              onChange={(event) =>
                setNewMessageMode(event.target.value === 'schedule' ? 'schedule' : 'send-now')
              }
            >
              <FormControlLabel value="send-now" control={<Radio />} label="Enviar agora" />
              <FormControlLabel value="schedule" control={<Radio />} label="Agendar" />
            </RadioGroup>
          )}

          {showsDateField && (
            <TextField
              name="scheduledAt"
              type="datetime-local"
              label="Data e horário do envio"
              defaultValue={message?.scheduledAt ? toDateTimeLocalValue(message.scheduledAt) : ''}
              fullWidth
              error={Boolean(fieldErrors.scheduledAt)}
              helperText={fieldErrors.scheduledAt ?? 'Enviada em até 1 minuto depois do horário escolhido.'}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: toDateTimeLocalValue(new Date()) },
              }}
            />
          )}

          {formError && <Alert severity="error">{formError}</Alert>}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {SUBMIT_LABELS[mode]}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}