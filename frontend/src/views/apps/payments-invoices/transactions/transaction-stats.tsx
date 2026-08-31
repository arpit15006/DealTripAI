'use client'

// React Imports
import { useMemo } from 'react'

// Third-party Imports
import type { LucideIcon } from 'lucide-react'
import { CheckCircle2Icon, ClockIcon, WalletIcon, XCircleIcon } from 'lucide-react'

// Type Imports
import type { Transaction } from '@/types/apps/transaction-types'

// Component Imports
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type Stat = {
  label: string
  value: string
  icon: LucideIcon
}

type TransactionStatsProps = {
  items: Transaction[]
}

const currency = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`

const TransactionStats = ({ items }: TransactionStatsProps) => {
  const stats = useMemo<Stat[]>(() => {
    const succeeded = items.filter(item => item.status === 'succeeded')
    const pending = items.filter(item => item.status === 'pending')
    const failed = items.filter(item => item.status === 'failed')
    const totalCharged = succeeded.reduce((sum, item) => sum + item.amount, 0)

    return [
      { label: 'Total Charged', value: currency(totalCharged), icon: WalletIcon },
      { label: 'Succeeded', value: `${succeeded.length}`, icon: CheckCircle2Icon },
      { label: 'Pending', value: `${pending.length}`, icon: ClockIcon },
      { label: 'Failed', value: `${failed.length}`, icon: XCircleIcon }
    ]
  }, [items])

  return (
    <Card className='shadow-none'>
      <CardContent>
        <div className='flex gap-5 max-sm:flex-col'>
          {stats.map((stat, index) => (
            <div key={stat.label} className='flex flex-1 items-center gap-5 max-sm:flex-col'>
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TransactionStats
