'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { Maximize2Icon, MinusIcon, XIcon } from 'lucide-react'

// Type Imports
import type { TemplateEvent } from '@/types/settings/email-template-types'

// Component Imports
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

// SVGs Imports
import FacebookIcon from '@/assets/svg/facebook-icon'
import InstagramIcon from '@/assets/svg/instagram-icon'
import LogoSvg from '@/assets/svg/logo'
import TwitterIcon from '@/assets/svg/twitter-icon'

// Store Imports
import { useCompanyProfile, useSocialLinks } from '@/store/use-store-information-store'

const FOOTER_LEGAL_LINKS = [
  { label: 'Unsubscribe', url: '#' },
  { label: 'Privacy Policy', url: '#' },
  { label: 'Terms & Conditions', url: '#' }
]

const TEMPLATE_REFERENCE: Partial<Record<TemplateEvent, { label: string; token: string }>> = {
  'booking-confirmation': { label: 'Booking Reference', token: '{{bookingReference}}' },
  'payment-receipt': { label: 'Receipt', token: '{{receiptId}}' },
  'booking-cancelled': { label: 'Booking Reference', token: '{{bookingReference}}' }
}

const SOCIAL_ICONS = { facebook: FacebookIcon, instagram: InstagramIcon, twitter: TwitterIcon } as const

type TemplateLogoProps = {
  logoUrl: string
  name: string
  className: string
}

const TemplateLogo = ({ logoUrl, name, className }: TemplateLogoProps) =>
  logoUrl ? (
    <img src={logoUrl} alt={name} className={`${className} rounded-full object-cover`} />
  ) : (
    <LogoSvg className={className} />
  )

type TemplateMessageMetaProps = {
  toEmail: string
  subject: string
  isEditing: boolean
  onSubjectChange: (value: string) => void
  resolve: (text: string) => string
}

export const TemplateMessageMeta = ({
  toEmail,
  subject,
  isEditing,
  onSubjectChange,
  resolve
}: TemplateMessageMetaProps) => {
  const resolvedSubject = resolve(subject) || 'New Message'

  return (
    <div className='border-b'>
      <div className='bg-primary/10 flex items-center justify-between gap-3 px-4 py-2.5'>
        <p className='truncate text-sm font-medium'>{resolvedSubject}</p>
        <div className='text-muted-foreground flex shrink-0 items-center gap-2.5'>
          <MinusIcon className='size-3.5' />
          <Maximize2Icon className='size-3' />
          <XIcon className='size-3.5' />
        </div>
      </div>

      <div className='flex items-center justify-between gap-3 border-b px-4 py-2.5 text-sm'>
        <p className='truncate'>
          <span className='text-muted-foreground'>To</span> <span className='ml-2'>{toEmail}</span>
        </p>
        <span className='text-muted-foreground shrink-0 text-xs'>Cc Bcc</span>
      </div>

      <div className='px-4 py-2.5'>
        {isEditing ? (
          <Input
            value={subject}
            onChange={e => onSubjectChange(e.target.value)}
            className='h-8 border-none px-0 text-sm font-medium shadow-none focus-visible:ring-0'
          />
        ) : (
          <p className='text-sm font-medium'>{resolvedSubject}</p>
        )}
      </div>
    </div>
  )
}

type TemplateHeaderProps = {
  event: TemplateEvent
  resolve: (text: string) => string
}

export const TemplateHeader = ({ event, resolve }: TemplateHeaderProps) => {
  const { companyProfile } = useCompanyProfile()

  const reference = TEMPLATE_REFERENCE[event]

  return (
    <div className='flex items-center justify-between gap-4 p-6'>
      <div className='flex items-center gap-3'>
        <TemplateLogo logoUrl={companyProfile.logoUrl} name={companyProfile.name} className='size-10' />
        <p className='text-primary text-lg font-bold'>{companyProfile.name}</p>
      </div>
      {reference && (
        <div className='text-right'>
          <p className='text-muted-foreground text-xs'>{reference.label}</p>
          <p className='text-primary text-sm font-semibold'>{resolve(reference.token)}</p>
        </div>
      )}
    </div>
  )
}

export const TemplateFooter = () => {
  const { companyProfile } = useCompanyProfile()
  const { socialLinks } = useSocialLinks()

  const activeSocials = (Object.keys(SOCIAL_ICONS) as (keyof typeof SOCIAL_ICONS)[]).filter(
    platform => socialLinks[platform]
  )

  const addressLine = [companyProfile.address.city, companyProfile.address.state, companyProfile.address.zipCode]
    .filter(Boolean)
    .join(', ')

  return (
    <div className='bg-muted p-6'>
      <div className='flex flex-col justify-between gap-4 sm:flex-row'>
        <div className='flex flex-col gap-3'>
          <div className='flex items-center gap-2'>
            <TemplateLogo logoUrl={companyProfile.logoUrl} name={companyProfile.name} className='size-8' />
            <span className='text-primary text-lg font-semibold'>{companyProfile.name}</span>
          </div>
          {activeSocials.length > 0 && (
            <div className='flex items-center gap-2'>
              {activeSocials.map(platform => {
                const Icon = SOCIAL_ICONS[platform]

                return (
                  <Link
                    key={platform}
                    href={socialLinks[platform]}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex size-7 items-center justify-center'
                  >
                    <Icon className='size-3.5' />
                  </Link>
                )
              })}
            </div>
          )}
        </div>
        <div className='text-sm sm:text-right'>
          <p>{companyProfile.address.street}</p>
          <p>{addressLine}</p>
          <p>{companyProfile.supportPhone}</p>
          <p>{companyProfile.supportEmail}</p>
        </div>
      </div>
      <Separator className='my-4' />
      <div className='flex flex-col items-center gap-1 text-center text-xs'>
        <p>
          © {new Date().getFullYear()} {companyProfile.name}. All rights reserved.
        </p>
        <p>
          {FOOTER_LEGAL_LINKS.map((link, index) => (
            <span key={link.label}>
              {index > 0 && ' | '}
              {link.label}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}
