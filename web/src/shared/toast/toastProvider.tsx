import { useCallback, useMemo, useState, type ReactNode, type SyntheticEvent } from 'react'
import { Alert, Snackbar, type AlertColor, type SnackbarCloseReason } from '@mui/material'
import { ToastContext } from '@/shared/toast/toastContext'

const TOAST_DURATION_MS = 5000

interface Toast {
  id: number
  message: string
  severity: AlertColor
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<Toast | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const showToast = useCallback((message: string, severity: AlertColor = 'success') => {
    setToast({ id: Date.now(), message, severity })
    setIsOpen(true)
  }, [])

  const contextValue = useMemo(() => ({ showToast }), [showToast])

  const handleClose = (_event: SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') return
    setIsOpen(false)
  }

  return (
    <ToastContext value={contextValue}>
      {children}
      <Snackbar
        key={toast?.id}
        open={isOpen}
        autoHideDuration={TOAST_DURATION_MS}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert
            variant="filled"
            severity={toast.severity}
            onClose={() => setIsOpen(false)}
            className="items-center rounded-xl shadow-lg"
          >
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext>
  )
}