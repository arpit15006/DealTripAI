// Type Imports
import type { PolicySection } from '@/types/packages/package-detail-types'

// Component Imports
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

type ImportantInfoProps = {
  sections: PolicySection[]
}

const ImportantInfo = ({ sections }: ImportantInfoProps) => {
  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-lg font-semibold'>Important Information</h2>
      <Accordion defaultValue={[sections[0]?.title]} className='gap-2'>
        {sections.map(section => (
          <AccordionItem key={section.title} value={section.title} className='rounded-lg border px-4'>
            <AccordionTrigger>{section.title}</AccordionTrigger>
            <AccordionContent>
              <ul className='ml-4 flex list-disc flex-col gap-1.5'>
                {section.points.map(point => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default ImportantInfo
