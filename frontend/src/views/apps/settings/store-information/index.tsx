'use client'

// Component Imports
import { Separator } from '@/components/ui/separator'
import CompanyProfileSection from '@/views/apps/settings/store-information/company-profile-section'
import LocalizationSection from '@/views/apps/settings/store-information/localization-section'
import SocialLinksSection from '@/views/apps/settings/store-information/social-links-section'

const StoreInformationView = () => {
  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Store Information</h1>
        <p className='text-muted-foreground text-sm'>
          Manage your company branding, localization defaults and social presence.
        </p>
      </div>
      <Separator />

      <div className='flex flex-col gap-8'>
        <CompanyProfileSection />
        <Separator />
        <LocalizationSection />
        <Separator />
        <SocialLinksSection />
      </div>
    </div>
  )
}

export default StoreInformationView
