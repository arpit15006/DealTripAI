'use client'

// React Imports
import { useMemo } from 'react'

// Component Imports
import { Card } from '@/components/ui/card'
import { columns } from '@/views/apps/customers/columns'
import CustomerStats from '@/views/apps/customers/customer-stats'
import { CustomersDataTable } from '@/views/apps/customers/data-table'

// Store Imports
import { useCustomersStore } from '@/store/use-customers-store'
import { useProfileStore } from '@/store/use-profile-store'

// Utils Imports
import { mergeProfileUser } from '@/utils/customer-utils'

const CustomersView = () => {
  const items = useCustomersStore(state => state.items)
  const profileUser = useProfileStore(state => state.user)

  const customers = useMemo(() => mergeProfileUser(items, profileUser), [items, profileUser])

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Customers</h1>
        <p className='text-muted-foreground text-sm'>View and manage every customer registered on the platform.</p>
      </div>

      <CustomerStats items={customers} />

      <Card className='w-full gap-0 py-0'>
        <CustomersDataTable columns={columns} data={customers} />
      </Card>
    </div>
  )
}

export default CustomersView
