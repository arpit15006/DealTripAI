// Type Imports
import type { ItineraryDay } from '@/types/packages/package-detail-types'

type ItineraryPrintViewProps = {
  packageTitle: string
  itinerary: ItineraryDay[]
}

const ItineraryPrintView = ({ packageTitle, itinerary }: ItineraryPrintViewProps) => {
  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-xl font-semibold'>{packageTitle} — Itinerary</h2>
      {itinerary.map(day => (
        <div key={day.day} className='flex break-inside-avoid flex-col gap-1.5'>
          <h3 className='font-medium'>
            Day {day.day}: {day.title}
          </h3>
          <p className='text-muted-foreground'>{day.summary}</p>
          <ul className='ml-4 flex list-disc flex-col gap-1'>
            {day.activities.map(activity => (
              <li key={activity}>{activity}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default ItineraryPrintView
