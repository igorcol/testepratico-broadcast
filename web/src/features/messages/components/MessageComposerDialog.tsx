import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import {
  Alert,
  Autocomplete,
  Button,
  createFilterOptions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useAuthenticatedUser } from '@/features/auth/useAuth'
import type { Contact } from '@/features/contacts/schemas'
import {
  editScheduledMessage,
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
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import { IconTile } from '@/shared/components/IconTile'
import { DoneAllRounded, RemoveDoneRounded } from '@mui/icons-material'
import { useToast } from '@/shared/toast/useToast'
import { describeScheduled, describeSentNow } from '../notifications'
import CodeRoundedIcon from '@mui/icons-material/CodeRounded'
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded'
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded'
import StrikethroughSRoundedIcon from '@mui/icons-material/StrikethroughSRounded'
import { FormattedText } from '@/shared/components/FormattedText'
import { FORMAT_MARKERS, toggleFormat, type FormatStyle } from '@/shared/lib/whatsappFormat'

type NewMessageMode = Extract<ComposerMode, 'send-now' | 'schedule'>

interface SendModeOption {
  value: NewMessageMode
  title: string
  description: string
  icon: ReactNode
}

const SEND_MODE_OPTIONS: SendModeOption[] = [
  {
    value: 'send-now',
    title: 'Enviar agora',
    description: 'A mensagem sai assim que você confirmar.',
    icon: <BoltRoundedIcon />,
  },
  {
    value: 'schedule',
    title: 'Agendar',
    description: 'Escolha a data e o horário do envio.',
    icon: <ScheduleRoundedIcon />,
  },
]

interface FormatAction {
  style: FormatStyle
  label: string
  icon: ReactNode
}

const FORMAT_ACTIONS: FormatAction[] = [
  { style: 'bold', label: 'Negrito (Ctrl+B)', icon: <FormatBoldRoundedIcon fontSize="small" /> },
  { style: 'italic', label: 'Itálico (Ctrl+I)', icon: <FormatItalicRoundedIcon fontSize="small" /> },
  { style: 'strike', label: 'Tachado', icon: <StrikethroughSRoundedIcon fontSize="small" /> },
  { style: 'mono', label: 'Monoespaçado', icon: <CodeRoundedIcon fontSize="small" /> },
]

const SHORTCUT_STYLES: Partial<Record<string, FormatStyle>> = { b: 'bold', i: 'italic' }

const DIALOG_TITLES: Record<ComposerMode, string> = {
  'send-now': 'Nova mensagem',
  schedule: 'Nova mensagem',
  'edit-scheduled': 'Editar mensagem agendada',
}

const SUBMIT_LABELS: Record<ComposerMode, string> = {
  'send-now': 'Enviar agora',
  schedule: 'Agendar',
  'edit-scheduled': 'Salvar',
}

// Busca no seletor por nome ou telefone
const filterRecipients = createFilterOptions<Recipient>({
  stringify: ({ name, phone }) => `${name} ${phone}`,
})

const SELECT_ALL_ID = '__select-all__'

const SELECT_ALL_OPTION: Recipient = { contactId: SELECT_ALL_ID, name: 'Selecionar todos', phone: '' }

const isSelectAllOption = ({ contactId }: Recipient) => contactId === SELECT_ALL_ID


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
  const { showToast } = useToast()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [newMessageMode, setNewMessageMode] = useState<NewMessageMode>('send-now')
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>(
    message?.recipients ?? [],
  )

  const [content, setContent] = useState(message?.content ?? '')
  const contentInputRef = useRef<HTMLTextAreaElement>(null)

  const mode: ComposerMode = message ? 'edit-scheduled' : newMessageMode
  const recipientOptions = buildRecipientOptions(contacts, message?.recipients ?? [])
  const showsDateField = mode === 'schedule' || mode === 'edit-scheduled'

  const areAllSelected =
    recipientOptions.length > 0 && selectedRecipients.length === recipientOptions.length

  const toggleSelectAll = () => setSelectedRecipients(areAllSelected ? [] : recipientOptions)

  const filterOptionsWithSelectAll: typeof filterRecipients = (options, state) => {
    const filtered = filterRecipients(options, state)
    return state.inputValue || options.length === 0 ? filtered : [SELECT_ALL_OPTION, ...filtered]
  }

  const handleRecipientsChange = (recipients: Recipient[]) => {
    if (recipients.some(isSelectAllOption)) {
      toggleSelectAll()
      return
    }
    setSelectedRecipients(recipients)
  }

  const applyFormat = (style: FormatStyle) => {
    const textarea = contentInputRef.current
    if (!textarea) return

    const result = toggleFormat(
      content,
      textarea.selectionStart,
      textarea.selectionEnd,
      FORMAT_MARKERS[style],
    )
    setContent(result.value)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd)
    })
  }

  const handleContentKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.metaKey) return

    const style = SHORTCUT_STYLES[event.key.toLowerCase()]
    if (!style) return

    event.preventDefault()
    applyFormat(style)
  }

  const saveMessage = async (values: MessageComposerValues): Promise<string> => {
    const recipientsById = new Map(recipientOptions.map((recipient) => [recipient.contactId, recipient]))
    const body = {
      content: values.content,
      recipients: values.contactIds.flatMap((contactId) => recipientsById.get(contactId) ?? []),
    }

    switch (values.mode) {
      case 'send-now':
        await sendMessageNow(uid, connectionId, body)
        return describeSentNow(body.recipients)
      case 'schedule':
        await scheduleMessage(uid, connectionId, body, values.scheduledAt)
        return describeScheduled(values.scheduledAt)
      case 'edit-scheduled':
        await editScheduledMessage(requireMessageId(message), body, values.scheduledAt)
        return 'Mensagem agendada atualizada'
    }
  }

  const { handleSubmit, fieldErrors, formError, isSubmitting } = useFormSubmit({
    schema: messageComposerSchema,
    onSubmit: async (values) => {
      const successMessage = await saveMessage(values)
      showToast(successMessage)
      onClose()
    },
    getErrorMessage: getFirestoreErrorMessage,
  })

  return (
    <Dialog
      open
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
    >
      <form noValidate onSubmit={handleSubmit}>
        <DialogTitle>{DIALOG_TITLES[mode]}</DialogTitle>

        <DialogContent className="flex flex-col gap-5">

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <Typography variant="subtitle2" component="span">
                  Destinatários
                </Typography>
                <span className="text-sm text-muted tabular-nums">
                  {selectedRecipients.length} de {recipientOptions.length} selecionados
                </span>
              </div>
              <Button
                size="small"
                variant={areAllSelected ? 'text' : 'outlined'}
                color={areAllSelected ? 'inherit' : 'primary'}
                startIcon={areAllSelected ? <RemoveDoneRounded /> : <DoneAllRounded />}
                onClick={toggleSelectAll}
                disabled={recipientOptions.length === 0}
              >
                {areAllSelected ? 'Limpar seleção' : 'Selecionar todos'}
              </Button>
            </div>

            <Autocomplete
              multiple
              disableCloseOnSelect
              limitTags={4}
              options={recipientOptions}
              value={selectedRecipients}
              onChange={(_event, recipients) => handleRecipientsChange(recipients)}
              filterOptions={filterOptionsWithSelectAll}
              getOptionLabel={({ name }) => name}
              isOptionEqualToValue={(option, value) => option.contactId === value.contactId}
              noOptionsText="Nenhum contato encontrado"
              renderOption={(props, recipient) => {
                const { key, ...optionProps } = props

                if (isSelectAllOption(recipient)) {
                  return (
                    <li
                      key={key}
                      {...optionProps}
                      className={`${optionProps.className ?? ''} border-b border-divider font-semibold text-primary`}
                    >
                      <span className="flex items-center gap-2">
                        {areAllSelected ? (
                          <RemoveDoneRounded fontSize="small" />
                        ) : (
                          <DoneAllRounded fontSize="small" />
                        )}
                        {areAllSelected
                          ? 'Desmarcar todos'
                          : `Selecionar todos (${recipientOptions.length})`}
                      </span>
                    </li>
                  )
                }

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
          </div>

          <div className="flex flex-col gap-2">
            <TextField
              name="content"
              label="Mensagem"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              onKeyDown={handleContentKeyDown}
              inputRef={contentInputRef}
              multiline
              minRows={5}
              fullWidth
              error={Boolean(fieldErrors.content)}
              helperText={fieldErrors.content}
              slotProps={{ htmlInput: { maxLength: MAX_CONTENT_LENGTH } }}
            />

            <div className="flex items-center gap-1">
              {FORMAT_ACTIONS.map(({ style, label, icon }) => (
                <Tooltip key={style} title={label}>
                  <IconButton
                    size="small"
                    aria-label={label}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => applyFormat(style)}
                  >
                    {icon}
                  </IconButton>
                </Tooltip>
              ))}
              <span className="ml-auto text-xs text-muted tabular-nums">
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>

            {content.trim() && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted">Pré-visualização</span>
                <div
                  tabIndex={0}
                  role="region"
                  aria-label="Pré-visualização da mensagem"
                  className="max-h-20 w-fit max-w-full overflow-y-auto rounded-2xl rounded-tl-sm bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100 scrollbar-thin focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                  <p className="text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap text-slate-800">
                    <FormattedText text={content} />
                  </p>
                </div>
              </div>
            )}
          </div>

          {message ? (
            <input type="hidden" name="mode" value={mode} />
          ) : (
            <RadioGroup
              name="mode"
              value={newMessageMode}
              onChange={(event) =>
                setNewMessageMode(event.target.value === 'schedule' ? 'schedule' : 'send-now')
              }
              aria-label="Como enviar"
              className="grid gap-3 sm:grid-cols-2"
            >
              {SEND_MODE_OPTIONS.map((option) => {
                const isSelected = newMessageMode === option.value

                return (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-primary ${isSelected ? 'border-primary bg-primary/5' : 'border-divider hover:border-slate-400'
                      }`}
                  >
                    <Radio value={option.value} className="sr-only" />
                    <IconTile icon={option.icon} size="sm" variant={isSelected ? 'gradient' : 'soft'} />
                    <span className="flex flex-col gap-0.5">
                      <span className="font-semibold">{option.title}</span>
                      <span className="text-sm text-muted">{option.description}</span>
                    </span>
                  </label>
                )
              })}
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