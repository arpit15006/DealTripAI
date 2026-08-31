// Third-party Imports
import type { LucideIcon } from 'lucide-react'

// Component Imports
import { Card, CardContent } from '@/components/ui/card'

type StatCardProps = {
  icon: LucideIcon
  label: string
  value: string | number
}

const StatCard = ({ icon: Icon, label, value }: StatCardProps) => {
  return (
    <Card>
      <CardContent className='flex items-center gap-4'>
        <div className='bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg'>
          <Icon className='size-5' />
        </div>
        <div>
          <p className='text-2xl font-bold'>{value}</p>
          <p className='text-muted-foreground text-sm'>{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default StatCard
