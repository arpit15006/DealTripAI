'use client'

// React Imports
import type { ReactNode } from 'react'

// Third-party Imports
import {
  CalendarIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  HeadsetIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ReceiptTextIcon,
  UsersIcon
} from 'lucide-react'

// Type Imports
import type { EmailSection } from '@/types/settings/email-template-types'

// Component Imports
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

// Store Imports
import { useCompanyProfile } from '@/store/use-store-information-store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const EDIT_INPUT_CLASS = 'border-primary/40 border-dashed bg-transparent'

type EditableTextProps = {
  value: string
  onChange: (value: string) => void
  className?: string
  multiline?: boolean
}

const EditableText = ({ value, onChange, className, multiline }: EditableTextProps) =>
  multiline ? (
    <Textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={2}
      className={`${EDIT_INPUT_CLASS} ${className ?? ''}`}
    />
  ) : (
    <Input
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`${EDIT_INPUT_CLASS} h-auto ${className ?? ''}`}
    />
  )

type SectionProps = {
  section: EmailSection
  isEditing: boolean
  onChange: (section: EmailSection) => void
  resolve: (text: string) => string
}

const SectionView = ({ section, isEditing, onChange, resolve }: SectionProps) => {
  const { companyProfile } = useCompanyProfile()

  switch (section.type) {
    case 'banner':
      return (
        <div className='px-6'>
          <div className='flex items-start gap-3 rounded-xl bg-green-600/10 p-4 dark:border-green-400 dark:bg-green-400/10'>
            <span className='text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full bg-green-600 dark:bg-green-400'>
              <CheckCircle2Icon className='size-5' />
            </span>

            <div className='flex-1'>
              {isEditing ? (
                <EditableText
                  value={section.title}
                  onChange={title => onChange({ ...section, title })}
                  className='font-semibold text-green-600 dark:text-green-400'
                />
              ) : (
                <p className='font-semibold text-green-600 dark:text-green-400'>{resolve(section.title)}</p>
              )}
              {isEditing ? (
                <EditableText
                  value={section.message}
                  onChange={message => onChange({ ...section, message })}
                  multiline
                  className='mt-1.5 text-sm'
                />
              ) : (
                <p className='text-muted-foreground mt-0.5 text-sm'>{resolve(section.message)}</p>
              )}
            </div>
          </div>
        </div>
      )

    case 'hero':
      return (
        <div className='px-6'>
          <div className='overflow-hidden rounded-xl border'>
            <div className='flex flex-col gap-4 p-4 sm:flex-row'>
              <img
                src={section.image}
                alt={resolve(section.title)}
                className='h-40 w-full shrink-0 rounded-lg object-cover sm:h-auto sm:w-36'
              />
              <div className='flex flex-col gap-1.5'>
                <span className='bg-primary/10 text-primary w-fit rounded-full px-2.5 py-1 text-xs font-medium'>
                  {resolve(section.badge)}
                </span>
                <p className='text-lg font-bold'>{resolve(section.title)}</p>
                <p className='text-muted-foreground flex items-center gap-1 text-sm'>
                  <MapPinIcon className='size-3.5' />
                  {resolve(section.location)}
                </p>
                {isEditing ? (
                  <EditableText
                    value={section.description}
                    onChange={description => onChange({ ...section, description })}
                    multiline
                    className='text-sm'
                  />
                ) : (
                  <p className='text-muted-foreground text-sm'>{resolve(section.description)}</p>
                )}
              </div>
            </div>
            <Separator />
            <div className='grid grid-cols-2 gap-4 p-4'>
              {section.infoItems.map((item, index) => (
                <div key={index} className='flex items-start gap-2'>
                  {index === 0 ? (
                    <CalendarIcon className='text-primary mt-1 size-5 shrink-0' />
                  ) : (
                    <UsersIcon className='text-primary mt-1 size-5 shrink-0' />
                  )}
                  <div>
                    <p className='font-semibold'>{resolve(item.label)}</p>
                    <p className='text-muted-foreground'>{resolve(item.value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'detailsGrid':
      return (
        <div className='rounded-xl border p-4'>
          <div className='mb-3 flex items-center gap-2'>
            <ClipboardListIcon className='text-primary size-4' />
            <p className='text-sm font-semibold'>{resolve(section.title)}</p>
          </div>
          <div className='flex flex-col'>
            {section.rows.map((row, index) => (
              <div
                key={index}
                className='flex items-center justify-between gap-4 border-b py-2 text-sm last:border-b-0 last:pb-0 max-sm:flex-col max-sm:items-start'
              >
                <span className='text-muted-foreground'>{resolve(row.label)}</span>
                <span className='text-right font-semibold'>{resolve(row.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )

    case 'summaryGrid':
      return (
        <div className='rounded-xl border p-4'>
          <div className='mb-3 flex items-center gap-2'>
            <ReceiptTextIcon className='text-primary size-4' />
            <p className='text-sm font-semibold'>{resolve(section.title)}</p>
          </div>
          <div className='flex flex-col gap-2'>
            {section.rows.map((row, index) => (
              <div key={index} className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>{resolve(row.label)}</span>
                <span className={row.emphasis === 'discount' ? 'font-medium text-emerald-600' : 'font-medium'}>
                  {resolve(row.value)}
                </span>
              </div>
            ))}
          </div>
          <Separator className='my-3' />
          <div className='flex items-center justify-between'>
            <span className='text-sm font-semibold'>{resolve(section.totalLabel)}</span>
            <span className='text-primary text-base font-bold'>{resolve(section.totalValue)}</span>
          </div>
          <div className='bg-muted mt-3 flex items-center gap-2 rounded-lg p-2.5'>
            <Badge className='text-primary-foreground border-none bg-green-600 dark:bg-green-400'>
              {resolve(section.statusLabel)}
            </Badge>
            <span className='text-muted-foreground text-xs'>{resolve(section.statusNote)}</span>
          </div>
        </div>
      )

    case 'button':
      return (
        <div className='px-6 text-center'>
          {isEditing ? (
            <EditableText
              value={section.label}
              onChange={label => onChange({ ...section, label })}
              className='text-center'
            />
          ) : (
            <span className='bg-primary text-primary-foreground block w-full rounded-lg px-4 py-3 text-sm font-semibold'>
              {resolve(section.label)}
            </span>
          )}
          {isEditing ? (
            <EditableText
              value={section.helperText}
              onChange={helperText => onChange({ ...section, helperText })}
              className='mt-2 text-center text-xs'
            />
          ) : (
            <p className='text-muted-foreground mt-2 text-xs'>{resolve(section.helperText)}</p>
          )}
        </div>
      )

    case 'help':
      return (
        <div className='px-6'>
          <div className='bg-primary/10 flex flex-col justify-between gap-3 rounded-xl p-4 lg:flex-row'>
            <div className='flex items-center gap-3'>
              <Avatar className='size-10'>
                <AvatarFallback className='bg-primary text-primary-foreground'>
                  <HeadsetIcon className='size-6' />
                </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                {isEditing ? (
                  <EditableText
                    value={section.title}
                    onChange={title => onChange({ ...section, title })}
                    className='text-base font-semibold'
                  />
                ) : (
                  <p className='text-base font-semibold'>{resolve(section.title)}</p>
                )}
                {isEditing ? (
                  <EditableText
                    value={section.description}
                    onChange={description => onChange({ ...section, description })}
                    multiline
                    className='mt-1 text-xs'
                  />
                ) : (
                  <p className='text-muted-foreground text-xs'>{resolve(section.description)}</p>
                )}
              </div>
            </div>
            <div className='flex flex-col gap-1 pl-12 text-xs'>
              <span className='flex items-center gap-1.5'>
                <PhoneIcon className='size-3.5' />
                {companyProfile.supportPhone}
              </span>
              <span className='flex items-center gap-1.5'>
                <MailIcon className='size-3.5' />
                {companyProfile.supportEmail}
              </span>
            </div>
          </div>
        </div>
      )

    default:
      return null
  }
}

type TemplateBodyProps = {
  sections: EmailSection[]
  isEditing: boolean
  onSectionChange: (section: EmailSection) => void
  resolve: (text: string) => string
}

const TemplateBody = ({ sections, isEditing, onSectionChange, resolve }: TemplateBodyProps) => {
  const nodes: ReactNode[] = []

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    const next = sections[i + 1]

    if (section.type === 'detailsGrid' || section.type === 'summaryGrid') {
      const isPaired = section.type === 'detailsGrid' && next?.type === 'summaryGrid'

      nodes.push(
        <div key={section.id} className={`grid grid-cols-1 gap-4 px-6 ${isPaired ? 'lg:grid-cols-2' : ''}`}>
          <SectionView section={section} isEditing={isEditing} onChange={onSectionChange} resolve={resolve} />
          {isPaired && (
            <SectionView section={next} isEditing={isEditing} onChange={onSectionChange} resolve={resolve} />
          )}
        </div>
      )
      if (isPaired) i++
      continue
    }

    nodes.push(
      <SectionView
        key={section.id}
        section={section}
        isEditing={isEditing}
        onChange={onSectionChange}
        resolve={resolve}
      />
    )
  }

  return <>{nodes}</>
}

export default TemplateBody
