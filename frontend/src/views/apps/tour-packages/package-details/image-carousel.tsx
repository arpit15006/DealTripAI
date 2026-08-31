'use client'

// React Imports
import { useEffect, useState } from 'react'

// Component Imports
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel'

// Utils Imports
import { cn } from '@/lib/utils'

type ImageCarouselProps = {
  images: string[]
  alt: string
}

const ImageCarousel = ({ images, alt }: ImageCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!api) return

    const handleSelect = () => setSelectedIndex(api.selectedScrollSnap())

    api.on('select', handleSelect)

    return () => {
      api.off('select', handleSelect)
    }
  }, [api])

  if (images.length <= 1) {
    return <img src={images[0]} alt={alt} className='aspect-4/3 w-full rounded-lg object-cover sm:aspect-square' />
  }

  return (
    <Carousel setApi={setApi} className='group/carousel w-full'>
      <CarouselContent className='ml-0'>
        {images.map((image, index) => (
          <CarouselItem key={image} className='pl-0'>
            <img
              src={image}
              alt={`${alt} photo ${index + 1}`}
              className='aspect-4/3 w-full rounded-lg object-cover sm:aspect-square'
            />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className='dark:bg-background dark:hover:bg-background left-2 size-7 border-none disabled:opacity-0' />
      <CarouselNext className='dark:bg-background dark:hover:bg-background right-2 size-7 border-none disabled:opacity-0' />

      <div className='absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5'>
        {images.map((image, index) => (
          <Button
            key={image}
            type='button'
            variant='ghost'
            size='icon-xs'
            aria-label={`Go to photo ${index + 1}`}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              'h-1.5 min-w-0 rounded-full p-0 hover:bg-white',
              index === selectedIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
            )}
          />
        ))}
      </div>
    </Carousel>
  )
}

export default ImageCarousel
