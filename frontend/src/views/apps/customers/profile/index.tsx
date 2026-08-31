'use client'

// React Imports
import { useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// Third-party Imports
import { ArrowLeftIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import AccountDetailsCard from '@/views/apps/customers/profile/account-details-card'
import ProfileHeaderCard from '@/views/apps/customers/profile/profile-header-card'
import RecentActivitySection from '@/views/apps/customers/profile/recent-activity-section'

// Store Imports
import { useCustomersStore } from '@/store/use-customers-store'
import { useProfileStore } from '@/store/use-profile-store'

// Utils Imports
import { isSyncedCustomer, mergeProfileUser } from '@/utils/customer-utils'

const CustomerProfileView = () => {
  const items = useCustomersStore(state => state.items)
  const profileUser = useProfileStore(state => state.user)
  const searchParams = useSearchParams()

  const id = searchParams.get('id')

  const customers = useMemo(() => mergeProfileUser(items, profileUser), [items, profileUser])

  const customer = useMemo(
    () => (id ? customers.find(item => item.id === id) : customers.find(item => isSyncedCustomer(item, profileUser))),
    [customers, id, profileUser]
  )

  if (!customer) {
    return (
      <div className='flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center'>
        <p className='font-medium'>Customer not found</p>
        <Button variant='outline' render={<Link href='/dashboard/customers' />} nativeButton={false}>
          Back to Customers
        </Button>
      </div>
    )
  }

  const isSynced = isSyncedCustomer(customer, profileUser)

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex justify-between gap-4 max-md:flex-col'>
        <div>
          <h1 className='text-2xl font-semibold'>Customer Profile</h1>
          <p className='text-muted-foreground text-sm'>View and manage this customer&apos;s account.</p>
        </div>
        <Button variant='outline' size='sm' render={<Link href='/dashboard/customers-list' />} nativeButton={false}>
          <ArrowLeftIcon className='size-4' />
          All Customers
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-6 xl:grid-cols-[350px_minmax(0,1fr)] xl:items-start'>
        <div className='xl:sticky xl:top-6'>
          <ProfileHeaderCard customer={customer} isSynced={isSynced} />
        </div>

        <div className='space-y-6'>
          <AccountDetailsCard customer={customer} />
          <RecentActivitySection customer={customer} />
        </div>
      </div>
    </div>
  )
}

export default CustomerProfileView
