// Type Imports
import type { NotificationTypeSetting } from '@/types/account/notification-types'

export const db: NotificationTypeSetting[] = [
  {
    id: 'new-for-you',
    label: 'New for you',
    description: 'Email when someone follows you or mentions you.',
    channels: { email: true, sms: true, whatsapp: false }
  },
  {
    id: 'account-activity',
    label: 'Account activity',
    description: 'Email when your account has new activity or security alerts.',
    channels: { email: true, sms: true, whatsapp: false }
  },
  {
    id: 'new-browser',
    label: 'A new browser used to sign in',
    description: 'Email when a new browser is used to sign in.',
    channels: { email: true, sms: true, whatsapp: true }
  },
  {
    id: 'new-device',
    label: 'A new device is linked',
    description: 'Email when a new device is linked to your account.',
    channels: { email: true, sms: true, whatsapp: false }
  }
]
