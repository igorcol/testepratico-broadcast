import { createContext } from 'react'
import type { AlertColor } from '@mui/material'

export interface ToastContextValue {
  showToast: (message: string, severity?: AlertColor) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)