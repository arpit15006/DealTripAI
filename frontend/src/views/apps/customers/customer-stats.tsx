'use client'

// React Imports
import { Fragment, useMemo } from 'react'

// Third-party Imports
import type { LucideIcon } from 'lucide-react'
import { UserPlusIcon, UserRoundCheckIcon, UsersIcon } from 'lucide-react'
import { isAfter, subDays } from 'date-fns'

// Type Imports
import type { Customer } from '@/types/apps/customer-types'

// Component Imports
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type Stat = {
  label: string
  value: number
  icon: LucideIcon
}

type CustomerStatsProps = {
  items: Customer[]
}

const NEW_CUSTOMER_WINDOW_DAYS = 30

const CustomerStats = ({ items }: CustomerStatsProps) => {
  const statGroups = useMemo<Stat[][]>(() => {
    const activeCount = items.filter(item => item.status === 'active').length
    const cutoffDate = subDays(new Date(), NEW_CUSTOMER_WINDOW_DAYS)
    const newCount = items.filter(item => isAfter(new Date(item.registeredAt), cutoffDate)).length

    return [
      [
        { label: 'Total Customers', value: items.length, icon: UsersIcon },
        { label: 'Active', value: activeCount, icon: UserRoundCheckIcon },
        { label: 'New', value: newCount, icon: UserPlusIcon }
      ]
    ]
  }, [items])

  return (
    <Card className='shadow-none'>
      <CardContent>
        <div className='flex gap-5 max-xl:flex-col'>
          {statGroups.map((group, groupIndex) => (
            <Fragment key={groupIndex}>
              {groupIndex > 0 && (
                <>
                  <Separator className='xl:hidden' />
                  <Separator orientation='vertical' className='hidden xl:block' />
                </>
              )}
              <div className='flex flex-1 gap-5 max-sm:flex-col'>
                {group.map((stat, statIndex) => (
                  <Fragment key={stat.label}>
                    {statIndex > 0 && (
                      <>
                        <Separator className='sm:hidden' />
                        <Separator orientation='vertical' className='hidden sm:block' />
                      </>
                    )}
                    <div className='flex flex-1 items-center justify-between gap-4'>
                      <div>
                        <h4 className='text-foreground text-2xl font-medium'>{stat.value}</h4>
                        <p className='text-muted-foreground text-sm'>{stat.label}</p>
                      </div>
                      <div className='bg-muted flex size-10 items-center justify-center rounded-lg'>
                        <stat.icon className='text-foreground size-6' />
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerStats
