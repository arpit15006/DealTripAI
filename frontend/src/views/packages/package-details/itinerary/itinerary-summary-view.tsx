// Type Imports
import type { ItineraryDay } from '@/types/packages/package-detail-types'

// Component Imports
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type ItinerarySummaryViewProps = {
  itinerary: ItineraryDay[]
}

const ItinerarySummaryView = ({ itinerary }: ItinerarySummaryViewProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-16'>Day</TableHead>
          <TableHead className='w-56'>Title</TableHead>
          <TableHead>Summary</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {itinerary.map(day => (
          <TableRow key={day.day}>
            <TableCell className='align-top font-medium'>{day.day}</TableCell>
            <TableCell className='align-top font-medium whitespace-normal'>{day.title}</TableCell>
            <TableCell className='text-muted-foreground align-top whitespace-normal'>{day.summary}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default ItinerarySummaryView
