// Third-party Imports
import { create } from 'zustand'

// Type Imports
import type { NotificationChannel, NotificationTypeSetting } from '@/types/account/notification-types'

// Data Imports
import { db } from '@/fake-db/account/notification-settings'

interface NotificationSettingsState {
  settings: NotificationTypeSetting[]
  toggleChannel: (typeId: string, channel: NotificationChannel) => void
}

export const useNotificationSettingsStore = create<NotificationSettingsState>()(set => ({
  settings: db,

  toggleChannel: (typeId, channel) =>
    set(state => ({
      settings: state.settings.map(setting =>
        setting.id === typeId
          ? { ...setting, channels: { ...setting.channels, [channel]: !setting.channels[channel] } }
          : setting
      )
    }))
}))
