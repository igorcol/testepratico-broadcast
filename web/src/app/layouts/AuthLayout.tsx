import { Paper, Typography } from '@mui/material'
import { Outlet } from 'react-router'

export function AuthLayout() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <Typography variant="h4" component="p" className="font-semibold text-primary">
        Broadcast
      </Typography>
      <Paper variant="outlined" className="w-full max-w-sm p-8">
        <Outlet />
      </Paper>
    </main>
  )
}