'use client'

// Component Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import AccountNav from '@/components/layout/account/account-nav'

// Store Imports
import { useProfileStore } from '@/store/use-profile-store'

const AccountSidebar = () => {
  const user = useProfileStore(state => state.user)
  const fullName = `${user.firstName} ${user.lastName}`

  return (
    <Card className='gap-4 py-5'>
      <CardContent className='flex flex-col items-center gap-1 text-center'>
        <Avatar className='mb-2 size-20'>
          <AvatarImage src={user.avatar || undefined} alt={fullName} />
          <AvatarFallback className='text-lg'>
            {user.firstName[0]}
            {user.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <p className='text-base font-semibold'>{fullName}</p>
        <p className='text-muted-foreground text-sm'>{user.email}</p>
      </CardContent>
      <Separator />
      <CardContent>
        <AccountNav />
      </CardContent>
    </Card>
  )
}

export default AccountSidebar
