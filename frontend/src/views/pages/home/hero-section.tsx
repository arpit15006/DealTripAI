'use client'

// React Imports
import { useEffect, useMemo, useRef, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Third-party Imports
import { AnimatePresence, motion } from 'motion/react'
import { CrownIcon, FlameIcon, MapPinIcon, SearchIcon } from 'lucide-react'

// Type Imports
import type { PopularDestination } from '@/types/pages/home-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '@/components/ui/combobox'

import { MotionPreset } from '@/components/ui/motion-preset'

// Config Imports
import themeConfig from '@/configs/themeConfig'

// Utils Imports
import { cn } from '@/lib/utils'

// SVGs Imports
import MapSvg from '@/assets/svg/map'

type ShuffleImage = {
  src: string
  alt: string
  country: string
}

const COUNTRY_LABELS: Record<string, string> = {
  thailand: 'Thailand',
  greece: 'Greece',
  indonesia: 'Indonesia',
  japan: 'Japan',
  usa: 'USA',
  india: 'India',
  switzerland: 'Switzerland',
  newzealand: 'New Zealand',
  canada: 'Canada',
  uae: 'UAE',
  maldives: 'Maldives'
}

const buildImage = (country: string, index: number, alt: string): ShuffleImage => ({
  src: `/images/countries/${country}/${country}-${index}.webp`,
  alt,
  country: COUNTRY_LABELS[country] ?? country
})

const FRAME_1_IMAGES: ShuffleImage[] = [
  buildImage('thailand', 2, 'Limestone island in Thailand'),
  buildImage('greece', 1, 'Whitewashed cliffs of Santorini, Greece'),
  buildImage('indonesia', 1, 'Rice terraces of Bali, Indonesia')
]

const FRAME_2_IMAGES: ShuffleImage[] = [
  buildImage('japan', 4, 'Cherry blossoms in Japan'),
  buildImage('usa', 1, 'City skyline in the USA'),
  buildImage('india', 2, 'Cityscape in India')
]

const FRAME_3_IMAGES: ShuffleImage[] = [
  buildImage('switzerland', 3, 'Mountain valley in Switzerland'),
  buildImage('newzealand', 1, 'Rolling green hills of New Zealand'),
  buildImage('canada', 2, 'Mountain lake in Canada')
]

const DISCOVER_IMAGES: ShuffleImage[] = [
  buildImage('greece', 1, 'Whitewashed cliffs of Santorini, Greece'),
  buildImage('uae', 2, 'Skyline of the UAE'),
  buildImage('thailand', 3, 'Limestone island in Thailand'),
  buildImage('maldives', 1, 'Overwater villas in the Maldives')
]

const ShuffleFrame = ({
  images,
  duration,
  className,
  showHoverLabel = false
}: {
  images: ShuffleImage[]
  duration: number
  className?: string
  showHoverLabel?: boolean
}) => {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setActiveIndex(prev => (prev + 1) % images.length), duration)

    return () => clearInterval(interval)
  }, [images.length, duration])

  const activeImage = images[activeIndex]

  const frameContent = (
    <>
      <AnimatePresence mode='popLayout'>
        <motion.img
          key={activeImage.src}
          src={activeImage.src}
          alt={activeImage.alt}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className='absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105'
        />
      </AnimatePresence>

      {showHoverLabel && (
        <>
          <div className='pointer-events-none absolute inset-0 z-10 bg-linear-to-b from-black/0 to-black/85 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
          <div className='pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4'>
            <div className='translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100'>
              <p className='text-2xl font-semibold tracking-tight text-white'>{activeImage.country}</p>
              <div className='mt-2 inline-flex rounded-md bg-white/80 px-3 py-1 text-sm font-semibold text-black'>
                Explore Packages
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )

  if (!showHoverLabel) {
    return (
      <div className={cn('group relative h-full w-full overflow-hidden rounded-2xl shadow-lg', className)}>
        {frameContent}
      </div>
    )
  }

  return (
    <Link
      href={`/tour-packages?location=${encodeURIComponent(activeImage.country)}`}
      className={cn('group relative block h-full w-full overflow-hidden rounded-2xl shadow-lg', className)}
    >
      {frameContent}
    </Link>
  )
}

type HeroSection2Props = {
  popularDestinations: PopularDestination[]
}

const HeroSection2 = ({ popularDestinations }: HeroSection2Props) => {
  const router = useRouter()

  const countries = useMemo(
    () => Array.from(new Set(popularDestinations.map(destination => destination.country))).sort(),
    [popularDestinations]
  )

  const [location, setLocation] = useState<string | null>(null)
  const searchFormRef = useRef<HTMLFormElement>(null)

  const goToTourPackages = (destination: string | null) => {
    router.push(destination ? `/tour-packages?location=${encodeURIComponent(destination)}` : '/tour-packages')
  }

  const handleLocationSelect = (destination: string | null) => {
    setLocation(destination)

    if (destination) goToTourPackages(destination)
  }

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    goToTourPackages(location)
  }

  return (
    <section className='bg-background overflow-x-hidden py-8 sm:py-16 lg:py-18'>
      <div className='mx-auto grid w-full max-w-360 gap-12 px-4 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:px-8'>
        <div className='flex max-w-2xl min-w-0 flex-col gap-16 self-stretch'>
          <div className='flex flex-col space-y-6'>
            <MotionPreset
              fade
              slide
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className='text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase'
            >
              <span aria-hidden='true'>—</span>
              Trusted by 2 million travelers
            </MotionPreset>

            <MotionPreset
              component='h2'
              fade
              slide
              delay={0.2}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className='text-5xl leading-[1.15] font-bold text-balance sm:text-5xl'
            >
              Discover & World&apos;s
              <br />
              <span className='text-primary'>Most</span>{' '}
              <ShuffleFrame
                images={DISCOVER_IMAGES}
                duration={2200}
                className='inline-block h-12 w-24 rounded-full align-middle shadow-none sm:h-14 sm:w-28'
              />{' '}
              <span className='text-primary'>Amazing</span> <br />
              Destinations
            </MotionPreset>

            <MotionPreset
              component='p'
              fade
              slide
              delay={0.4}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className='text-muted-foreground'
            >
              From the cliffs of the Amalfi Coast to the dunes of Wadi Rum, {themeConfig.templateName} designs journeys
              that turn distant places into lasting memories.
            </MotionPreset>

            <MotionPreset fade slide delay={0.6} transition={{ duration: 0.5, ease: 'easeOut' }}>
              <form
                ref={searchFormRef}
                onSubmit={handleSearch}
                className='bg-background flex w-full items-center gap-1 rounded-full border px-2 shadow-lg **:data-[slot=input-group]:dark:bg-transparent'
              >
                <Combobox
                  items={countries}
                  value={location}
                  onValueChange={handleLocationSelect}
                  autoHighlight={false}
                  highlightItemOnHover={false}
                >
                  <ComboboxInput
                    placeholder='Get on your Destination'
                    showTrigger={false}
                    className='has-[[data-slot=input-group-control]:focus-visible]:border-input h-auto min-w-0 flex-1 border-none px-3 py-2.5 text-sm shadow-none has-[[data-slot=input-group-control]:focus-visible]:ring-0'
                  />
                  <ComboboxContent
                    anchor={searchFormRef}
                    side='bottom'
                    sideOffset={10}
                    collisionAvoidance={{ side: 'none' }}
                    className='max-h-80 duration-200'
                  >
                    <ComboboxEmpty>No destinations found.</ComboboxEmpty>
                    <ComboboxList className='max-h-72'>
                      {country => (
                        <ComboboxItem key={country} value={country} className='hover:bg-accent gap-2 py-2'>
                          <MapPinIcon className='text-muted-foreground' />
                          {country}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>

                <Button type='submit' size='icon' className='size-10 shrink-0 rounded-full'>
                  <SearchIcon />
                  <span className='sr-only'>Search tour packages</span>
                </Button>
              </form>
            </MotionPreset>
          </div>

          <MotionPreset
            fade
            slide={{ direction: 'down', offset: 50 }}
            delay={1}
            blur
            transition={{ duration: 0.5 }}
            className='grid min-w-0 gap-4 sm:grid-cols-2'
          >
            <Link
              href='/tour-packages?duration=1-2'
              className='group bg-destructive/10 relative flex flex-col justify-center gap-2 overflow-hidden rounded-2xl p-5'
            >
              <Badge className='bg-destructive text-primary-foreground w-fit gap-1'>
                <FlameIcon className='size-3' />
                Hot Deal
              </Badge>
              <p className='text-lg font-semibold'>Weekend Getaways</p>
              <p className='text-muted-foreground text-sm'>Short trips, big memories</p>
              <p className='text-destructive text-sm font-semibold'>Up to 20% off</p>
              <img
                src='/images/bag.webp'
                alt=''
                aria-hidden='true'
                className='absolute -right-4 -bottom-4 size-32 object-contain sm:size-36'
              />
            </Link>

            <Link
              href='/tour-packages?sort=price-asc'
              className='group bg-primary/10 text-primary relative flex flex-col justify-center gap-2 overflow-hidden rounded-2xl p-5'
            >
              <Badge className='bg-primary text-primary-foreground w-fit gap-1'>
                <CrownIcon className='size-3' />
                {themeConfig.templateName} Exclusive
              </Badge>
              <p className='text-lg font-semibold'>Top Travel Deals</p>
              <p className='text-muted-foreground text-sm'>Packages, stays & experiences</p>
              <p className='text-primary text-sm font-semibold'>At least 10% off</p>
              <img
                src='/images/sale-coupon.webp'
                alt=''
                aria-hidden='true'
                className='absolute -right-4 -bottom-4 size-32 object-contain sm:size-36'
              />
            </Link>
          </MotionPreset>
        </div>

        <div className='relative max-lg:hidden'>
          <MotionPreset fade delay={1.2} transition={{ duration: 0.7, ease: 'easeOut' }}>
            <MapSvg className='absolute -top-38 -right-8 z-0 -rotate-5 max-lg:hidden' />
          </MotionPreset>

          <MotionPreset
            fade
            blur
            delay={0.3}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className='relative z-10 grid grid-cols-2 items-center gap-4'
          >
            <div className='flex flex-col gap-4'>
              <div className='relative'>
                <ShuffleFrame images={FRAME_1_IMAGES} duration={4000} className='aspect-3/3' showHoverLabel />
              </div>
              <ShuffleFrame images={FRAME_2_IMAGES} duration={4600} className='aspect-3/3' showHoverLabel />
            </div>

            <div className='relative mt-14'>
              <ShuffleFrame images={FRAME_3_IMAGES} duration={5200} className='aspect-4/6' showHoverLabel />
            </div>
          </MotionPreset>
        </div>
      </div>
    </section>
  )
}

export default HeroSection2
