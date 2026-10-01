import { useContext } from 'react'
import { ToastContext, type ToastContextValue } from '@/shared/toast/toastContext'

export const useToast = (): ToastContextValue => {
  const toastContext = useContext(ToastContext)

  if (!toastContext) {
    throw new Error('useToast deve ser usado em ToastProvider')
  }

  return toastContext
}