// Component Imports
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Utils Imports
import { cn } from '@/lib/utils'

type StatisticsCardSvgProps = {
  title: string
  badgeContent: string
  value: string
  changePercentage: number
  className?: string
}

const StatisticsCardSvg = ({ title, badgeContent, value, changePercentage, className }: StatisticsCardSvgProps) => {
  return (
    <Card className={cn('relative justify-between', className)}>
      <CardHeader className='flex flex-col gap-3'>
        <span className='text-base font-medium'>{title}</span>
        <Badge className='bg-primary/10 text-primary'>{badgeContent}</Badge>
      </CardHeader>
      <CardContent className='flex items-center gap-2 lg:max-[1100px]:flex-col lg:max-[1100px]:items-start'>
        <span className='text-2xl font-semibold'>{value}</span>
        <span
          className={cn('text-sm', changePercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive')}
        >
          {changePercentage > 0 ? '+' : ''}
          {changePercentage}%
        </span>
      </CardContent>
      <div className='absolute right-0.5 bottom-0 h-[90%]'>
        <img src='/images/people.webp' alt='Travelers' className='h-full w-full object-contain' />
      </div>
    </Card>
  )
}

export default StatisticsCardSvg
