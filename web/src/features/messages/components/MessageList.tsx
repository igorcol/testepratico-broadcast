import { useState, type ReactElement } from 'react'
import {
  Avatar,
  AvatarGroup,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
} from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ScheduleIcon from '@mui/icons-material/Schedule'
import { summarizeRecipients } from '@/features/messages/recipients'
import type { Message, MessageStatus } from '@/features/messages/schemas'
import { getAvatarColorClasses, getInitials } from '@/shared/lib/avatar'
import { formatRelativeDateTime, formatTime, isSameDay } from '@/shared/lib/formatters'
import { DeleteOutlined } from '@mui/icons-material'

interface StatusDisplay {
  label: string
  icon: ReactElement
  pillClasses: string
  bubbleClasses: string
  tickClasses: string
}

const STATUS_DISPLAY: Record<MessageStatus, StatusDisplay> = {
  scheduled: {
    label: 'Agendada',
    icon: <ScheduleIcon />,
    pillClasses: 'bg-amber-100 text-amber-800',
    bubbleClasses: 'bg-amber-50 ring-1 ring-amber-100',
    tickClasses: 'text-amber-600',
  },
  sent: {
    label: 'Enviada',
    icon: <DoneAllIcon />,
    pillClasses: 'bg-emerald-100 text-emerald-800',
    bubbleClasses: 'bg-emerald-50 ring-1 ring-emerald-100',
    tickClasses: 'text-emerald-600',
  },
  canceled: {
    label: 'Cancelada',
    icon: <BlockIcon />,
    pillClasses: 'bg-slate-100 text-slate-600',
    bubbleClasses: 'bg-slate-50 ring-1 ring-slate-100',
    tickClasses: 'text-slate-400',
  },
}

const MAX_VISIBLE_AVATARS = 4
const LONG_CONTENT_CHARS = 280
const LONG_CONTENT_LINES = 4

const tidyContent = (content: string) => content.replace(/\n{3,}/g, '\n\n')

const isLongContent = (content: string) =>
  content.length > LONG_CONTENT_CHARS || content.split('\n').length > LONG_CONTENT_LINES

const describeTiming = ({ status, scheduledAt, sentAt }: Message) => {
  if (status === 'scheduled' && scheduledAt) {
    return `Agendada para ${formatRelativeDateTime(scheduledAt)}`
  }

  if (status === 'sent' && sentAt) {
    const sentLabel = `Enviada ${formatRelativeDateTime(sentAt)}`
    if (!scheduledAt) return sentLabel

    const scheduledLabel = isSameDay(scheduledAt, sentAt)
      ? formatTime(scheduledAt)
      : formatRelativeDateTime(scheduledAt)
    return `${sentLabel}, agendada para ${scheduledLabel}`
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
  const [isExpanded, setIsExpanded] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  const status = STATUS_DISPLAY[message.status]
  const content = tidyContent(message.content)
  const bubbleTime = message.sentAt ?? message.scheduledAt
  const isMenuOpen = menuAnchor !== null
  const menuId = `message-menu-${message.id}`

  const closeMenuAndRun = (action: (message: Message) => void) => () => {
    setMenuAnchor(null)
    action(message)
  }

  return (
    <Paper variant="outlined" className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-center gap-3">

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

        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
          Para {summarizeRecipients(message.recipients)}
        </p>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold [&_svg]:text-sm ${status.pillClasses}`}
        >
          {status.icon}
          {status.label}
        </span>

        <IconButton
          size="small"
          aria-label="Ações da mensagem"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-controls={isMenuOpen ? menuId : undefined}
          onClick={(event) => setMenuAnchor(event.currentTarget)}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </div>

      <div
        className={`w-fit max-w-full rounded-2xl rounded-tl-sm px-4 py-3 sm:max-w-[85%] ${status.bubbleClasses}`}
      >
        <p
          className={`text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap text-slate-800 ${
            isExpanded ? '' : 'line-clamp-4'
          }`}
        >
          {content}
        </p>

        <div className="mt-1.5 flex items-center justify-end gap-3">
          {isLongContent(content) && (
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded((current) => !current)}
              className="mr-auto cursor-pointer text-sm font-semibold text-primary hover:underline"
            >
              {isExpanded ? 'Ver menos' : 'Ver mais'}
            </button>
          )}
          {bubbleTime && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 tabular-nums">
              {formatTime(bubbleTime)}
              <span aria-hidden className={`[&_svg]:text-base ${status.tickClasses}`}>
                {status.icon}
              </span>
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-muted">
        {describeTiming(message)}
        {message.editedAt && ' · editada'}
      </p>

      <Menu
        id={menuId}
        anchorEl={menuAnchor}
        open={isMenuOpen}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {message.status === 'scheduled' && (
          <MenuItem onClick={closeMenuAndRun(onEdit)}>
            <ListItemIcon>
              <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>
            Editar
          </MenuItem>
        )}
        <MenuItem onClick={closeMenuAndRun(onDelete)} className="text-red-600">
          <ListItemIcon className="text-red-600">
            <DeleteOutlined fontSize="small" />
          </ListItemIcon>
          Excluir
        </MenuItem>
      </Menu>
    </Paper>
  )
}