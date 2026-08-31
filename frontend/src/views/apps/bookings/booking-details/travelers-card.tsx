// Type Imports
import type { Booking } from '@/types/account/booking-types'
import type { TravelerGender } from '@/types/packages/checkout-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type TravelersCardProps = {
  booking: Booking
}

const GENDER_LABEL: Record<TravelerGender, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other'
}

const TravelersCard = ({ booking }: TravelersCardProps) => {
  const travelers = booking.travelersInfo

  return (
    <Card className='shadow-none'>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>Travelers</CardTitle>
        <p className='text-muted-foreground text-sm'>
          {booking.travelers} {booking.travelers === 1 ? 'member' : 'members'} on this booking
        </p>
      </CardHeader>
      <CardContent>
        {travelers && travelers.length > 0 ? (
          <div className='overflow-hidden rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Age</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {travelers.map((traveler, index) => (
                  <TableRow key={`${traveler.email}-${index}`}>
                    <TableCell className='font-medium'>
                      <span className='flex items-center gap-2'>
                        {traveler.firstName} {traveler.lastName}
                        {index === 0 && (
                          <Badge variant='secondary' className='bg-primary/10 text-primary text-xs'>
                            Primary
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>{traveler.email}</TableCell>
                    <TableCell>{traveler.phone}</TableCell>
                    <TableCell>{GENDER_LABEL[traveler.gender]}</TableCell>
                    <TableCell>{traveler.age}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className='text-muted-foreground text-sm'>Traveler details weren&apos;t collected for this booking.</p>
        )}
      </CardContent>
    </Card>
  )
}

export default TravelersCard
