// Type Imports
import type { Testimonial } from '@/types/pages/home-types'

// Component Imports
import { ScrollVelocityContainer, ScrollVelocityRow } from '@/components/ui/scroll-based-velocity'
import TestimonialCard from '@/views/pages/home/testimonials/testimonial-card'
import { Badge } from '@/components/ui/badge'

type TestimonialsProps = {
  testimonials: Testimonial[]
}

const Testimonials = ({ testimonials }: TestimonialsProps) => {
  const midpoint = Math.ceil(testimonials.length / 2)
  const firstRowTestimonials = testimonials.slice(0, midpoint)
  const secondRowTestimonials = testimonials.slice(midpoint)
  const secondTrack = secondRowTestimonials.length > 0 ? secondRowTestimonials : firstRowTestimonials

  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-360 px-4 sm:px-6 lg:px-8'>
        <div className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'>
          <Badge className='h-auto text-sm font-normal' variant='outline'>
            Customer Stories
          </Badge>
          <h2 className='mx-auto max-w-xl text-3xl font-bold'>What Our Travelers Say</h2>
          <p className='text-muted-foreground'>Real experiences from thousands of happy travelers</p>
        </div>
        <div className='relative'>
          <div className='from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-linear-to-r to-transparent sm:w-32' />
          <div className='from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-linear-to-l to-transparent sm:w-32' />
          <ScrollVelocityContainer className='space-y-4'>
            <ScrollVelocityRow baseVelocity={2} direction={1} className='py-1'>
              <div className='flex items-stretch gap-4 pr-4'>
                {firstRowTestimonials.map(testimonial => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                ))}
              </div>
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={2} direction={-1} className='py-1'>
              <div className='flex items-stretch gap-4 pr-4'>
                {secondTrack.map(testimonial => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                ))}
              </div>
            </ScrollVelocityRow>
          </ScrollVelocityContainer>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
