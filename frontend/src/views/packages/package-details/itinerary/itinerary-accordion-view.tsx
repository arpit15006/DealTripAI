// Type Imports
import type { ItineraryDay } from '@/types/packages/package-detail-types'

// Component Imports
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

type ItineraryAccordionViewProps = {
  itinerary: ItineraryDay[]
}

const ItineraryAccordionView = ({ itinerary }: ItineraryAccordionViewProps) => {
  return (
    <Accordion defaultValue={[`day-${itinerary[0]?.day}`]} className='w-full gap-2'>
      {itinerary.map(day => (
        <AccordionItem key={day.day} value={`day-${day.day}`} className='rounded-lg border px-4'>
          <AccordionTrigger>
            Day {day.day}: {day.title}
          </AccordionTrigger>
          <AccordionContent className='flex flex-col gap-3'>
            <p className='text-muted-foreground'>{day.summary}</p>
            <ul className='ml-4 flex list-disc flex-col gap-1.5'>
              {day.activities.map(activity => (
                <li key={activity}>{activity}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export default ItineraryAccordionView
