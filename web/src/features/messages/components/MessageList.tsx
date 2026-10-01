import type { ReactElement } from 'react'
import { Chip, IconButton, Paper, Typography, type ChipProps } from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ScheduleIcon from '@mui/icons-material/Schedule'
import { summarizeRecipients } from '@/features/messages/recipients'
import type { Message, MessageStatus } from '@/features/messages/schemas'
import { formatDateTime } from '@/shared/lib/formatters'
import { DeleteOutlined } from '@mui/icons-material'

interface StatusDisplay {
  label: string
  color: ChipProps['color']
  icon: ReactElement
}


const STATUS_DISPLAY: Record<MessageStatus, StatusDisplay> = {
  scheduled: { label: 'Agendada', color: 'info', icon: <ScheduleIcon /> },
  sent: { label: 'Enviada', color: 'success', icon: <DoneAllIcon /> },
  canceled: { label: 'Cancelada', color: 'default', icon: <BlockIcon /> },  // Cancelada não aparece na tela
}

const describeTiming = ({ status, scheduledAt, sentAt }: Message) => {
  if (status === 'scheduled' && scheduledAt) {
    return `Agendada para ${formatDateTime(scheduledAt)}`
  }

  if (status === 'sent' && sentAt) {
    const sentLabel = `Enviada em ${formatDateTime(sentAt)}`
    return scheduledAt ? `${sentLabel}, agendada para ${formatDateTime(scheduledAt)}` : sentLabel
  }

  return ''
}

interface MessageListProps {
  messages: Message[]
  onEdit: (message: Message) => void
  onDelete: (message: Message) => void
}

export function MessageList({ messages, onEdit, onDelete }: MessageListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {messages.map((message) => (
        <li key={message.id}>
          <MessageCard message={message} onEdit={onEdit} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  )
}

interface MessageCardProps {
  message: Message
  onEdit: (message: Message) => void
  onDelete: (message: Message) => void
}

function MessageCard({ message, onEdit, onDelete }: MessageCardProps) {
  const status = STATUS_DISPLAY[message.status]

  return (
    <Paper variant="outlined" className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chip size="small" color={status.color} icon={status.icon} label={status.label} />
        <Typography variant="body2" color="text.secondary">
          {describeTiming(message)}
        </Typography>
        {message.editedAt && (
          <Typography variant="caption" color="text.secondary">
            (editada)
          </Typography>
        )}
        <div className="ml-auto flex gap-1">
          <IconButton size="small" aria-label="Editar mensagem" onClick={() => onEdit(message)}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="Excluir mensagem" onClick={() => onDelete(message)}>
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </div>
      </div>

      <Typography className="line-clamp-4 whitespace-pre-wrap wrap-break-word">
        {message.content}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Para {summarizeRecipients(message.recipients)}
      </Typography>
    </Paper>
  )
}