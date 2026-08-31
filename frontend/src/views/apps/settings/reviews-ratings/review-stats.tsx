'use client'

// React Imports
import { Fragment, useMemo } from 'react'

// Third-party Imports
import type { LucideIcon } from 'lucide-react'
import { CheckCircle2Icon, HourglassIcon, MessageSquareTextIcon, StarIcon } from 'lucide-react'

// Type Imports
import type { Review } from '@/types/settings/reviews-types'

// Component Imports
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type Stat = {
  label: string
  value: string | number
  icon: LucideIcon
}

type ReviewStatsProps = {
  items: Review[]
}

const ReviewStats = ({ items }: ReviewStatsProps) => {
  const stats = useMemo<Stat[]>(() => {
    const total = items.length
    const averageRating = total === 0 ? 0 : items.reduce((sum, item) => sum + item.rating, 0) / total
    const publishedCount = items.filter(item => item.status === 'published').length
    const pendingCount = items.filter(item => item.status === 'pending').length

    return [
      { label: 'Average Rating', value: averageRating.toFixed(1), icon: StarIcon },
      { label: 'Total Reviews', value: total, icon: MessageSquareTextIcon },
      { label: 'Published', value: publishedCount, icon: CheckCircle2Icon },
      { label: 'Pending', value: pendingCount, icon: HourglassIcon }
    ]
  }, [items])

  return (
    <Card className='shadow-none'>
      <CardContent>
        <div className='flex gap-5 max-sm:flex-col'>
          {stats.map((stat, index) => (
            <Fragment key={stat.label}>
              {index > 0 && (
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
      </CardContent>
    </Card>
  )
}

export default ReviewStats
