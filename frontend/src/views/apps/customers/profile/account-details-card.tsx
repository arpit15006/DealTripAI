// Third-party Imports
import { format } from 'date-fns'
import { CalendarIcon, ClockIcon, HashIcon, ShieldCheckIcon } from 'lucide-react'

// Type Imports
import type { Customer } from '@/types/apps/customer-types'
import { CUSTOMER_STATUS_STYLES } from '@/types/apps/customer-types'

// Component Imports
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Utils Imports
import { cn } from '@/lib/utils'

type AccountDetailsCardProps = {
  customer: Customer
}

const AccountDetailsCard = ({ customer }: AccountDetailsCardProps) => {
  const style = CUSTOMER_STATUS_STYLES[customer.status]

  const details = [
    { label: 'Customer ID', value: customer.id, icon: HashIcon },
    {
      label: 'Account Status',
      value: customer.status,
      icon: ShieldCheckIcon,
      valueClassName: cn('capitalize', style.text),
      showDot: true
    },
    { label: 'Registration Date', value: format(new Date(customer.registeredAt), 'dd MMM yyyy'), icon: CalendarIcon },
    { label: 'Last Updated', value: format(new Date(customer.updatedAt), 'dd MMM yyyy'), icon: ClockIcon }
  ]

  return (
    <Card className='shadow-none'>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>Account Details</CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {details.map(detail => (
          <div key={detail.label} className='flex items-start gap-3'>
            <div className='bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg'>
              <detail.icon className='text-foreground size-4' />
            </div>
            <div className='min-w-0'>
              <p className='text-muted-foreground text-xs'>{detail.label}</p>
              <p className={cn('flex items-center gap-1.5 truncate text-sm font-medium', detail.valueClassName)}>
                {detail.showDot && <span className={cn('size-1.5 shrink-0 rounded-full', style.dot)} />}
                {detail.value}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default AccountDetailsCard
