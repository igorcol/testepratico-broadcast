import { useEffect } from 'react'
import { useAuthenticatedUser } from '@/features/auth/useAuth'
import { subscribeToSentSince } from '@/features/messages/api'
import { describeScheduledSent } from '@/features/messages/notifications'
import { useToast } from '@/shared/toast/useToast'

const CLOCK_SKEW_MARGIN_MS = 5 * 60_000

export const useScheduledSendNotifications = () => {
  const { uid } = useAuthenticatedUser()
  const { showToast } = useToast()

  useEffect(() => {
    const since = new Date(Date.now() - CLOCK_SKEW_MARGIN_MS)

    return subscribeToSentSince(
      uid,
      since,
      (messages) => {
        const scheduledMessages = messages.filter(({ scheduledAt }) => scheduledAt !== null)
        if (scheduledMessages.length > 0) showToast(describeScheduledSent(scheduledMessages))
      },
      (error) => console.error('Sent messages listener failed', error),
    )
  }, [uid, showToast])
}