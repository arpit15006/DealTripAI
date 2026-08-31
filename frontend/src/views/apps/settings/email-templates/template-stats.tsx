'use client'

// React Imports
import { Fragment, useMemo } from 'react'

// Third-party Imports
import type { LucideIcon } from 'lucide-react'
import { CheckCircle2Icon, FileTextIcon, PauseCircleIcon } from 'lucide-react'

// Type Imports
import type { EmailTemplate } from '@/types/settings/email-template-types'

// Component Imports
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type Stat = {
  label: string
  value: number
  icon: LucideIcon
}

type TemplateStatsProps = {
  items: EmailTemplate[]
}

const TemplateStats = ({ items }: TemplateStatsProps) => {
  const stats = useMemo<Stat[]>(() => {
    const activeCount = items.filter(item => item.status === 'active').length
    const inactiveCount = items.length - activeCount

    return [
      { label: 'Total Templates', value: items.length, icon: FileTextIcon },
      { label: 'Active', value: activeCount, icon: CheckCircle2Icon },
      { label: 'Inactive', value: inactiveCount, icon: PauseCircleIcon }
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

export default TemplateStats
