// Component Imports
import DangerZone from '@/views/account/profile/danger-zone'
import Password from '@/views/account/profile/password'
import PersonalInformation from '@/views/account/profile/personal-information'
import SocialUrls from '@/views/account/profile/social-urls'

const ProfileView = () => {
  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold'>Profile</h1>
        <p className='text-muted-foreground text-sm'>Manage your personal details and account security</p>
      </div>

      <PersonalInformation />
      <Password />
      <SocialUrls />
      <DangerZone />
    </div>
  )
}

export default ProfileView
