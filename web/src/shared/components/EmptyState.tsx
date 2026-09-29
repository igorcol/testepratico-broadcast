import type { ReactNode } from 'react'
import { Paper, Typography } from '@mui/material'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Paper variant="outlined" className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <Typography variant="h6" component="p">
        {title}
      </Typography>
      <Typography color="text.secondary">{description}</Typography>
      {action && <div className="mt-2">{action}</div>}
    </Paper>
  )
}