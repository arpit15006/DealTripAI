'use client'

// React Imports
import { Fragment, useMemo } from 'react'

// Third-party Imports
import type { LucideIcon } from 'lucide-react'
import { BadgeCheckIcon, CalendarXIcon, TicketPercentIcon, UsersIcon } from 'lucide-react'

// Type Imports
import type { Coupon } from '@/types/apps/coupon-types'

// Component Imports
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// Utils Imports
import { getCouponStatus } from '@/utils/coupon-utils'

type Stat = {
  label: string
  value: number
  icon: LucideIcon
}

type CouponStatsProps = {
  items: Coupon[]
}

const CouponStats = ({ items }: CouponStatsProps) => {
  const statGroups = useMemo<Stat[][]>(() => {
    const activeCount = items.filter(item => getCouponStatus(item) === 'active').length
    const expiredCount = items.filter(item => getCouponStatus(item) === 'expired').length
    const totalRedemptions = items.reduce((sum, item) => sum + item.usedCount, 0)

    return [
      [
        { label: 'Total Coupons', value: items.length, icon: TicketPercentIcon },
        { label: 'Active', value: activeCount, icon: BadgeCheckIcon },
        { label: 'Expired', value: expiredCount, icon: CalendarXIcon },
        { label: 'Total Redemptions', value: totalRedemptions, icon: UsersIcon }
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

export default CouponStats
