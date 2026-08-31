'use client'

// React Imports
import { useMemo } from 'react'

// Type Imports
import type { PackageTestimonial } from '@/types/packages/package-detail-types'

// Component Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Rating } from '@/components/ui/rating'

// Store Imports
import { usePackageReviewsStore } from '@/store/use-package-reviews-store'

const EMPTY_REVIEWS: PackageTestimonial[] = []

type PackageReviewsProps = {
  packageSlug: string
  packageTitle: string
  testimonials: PackageTestimonial[]
}

const PackageReviews = ({ packageSlug, testimonials }: PackageReviewsProps) => {
  const userReviews = usePackageReviewsStore(state => state.reviewsBySlug[packageSlug] ?? EMPTY_REVIEWS)
  const allTestimonials = useMemo(() => [...userReviews, ...testimonials], [userReviews, testimonials])

  return (
    <Carousel className='flex min-w-0 flex-col gap-6' opts={{ align: 'start', slidesToScroll: 1 }}>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='min-w-0 flex-1 space-y-2'>
          <h2 className='text-lg font-semibold'>Reviews &amp; Ratings</h2>
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          <CarouselPrevious
            size='icon'
            variant='outline'
            className='static translate-y-0 rounded-md disabled:opacity-50'
          />
          <CarouselNext size='icon' variant='outline' className='static translate-y-0 rounded-md disabled:opacity-50' />
        </div>
      </div>
      <CarouselContent className='m-1 -ml-1'>
        {allTestimonials.map(testimonial => (
          <CarouselItem key={testimonial.id} className='pl-4 sm:basis-1/2 lg:basis-1/3'>
            <Card className='hover:ring-primary h-full shadow-none transition-colors duration-300'>
              <CardHeader className='flex items-center gap-3'>
                <Avatar size='lg'>
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>
                    {testimonial.name
                      .split(' ', 2)
                      .map(part => part[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <h4 className='text-base font-medium'>{testimonial.name}</h4>
                  <p className='text-muted-foreground text-sm'>
                    {testimonial.role} &middot;{' '}
                    <span className='text-card-foreground font-semibold'>{testimonial.company}</span>
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <Rating readOnly variant='yellow' size={20} value={testimonial.rating} precision={0.5} />
              </CardContent>
              <CardContent>
                <p className='line-clamp-2 text-base'>{testimonial.content}</p>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}

export default PackageReviews
