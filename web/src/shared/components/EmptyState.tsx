import type { ReactNode } from 'react'
import { Paper, Typography } from '@mui/material'
import InboxRoundedIcon from '@mui/icons-material/InboxRounded'
import { IconTile } from '@/shared/components/IconTile'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
  icon?: ReactNode
}

export function EmptyState({ title, description, action, icon = <InboxRoundedIcon /> }: EmptyStateProps) {
  return (
    <Paper
      variant="outlined"
      className="flex flex-col items-center gap-3 border-2 border-dashed border-slate-300 bg-surface/60 px-6 py-14 text-center shadow-none"
    >
      <IconTile icon={icon} size="lg" />
      <Typography variant="h6" component="p" className="mt-1">
        {title}
      </Typography>
      <Typography color="text.secondary" className="max-w-sm">
        {description}
      </Typography>
      {action && <div className="mt-2">{action}</div>}
    </Paper>
  )
}