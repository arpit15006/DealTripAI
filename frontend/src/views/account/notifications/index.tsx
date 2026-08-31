'use client'

// Third-party Imports
import { toast } from 'sonner'
import { MailIcon, MessageCircleIcon, MessageSquareIcon } from 'lucide-react'

// Type Imports
import type { NotificationChannel } from '@/types/account/notification-types'
import { NOTIFICATION_CHANNEL_LIST } from '@/types/account/notification-types'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Store Imports
import { useNotificationSettingsStore } from '@/store/use-notification-settings-store'

const CHANNEL_ICONS: Record<NotificationChannel, typeof MailIcon> = {
  email: MailIcon,
  sms: MessageSquareIcon,
  whatsapp: MessageCircleIcon
}

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp'
}

const NotificationsView = () => {
  const settings = useNotificationSettingsStore(state => state.settings)
  const toggleChannel = useNotificationSettingsStore(state => state.toggleChannel)

  const handleSave = () => {
    toast.success('Notification preferences saved!')
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold'>Notifications</h1>
        <p className='text-muted-foreground text-sm'>Manage how you receive notifications for account activity</p>
      </div>

      <Card className='pt-0'>
        <CardContent className='border-b px-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                {NOTIFICATION_CHANNEL_LIST.map(channel => {
                  const Icon = CHANNEL_ICONS[channel]

                  return (
                    <TableHead key={channel} className='text-center'>
                      <span className='inline-flex items-center gap-1.5'>
                        <Icon className='size-4' />
                        {CHANNEL_LABELS[channel]}
                      </span>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.map(setting => (
                <TableRow key={setting.id}>
                  <TableCell>
                    <p className='font-medium'>{setting.label}</p>
                    <p className='text-muted-foreground text-sm'>{setting.description}</p>
                  </TableCell>
                  {NOTIFICATION_CHANNEL_LIST.map(channel => (
                    <TableCell key={channel} className='text-center'>
                      <Switch
                        checked={setting.channels[channel]}
                        onCheckedChange={() => toggleChannel(setting.id, channel)}
                        aria-label={`${CHANNEL_LABELS[channel]} notifications for ${setting.label}`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardContent className='flex justify-end'>
          <Button type='button' onClick={handleSave}>
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotificationsView
