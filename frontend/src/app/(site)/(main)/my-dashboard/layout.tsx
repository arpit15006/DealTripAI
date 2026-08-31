// React Imports
import type { ReactNode } from 'react'

// Component Imports
import AccountSidebar from '@/components/layout/account/account-sidebar'
import ReferralCard from '@/components/layout/account/referral-card'

const MyDashboardLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <div className='mx-auto grid w-full max-w-360 grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr] lg:items-start lg:px-8'>
      <div className='flex flex-col gap-6 lg:sticky lg:top-35'>
        <AccountSidebar />
        <ReferralCard />
      </div>
      <div className='min-w-0'>{children}</div>
    </div>
  )
}

export default MyDashboardLayout
