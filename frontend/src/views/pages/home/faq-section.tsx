// Type Imports
import type { Faq } from '@/types/pages/home-types'

// Component Imports
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

type FaqSectionProps = {
  faqs: Faq[]
}

const FaqColumn = ({ faqs, columnIndex }: { faqs: Faq[]; columnIndex: number }) => {
  return (
    <Accordion className='border-border bg-card w-full rounded-lg border' defaultValue={[`item-${columnIndex}-1`]}>
      {faqs.map((faq, index) => (
        <AccordionItem key={faq.id} value={`item-${columnIndex}-${index + 1}`} className='px-4'>
          <AccordionTrigger className='text-base font-medium'>{faq.question}</AccordionTrigger>
          <AccordionContent className='text-muted-foreground text-sm'>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

const FaqSection = ({ faqs }: FaqSectionProps) => {
  const midpoint = Math.ceil(faqs.length / 2)
  const leftColumnFaqs = faqs.slice(0, midpoint)
  const rightColumnFaqs = faqs.slice(midpoint)

  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-360 px-4 sm:px-6 lg:px-8'>
        <div className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'>
          <Badge className='h-auto text-sm font-normal' variant='outline'>
            FAQs
          </Badge>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Need Help? We&apos;ve Got Answers</h2>
          <p className='text-muted-foreground text-xl'>
            Explore our most commonly asked questions and find the information you need.
          </p>
        </div>

        <div className='grid gap-6 lg:grid-cols-2'>
          <FaqColumn faqs={leftColumnFaqs} columnIndex={1} />
          <FaqColumn faqs={rightColumnFaqs} columnIndex={2} />
        </div>
      </div>
    </section>
  )
}

export default FaqSection
