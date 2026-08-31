// Type Imports
import type { Testimonial } from '@/types/pages/home-types'

// Component Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

type TestimonialCardProps = {
  testimonial: Testimonial
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <Card className='bg-muted min-h-52 w-80 border-0 whitespace-normal shadow-none ring-0'>
      <CardContent>
        <p className='text-primary text-6xl'>&ldquo;</p>
        <p className='text-muted-foreground -mt-4 line-clamp-3 text-base font-medium whitespace-normal'>
          {testimonial.quote}
        </p>
      </CardContent>
      <CardContent className='flex items-center gap-2'>
        <div className='flex items-center gap-2'>
          <Avatar size='lg'>
            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
            <AvatarFallback>
              {testimonial.name
                .split(' ', 2)
                .map(namePart => namePart[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className='text-base font-medium'>{testimonial.name}</h4>
            <p className='text-muted-foreground text-sm'>{testimonial.location}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TestimonialCard
