import { useState, type ReactNode } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

interface ConfirmDialogProps {
  title: string
  description: ReactNode
  confirmLabel: string
  onConfirm: () => Promise<unknown>
  onClose: () => void
  getErrorMessage: (error: unknown) => string
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
  getErrorMessage,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleConfirm = async () => {
    setErrorMessage('')
    setIsConfirming(true)

    try {
      await onConfirm()
      onClose()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      setIsConfirming(false)
    }
  }

  return (
    <Dialog open onClose={isConfirming ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        <DialogContentText>{description}</DialogContentText>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isConfirming}>
          Cancelar
        </Button>
        <Button color="error" variant="contained" onClick={handleConfirm} loading={isConfirming}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}