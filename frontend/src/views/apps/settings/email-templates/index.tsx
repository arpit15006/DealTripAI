'use client'

// React Imports
import { useMemo, useState } from 'react'

// Third-party Imports
import { PencilIcon, SaveIcon } from 'lucide-react'
import { toast } from 'sonner'

// Type Imports
import type { EmailSection } from '@/types/settings/email-template-types'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import TemplateBody from '@/views/apps/settings/email-templates/template-body'
import {
  TemplateFooter,
  TemplateHeader,
  TemplateMessageMeta
} from '@/views/apps/settings/email-templates/template-chrome'
import TemplateStats from '@/views/apps/settings/email-templates/template-stats'

// Store Imports
import { useCompanyProfile } from '@/store/use-store-information-store'
import { useEmailTemplatesStore } from '@/store/use-email-templates-store'

// Utils Imports
import { resolveVariables } from '@/utils/variable-utils'

const EmailTemplatesView = () => {
  const items = useEmailTemplatesStore(state => state.items)
  const updateTemplate = useEmailTemplatesStore(state => state.updateTemplate)
  const { companyProfile } = useCompanyProfile()

  const templateItems = useMemo(() => items.map(item => ({ label: item.name, value: item.id })), [items])

  const [selectedId, setSelectedId] = useState(items[0]?.id ?? '')
  const template = items.find(item => item.id === selectedId) ?? items[0]

  const [isEditing, setIsEditing] = useState(false)
  const [subject, setSubject] = useState(template?.subject ?? '')
  const [sections, setSections] = useState<EmailSection[]>(template?.sections ?? [])

  const resolve = (text: string) =>
    resolveVariables(text, {
      companyName: companyProfile.name,
      supportEmail: companyProfile.supportEmail,
      supportPhone: companyProfile.supportPhone
    })

  const handleSelectTemplate = (id: string) => {
    const next = items.find(item => item.id === id)

    if (!next) return

    setSelectedId(id)
    setSubject(next.subject)
    setSections(next.sections)
    setIsEditing(false)
  }

  const handleToggleEdit = () => {
    if (isEditing && template) {
      setSubject(template.subject)
      setSections(template.sections)
    }

    setIsEditing(prev => !prev)
  }

  const handleSectionChange = (section: EmailSection) => {
    setSections(prev => prev.map(item => (item.id === section.id ? section : item)))
  }

  const handleSave = () => {
    if (!template) return

    updateTemplate(template.id, { name: template.name, subject, sections })
    toast.success('Email template updated')
    setIsEditing(false)
  }

  if (!template) return null

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Email Templates</h1>
        <p className='text-muted-foreground text-sm'>Manage the automated emails sent to your customers.</p>
      </div>

      <TemplateStats items={items} />

      <div className='flex flex-wrap items-center justify-between gap-4'>
        <Select items={templateItems} value={template.id} onValueChange={value => value && handleSelectTemplate(value)}>
          <SelectTrigger className='w-64'>
            <SelectValue placeholder='Select a template' />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {templateItems.map(item => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className='flex items-center gap-2'>
          <Button type='button' variant={isEditing ? 'secondary' : 'outline'} onClick={handleToggleEdit}>
            <PencilIcon className='size-4' />
            Edit
          </Button>
          <Button type='button' onClick={handleSave} disabled={!isEditing}>
            <SaveIcon className='size-4' />
            Save Changes
          </Button>
        </div>
      </div>

      <div className='bg-muted/40 rounded-xl border p-4 sm:p-8'>
        <Card className='mx-auto overflow-hidden p-0 shadow-sm'>
          <TemplateMessageMeta
            toEmail={resolve('{{customerEmail}}')}
            subject={subject}
            isEditing={isEditing}
            onSubjectChange={setSubject}
            resolve={resolve}
          />
          <TemplateHeader event={template.event} resolve={resolve} />
          <TemplateBody
            sections={sections}
            isEditing={isEditing}
            onSectionChange={handleSectionChange}
            resolve={resolve}
          />
          <TemplateFooter />
        </Card>
      </div>
    </div>
  )
}

export default EmailTemplatesView
