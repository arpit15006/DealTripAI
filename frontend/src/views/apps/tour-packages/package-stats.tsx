'use client'

// React Imports
import { Fragment, useMemo } from 'react'

// Third-party Imports
import type { LucideIcon } from 'lucide-react'
import { CompassIcon, PackageIcon, SparklesIcon, TagsIcon } from 'lucide-react'

// Type Imports
import type { TourPackage } from '@/types/packages/tour-package-types'

// Component Imports
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type Stat = {
  label: string
  value: number
  icon: LucideIcon
}

type PackageStatsProps = {
  items: TourPackage[]
}

const PackageStats = ({ items }: PackageStatsProps) => {
  const statGroups = useMemo<Stat[][]>(() => {
    const categoryCount = new Set(items.map(item => item.category)).size
    const premiumCount = items.filter(item => item.packageType === 'premium').length
    const regularCount = items.filter(item => item.packageType === 'regular').length

    return [
      [
        { label: 'Total Packages', value: items.length, icon: PackageIcon },
        { label: 'Category', value: categoryCount, icon: TagsIcon },
        { label: 'Premium', value: premiumCount, icon: SparklesIcon },
        { label: 'Regular', value: regularCount, icon: CompassIcon }
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

export default PackageStats
