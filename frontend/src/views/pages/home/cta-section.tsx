'use client'

import Autoplay from 'embla-carousel-autoplay'

import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'

const backgroundImages = ['/images/cta/cta-1.webp', '/images/cta/cta-2.webp', '/images/cta/cta-3.webp']

const CTASection = () => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='container mx-auto max-w-360 px-4 sm:px-6 lg:px-8'>
        <Card className='group relative z-1 overflow-hidden rounded-2xl border-0 py-0 shadow-none'>
          <div className='absolute inset-0 -z-1'>
            <Carousel
              opts={{ loop: true }}
              plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
              className='grid h-full w-full'
            >
              <CarouselContent className='ml-0 h-full'>
                {backgroundImages.map(image => (
                  <CarouselItem key={image} className='h-full pl-0'>
                    <img src={image} alt='background home assistant robot' className='h-full w-full object-cover' />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          <CardContent className='lg:px-14'>
            <div className='grid grid-cols-1 items-end gap-5 lg:grid-cols-2 lg:gap-10'>
              <div className='flex h-full flex-col justify-center space-y-4 py-6 text-white md:space-y-8 lg:py-12'>
                <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Your Next Adventure Starts Here</h2>

                <p className='text-base leading-relaxed opacity-80 md:text-xl'>
                  From hidden gems to iconic landmarks, find the perfect destination, organize your trip, and travel
                  confidently with smart planning tools.
                </p>

                <div className='flex items-center gap-6 max-lg:justify-center max-md:w-full max-md:flex-col'>
                  <a href='#' className='bg-card-foreground flex w-50 items-center gap-4 rounded-sm px-5 py-1.75'>
                    <img src='/images/apple-icon.webp' alt='App Store' className='size-8.5 invert dark:invert-0' />
                    <div className='flex flex-col items-start'>
                      <p className='text-card text-xs leading-4'>Download on the</p>
                      <p className='text-card text-base leading-6 font-medium opacity-90'>App Store</p>
                    </div>
                  </a>
                  <a href='#' className='bg-card-foreground flex w-50 items-center gap-4 rounded-sm px-5 py-1.75'>
                    <img src='/images/google-play.webp' alt='Google Play' className='size-8.5' />
                    <div className='flex flex-col items-start'>
                      <p className='text-card text-xs leading-4'>Download on the</p>
                      <p className='text-card text-base leading-6 font-medium opacity-90'>Google Play</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className='relative flex justify-center pt-6'>
                <img
                  src='/images/cta/mockup-phone.webp'
                  alt='Robot with person'
                  className='size-8/12 object-cover max-lg:hidden'
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default CTASection
