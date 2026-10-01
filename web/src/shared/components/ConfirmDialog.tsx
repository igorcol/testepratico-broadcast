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
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { IconTile } from '@/shared/components/IconTile'

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
      <div className="flex flex-col items-center gap-3 px-6 pt-7 text-center">
        <IconTile icon={<WarningAmberRoundedIcon />} variant="danger" size="lg" />
        <DialogTitle className="p-0">{title}</DialogTitle>
      </div>

      <DialogContent className="flex flex-col gap-4 pt-2 text-center">
        <DialogContentText>{description}</DialogContentText>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      </DialogContent>

      <DialogActions className="gap-2 px-6 pb-6">
        <Button fullWidth variant="outlined" color="inherit" onClick={onClose} disabled={isConfirming}>
          Cancelar
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="error"
          onClick={handleConfirm}
          loading={isConfirming}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}