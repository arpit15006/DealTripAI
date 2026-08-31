import TrackOrderCard from '@/components/shadcn-studio/blocks/timeline-component-01/timeline-component-01'

interface TimelineDataItem {
  id: number
  status: 'done' | 'default'
  heading: string
  time: string
  date: string
  done: boolean
}

const TrackOrderPreview = () => {
  const timelineData: TimelineDataItem[] = [
    {
      id: 1,
      status: 'done' as const,
      heading: 'Your order has been Placed.',
      time: '3:00 PM',
      date: '22 July, 2021',
      done: true
    },
    {
      id: 2,
      status: 'done' as const,
      heading: 'Your order is successfully verified.',
      time: '7:32 PM',
      date: '23 July, 2021',
      done: true
    },
    {
      id: 3,
      status: 'default' as const,
      heading: 'Your order is packed and ready for dispatch.',
      time: '5:32 PM',
      date: '24 July, 2021',
      done: false
    },
    {
      id: 4,
      status: 'default' as const,
      heading: 'Courier partner Alex is en route with your package.',
      time: '2:00 PM',
      date: '25 July, 2021',
      done: false
    },
    {
      id: 5,
      status: 'default' as const,
      heading: 'Expected delivery to your address.',
      time: '5:00 PM',
      date: '28 July, 2021',
      done: false
    }
  ]

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-16'>
      <div className='flex justify-center'>
        <TrackOrderCard className='w-full max-w-148' timelineData={timelineData} />
      </div>
    </div>
  )
}

export default TrackOrderPreview
