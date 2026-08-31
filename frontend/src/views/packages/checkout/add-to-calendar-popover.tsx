'use client'

// Third-party Imports
import { format } from 'date-fns'
import { CalendarPlusIcon, MapPinIcon } from 'lucide-react'

// Component Imports
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type AddToCalendarPopoverProps = {
  travelDate: Date
  destination: string
}

const AddToCalendarPopover = ({ travelDate, destination }: AddToCalendarPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant='outline' size='lg' className='w-full'>
            <CalendarPlusIcon className='size-4' />
            Add Trip to Calendar
          </Button>
        }
      />
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar mode='single' selected={travelDate} defaultMonth={travelDate} onSelect={() => {}} />
        <div className='flex items-center gap-2 border-t px-4 py-3'>
          <MapPinIcon className='text-primary size-4 shrink-0' />
          <div>
            <p className='text-sm font-medium'>{destination}</p>
            <p className='text-muted-foreground text-xs'>{format(travelDate, 'PPP')}</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default AddToCalendarPopover
