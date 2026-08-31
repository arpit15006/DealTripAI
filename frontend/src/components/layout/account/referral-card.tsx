// Third-party Imports
import { GiftIcon } from 'lucide-react'

// Component Imports
import { Card, CardContent } from '@/components/ui/card'
import ReferFriendDialog from '@/components/layout/account/refer-friend-dialog'

const ReferralCard = () => {
  return (
    <Card className='border-primary/20 bg-primary/5 gap-3 py-5'>
      <CardContent className='flex flex-col items-center gap-2 text-center'>
        <div className='bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-full'>
          <GiftIcon className='size-5' />
        </div>
        <p className='font-semibold'>Share joy &amp; get rewarded</p>
        <p className='text-muted-foreground text-sm'>Get $400 for each successful referral!</p>
      </CardContent>
      <CardContent>
        <ReferFriendDialog />
      </CardContent>
    </Card>
  )
}

export default ReferralCard
