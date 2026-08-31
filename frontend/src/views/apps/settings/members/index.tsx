'use client'

// Component Imports
import { Card } from '@/components/ui/card'
import { columns } from '@/views/apps/settings/members/columns'
import { MembersDataTable } from '@/views/apps/settings/members/data-table'
import MemberStats from '@/views/apps/settings/members/member-stats'

// Store Imports
import { useMembersStore } from '@/store/use-members-store'

const MembersView = () => {
  const items = useMembersStore(state => state.items)

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Members</h1>
        <p className='text-muted-foreground text-sm'>
          Invite, manage and review everyone with access to the dashboard.
        </p>
      </div>

      <MemberStats items={items} />

      <Card className='w-full gap-0 py-0'>
        <MembersDataTable columns={columns} data={items} />
      </Card>
    </div>
  )
}

export default MembersView
