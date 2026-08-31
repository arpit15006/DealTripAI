// Next Imports
import Link from 'next/link'

// Third-party Imports
import cn from 'clsx'

// Type Imports
import type { RecommendedPackage } from '@/types/pages/home-types'
import { Badge } from '@/components/ui/badge'

type RecommendedPackagesProps = {
  recommendedPackages: RecommendedPackage[]
}

const RecommendedPackages = ({ recommendedPackages }: RecommendedPackagesProps) => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-360 px-4 sm:px-6 lg:px-8'>
        <div className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'>
          <Badge className='h-auto text-sm font-normal' variant='outline'>
            Trending
          </Badge>
          <h2 className='text-3xl font-bold'>Highly Recommended Packages</h2>
          <p className='text-muted-foreground text-base'>
            Explore handpicked getaways loved by travelers and curated by our experts.
          </p>
        </div>
        <div className='grid grid-cols-2 gap-6 sm:grid-cols-4 md:grid-cols-6'>
          {recommendedPackages.map(image => (
            <div key={image.id} className={cn('group relative overflow-hidden rounded-lg', image.className)}>
              <Link href={`/tour-packages/${image.slug}`} className='block h-full w-full'>
                <img
                  src={image.src}
                  alt={image.alt}
                  className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                />
                <div className='pointer-events-none absolute inset-0 bg-linear-to-b from-black/0 to-black/85 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                <div className='absolute inset-x-0 bottom-0 p-4'>
                  <div className='pointer-events-none translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100'>
                    <p className='text-primary-foreground text-4xl font-semibold tracking-tight'>{image.country}</p>
                    <div className='text-primary bg-primary-foreground/80 mt-2 inline-flex rounded-md px-3 py-1 text-lg font-semibold'>
                      {image.startingFromLabel}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default RecommendedPackages
