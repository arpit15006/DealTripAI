export interface CompanyAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface CompanyProfile {
  name: string
  tagline: string
  description: string
  logoUrl: string
  supportEmail: string
  supportPhone: string
  address: CompanyAddress
}

export interface LocalizationSettings {
  currency: string
  timezone: string
  language: string
  dateFormat: string
  weekStart: string
}

export interface SocialLinks {
  instagram: string
  facebook: string
  twitter: string
}

export interface StoreInformationSettings {
  companyProfile: CompanyProfile
  localization: LocalizationSettings
  socialLinks: SocialLinks
}
