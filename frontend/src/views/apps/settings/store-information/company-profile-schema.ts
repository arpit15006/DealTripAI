// Third-party Imports
import { z } from 'zod'

// Type Imports
import type { CompanyProfile } from '@/types/settings/store-information-types'

export const companyProfileSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  tagline: z.string().max(120, 'Tagline must be 120 characters or fewer'),
  description: z.string().max(400, 'Description must be 400 characters or fewer'),
  logoUrl: z.string(),
  supportEmail: z.string().email('Enter a valid email address'),
  supportPhone: z.string().min(6, 'Enter a valid phone number'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required')
})

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>

export const buildCompanyProfileDefaultValues = (profile: CompanyProfile): CompanyProfileFormValues => ({
  name: profile.name,
  tagline: profile.tagline,
  description: profile.description,
  logoUrl: profile.logoUrl,
  supportEmail: profile.supportEmail,
  supportPhone: profile.supportPhone,
  street: profile.address.street,
  city: profile.address.city,
  state: profile.address.state,
  zipCode: profile.address.zipCode,
  country: profile.address.country
})

export const buildCompanyProfileInput = (values: CompanyProfileFormValues): CompanyProfile => ({
  name: values.name,
  tagline: values.tagline,
  description: values.description,
  logoUrl: values.logoUrl,
  supportEmail: values.supportEmail,
  supportPhone: values.supportPhone,
  address: {
    street: values.street,
    city: values.city,
    state: values.state,
    zipCode: values.zipCode,
    country: values.country
  }
})
