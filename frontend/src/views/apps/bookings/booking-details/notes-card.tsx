// Third-party Imports
import { NotebookPenIcon } from 'lucide-react'

// Type Imports
import type { Booking } from '@/types/account/booking-types'

// Component Imports
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type NotesCardProps = {
  booking: Booking
}

const NotesCard = ({ booking }: NotesCardProps) => (
  <Card className='shadow-none'>
    <CardHeader>
      <CardTitle className='flex items-center gap-2 text-base font-semibold'>
        <NotebookPenIcon className='size-4' />
        Notes
      </CardTitle>
    </CardHeader>
    <CardContent>
      {booking.notes ? (
        <p className='text-sm leading-relaxed'>{booking.notes}</p>
      ) : (
        <p className='text-muted-foreground text-sm'>No notes have been added for this booking.</p>
      )}
    </CardContent>
  </Card>
)

export default NotesCard
