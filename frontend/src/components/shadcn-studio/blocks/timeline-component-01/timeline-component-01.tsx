import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import {
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineHeading,
  TimelineItem,
  TimelineLine
} from '@/components/ui/timeline'

import { cn } from '@/lib/utils'
import { IconHeart } from '@tabler/icons-react'

interface TimelineDataItem {
  id: number
  status: 'done' | 'default'
  heading: string
  time: string
  date: string
  done: boolean
}

interface TrackOrderPreviewProps {
  className?: string
  timelineData: TimelineDataItem[]
}

const TrackOrderPreview = ({ className, timelineData }: TrackOrderPreviewProps) => {
  return (
    <Card className={cn('gap-4 shadow-lg', className)}>
      <CardHeader className='flex justify-between'>
        <div className='flex flex-col'>
          <span className='mb-3 text-lg font-semibold'>Track Your Order</span>
          <Card className='mb-6 grid gap-0 overflow-hidden p-0 md:grid-cols-6'>
            <figure className='bg-muted relative flex items-center justify-center overflow-hidden md:col-span-2'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/timeline/image-12.png'
                className='h-50 w-40 object-contain transition-transform duration-300 hover:scale-105'
                alt='Elver Buds X True Wireless Earbuds'
              />
              <Button className='absolute top-2 right-2 size-6 rounded-full' size='xs'>
                <IconHeart />
              </Button>
            </figure>
            <div className='flex flex-col gap-4 p-3.5 md:col-span-4'>
              <div className='flex items-center justify-between'>
                <Badge
                  variant='outline'
                  className='rounded-full border-green-600 text-green-600 dark:border-green-400 dark:text-green-400 [a&]:hover:bg-green-600/10 [a&]:hover:text-green-600/90 dark:[a&]:hover:bg-green-400/10 dark:[a&]:hover:text-green-400/90'
                >
                  Order Verified
                </Badge>
                <p className='text-muted-foreground hover:text-primary cursor-pointer text-xs'>View Details</p>
              </div>
              <div className='space-y-2.5'>
                <p className='text-primary text-sm'>Order ID: XYZ-42324568</p>
                <div>
                  <h3 className='text-card-foreground text-lg font-semibold'>Elver Buds X True Wireless Earbuds </h3>
                  <p className='text-muted-foreground text-sm'>
                    True Wireless Earbuds with Dual ANC+ENC, Upto 50HRS Playback, Bluetooth 5.3, Dual Noise Cancellation
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-card-foreground text-lg font-semibold'>$199</span>
                  <span className='text-muted-foreground line-through'>$249</span>
                  <span className='text-destructive text-sm font-medium'>(20% OFF)</span>
                </div>
              </div>
            </div>
          </Card>
          <div className='flex flex-col gap-2.5'>
            <h4 className='text-foreground text-lg font-semibold'>Arriving on Monday, 28 July</h4>

            <Timeline>
              {timelineData.map((item, index) => {
                const isLast = index === timelineData.length - 1

                return (
                  <TimelineItem key={item.id} status='done' className='gap-x-0'>
                    {item.status === 'done' ? (
                      <TimelineDot
                        status='done'
                        className='my-2.5 size-4.5 border-green-600 bg-green-600 [&>svg]:size-3.5'
                      />
                    ) : (
                      <TimelineDot
                        status='custom'
                        className='bg-primary/20 flex size-4.5 shrink-0 items-center justify-center rounded-full'
                      >
                        <span className='bg-primary size-3 rounded-full' />
                      </TimelineDot>
                    )}
                    {!isLast && <TimelineLine done={true} className='bg-muted min-h-10' />}
                    <TimelineHeading
                      className={`${item.done ? 'text-foreground' : 'text-muted-foreground'} flex w-full items-center justify-between pt-2.5 pb-2 pl-4 text-sm font-medium text-wrap md:text-lg`}
                    >
                      {item.heading}
                      <span className='text-muted-foreground text-xs font-normal text-nowrap md:text-sm'>
                        {item.time}
                      </span>
                    </TimelineHeading>
                    <TimelineContent className='pb-3 pl-4'>
                      <span className='text-muted-foreground text-sm'>{item.date}</span>
                    </TimelineContent>
                  </TimelineItem>
                )
              })}
            </Timeline>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

export default TrackOrderPreview
