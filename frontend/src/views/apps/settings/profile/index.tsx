// Component Imports
import { Separator } from '@/components/ui/separator'
import DangerZoneSection from '@/views/apps/settings/profile/danger-zone-section'
import PasswordSection from '@/views/apps/settings/profile/password-section'
import PersonalInfoSection from '@/views/apps/settings/profile/personal-info-section'

const ProfileSettingsView = () => {
  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Profile Settings</h1>
        <p className='text-muted-foreground text-sm'>Manage your personal information, password and account access.</p>
      </div>
      <Separator />
      <div className='flex flex-col gap-8'>
        <PersonalInfoSection />
        <Separator />
        <PasswordSection />
        <Separator />
        <DangerZoneSection />
      </div>
    </div>
  )
}

export default ProfileSettingsView
