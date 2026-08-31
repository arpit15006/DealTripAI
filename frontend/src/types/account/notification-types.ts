export type NotificationChannel = 'email' | 'sms' | 'whatsapp'

export const NOTIFICATION_CHANNEL_LIST: NotificationChannel[] = ['email', 'sms', 'whatsapp']

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp'
}

export interface NotificationTypeSetting {
  id: string
  label: string
  description: string
  channels: Record<NotificationChannel, boolean>
}
