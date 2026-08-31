// Third-party Imports
import { create } from 'zustand'
import { format } from 'date-fns'

// Type Imports
import type { EmailTemplate, UpdateEmailTemplateInput } from '@/types/settings/email-template-types'

// Data Imports
import { db } from '@/fake-db/settings/email-templates'

type EmailTemplatesData = {
  items: EmailTemplate[]
}

type EmailTemplatesActions = {
  updateTemplate: (id: string, input: UpdateEmailTemplateInput) => void
  toggleTemplateStatus: (id: string) => void
}

export type EmailTemplatesStore = EmailTemplatesData & EmailTemplatesActions

export const useEmailTemplatesStore = create<EmailTemplatesStore>()(set => ({
  items: db,

  updateTemplate: (id, input) => {
    const today = format(new Date(), 'yyyy-MM-dd')

    set(state => ({
      items: state.items.map(item => (item.id === id ? { ...item, ...input, updatedAt: today } : item))
    }))
  },

  toggleTemplateStatus: id => {
    const today = format(new Date(), 'yyyy-MM-dd')

    set(state => ({
      items: state.items.map(item =>
        item.id === id ? { ...item, status: item.status === 'active' ? 'inactive' : 'active', updatedAt: today } : item
      )
    }))
  }
}))
