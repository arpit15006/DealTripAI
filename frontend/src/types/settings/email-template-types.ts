export type TemplateEvent =
  | 'booking-confirmation'
  | 'payment-receipt'
  | 'booking-cancelled'
  | 'password-reset'
  | 'welcome'

export const TEMPLATE_EVENT_LABELS: Record<TemplateEvent, string> = {
  'booking-confirmation': 'Booking Confirmation',
  'payment-receipt': 'Payment Receipt',
  'booking-cancelled': 'Booking Cancelled',
  'password-reset': 'Password Reset',
  welcome: 'Welcome Email'
}

export type TemplateStatus = 'active' | 'inactive'

export type EmailSectionType = 'banner' | 'hero' | 'detailsGrid' | 'summaryGrid' | 'button' | 'help'

export const EMAIL_SECTION_LABELS: Record<EmailSectionType, string> = {
  banner: 'Confirmation Banner',
  hero: 'Trip Highlight',
  detailsGrid: 'Booking Details',
  summaryGrid: 'Payment Summary',
  button: 'Call To Action',
  help: 'Help & Support'
}

export interface EmailBannerSection {
  id: string
  type: 'banner'
  title: string
  message: string
}

export interface EmailHeroInfoItem {
  label: string
  value: string
  note?: string
}

export interface EmailHeroSection {
  id: string
  type: 'hero'
  image: string
  badge: string
  title: string
  location: string
  description: string
  infoItems: EmailHeroInfoItem[]
}

export interface EmailGridRow {
  label: string
  value: string
}

export interface EmailDetailsGridSection {
  id: string
  type: 'detailsGrid'
  title: string
  rows: EmailGridRow[]
}

export interface EmailSummaryRow extends EmailGridRow {
  emphasis?: 'discount'
}

export interface EmailSummaryGridSection {
  id: string
  type: 'summaryGrid'
  title: string
  rows: EmailSummaryRow[]
  totalLabel: string
  totalValue: string
  statusLabel: string
  statusNote: string
}

export interface EmailButtonSection {
  id: string
  type: 'button'
  label: string
  url: string
  helperText: string
}

export interface EmailHelpSection {
  id: string
  type: 'help'
  title: string
  description: string
}

export type EmailSection =
  | EmailBannerSection
  | EmailHeroSection
  | EmailDetailsGridSection
  | EmailSummaryGridSection
  | EmailButtonSection
  | EmailHelpSection

export interface EmailTemplate {
  id: string
  name: string
  event: TemplateEvent
  subject: string
  sections: EmailSection[]
  status: TemplateStatus
  updatedAt: string
}

export type UpdateEmailTemplateInput = Pick<EmailTemplate, 'name' | 'subject' | 'sections'>
