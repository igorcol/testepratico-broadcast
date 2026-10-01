import type { ReactElement } from 'react'
import { Avatar, AvatarGroup, IconButton, Paper, Typography } from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ScheduleIcon from '@mui/icons-material/Schedule'
import { summarizeRecipients } from '@/features/messages/recipients'
import type { Message, MessageStatus } from '@/features/messages/schemas'
import { getAvatarColorClasses, getInitials } from '@/shared/lib/avatar'
import { formatDateTime } from '@/shared/lib/formatters'
import { DeleteOutlined } from '@mui/icons-material'

interface StatusDisplay {
  label: string
  icon: ReactElement
  badgeClasses: string
  accentClasses: string
}

const STATUS_DISPLAY: Record<MessageStatus, StatusDisplay> = {
  scheduled: {
    label: 'Agendada',
    icon: <ScheduleIcon />,
    badgeClasses: 'bg-amber-100 text-amber-800',
    accentClasses: 'border-l-amber-400',
  },
  sent: {
    label: 'Enviada',
    icon: <DoneAllIcon />,
    badgeClasses: 'bg-emerald-100 text-emerald-800',
    accentClasses: 'border-l-emerald-500',
  },
  canceled: {
    label: 'Cancelada',
    icon: <BlockIcon />,
    badgeClasses: 'bg-slate-100 text-slate-600',
    accentClasses: 'border-l-slate-300',
  },
}

const MAX_VISIBLE_AVATARS = 4

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
    <Paper variant="outlined" className={`flex flex-col gap-4 border-l-4 p-5 ${status.accentClasses}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold [&_svg]:text-sm ${status.badgeClasses}`}
        >
          {status.icon}
          {status.label}
        </span>
        <Typography variant="body2" color="text.secondary">
          {describeTiming(message)}
        </Typography>
        {message.editedAt && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            editada
          </span>
        )}
        <div className="ml-auto flex gap-1">
          {message.status === 'scheduled' && (
            <IconButton size="small" aria-label="Editar mensagem" onClick={() => onEdit(message)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small" aria-label="Excluir mensagem" onClick={() => onDelete(message)}>
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </div>
      </div>

      <Typography className="line-clamp-4 whitespace-pre-wrap wrap-break-word text-slate-800">
        {message.content}
      </Typography>

      <div className="flex items-center gap-3 border-t border-divider pt-4">
        <AvatarGroup
          max={MAX_VISIBLE_AVATARS}
          aria-hidden
          className="[&_.MuiAvatar-root]:size-7 [&_.MuiAvatar-root]:text-[11px]"
        >
          {message.recipients.map((recipient) => (
            <Avatar key={recipient.contactId} className={getAvatarColorClasses(recipient.name)}>
              {getInitials(recipient.name)}
            </Avatar>
          ))}
        </AvatarGroup>
        <Typography variant="body2" color="text.secondary" className="min-w-0 truncate">
          Para {summarizeRecipients(message.recipients)}
        </Typography>
      </div>
    </Paper>
  )
}