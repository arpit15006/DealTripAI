// Next Imports
import Link from 'next/link'

// Third-party Imports
import { ArrowRightIcon, MapPinIcon, SparklesIcon, StarIcon } from 'lucide-react'

// Type Imports
import type { TourPackage } from '@/types/packages/tour-package-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import FavouriteButton from '@/components/favourites/favourite-button'
import type { ViewMode } from '@/views/packages/tour-packages/toolbar'

// Utils Imports
import { getDiscountedPrice } from '@/utils/build-package-detail'
import { cn } from '@/lib/utils'

type TourPackageCardProps = {
  tourPackage: TourPackage
  viewMode?: ViewMode
}

const TourPackageCard = ({ tourPackage, viewMode = 'grid' }: TourPackageCardProps) => {
  const isPremium = tourPackage.packageType === 'premium'
  const isList = viewMode === 'list'
  const packageHref = `/tour-packages/${tourPackage.slug}`
  const discountedPrice = getDiscountedPrice(tourPackage)
  const hasDiscount = Boolean(tourPackage.discountPercent)

  return (
    <Link
      href={packageHref}
      className={cn(
        'block h-full rounded-xl',
        isPremium &&
          'animate-gradient-border bg-[linear-gradient(90deg,var(--primary),#fbbf24,#f43f5e,var(--primary))] bg-size-[200%_100%] p-0.5'
      )}
    >
      <Card className={cn('group h-full gap-4 overflow-hidden pt-0', isList && 'flex-row pb-0', isPremium && 'ring-0')}>
        <CardContent className={cn('relative px-0', isList && 'w-28 shrink-0 sm:w-72')}>
          <img
            src={tourPackage.images[0]}
            alt={tourPackage.title}
            className={cn('h-48 w-full object-cover', isList && 'absolute inset-0 h-full w-full')}
          />
          <FavouriteButton slug={tourPackage.slug} />
          {isPremium && (
            <Badge className='absolute top-3 right-3 gap-1 bg-amber-500 text-white'>
              <SparklesIcon className='size-3' />
              Premium
            </Badge>
          )}
        </CardContent>
        <div className={cn('flex flex-1 flex-col gap-4', isList && 'order-1 py-3 sm:py-6')}>
          <CardContent className='flex flex-1 flex-col gap-3'>
            <div className='flex items-center justify-between gap-2'>
              <Badge variant='secondary' className='w-fit capitalize'>
                {tourPackage.category}
              </Badge>
              <div className='flex items-center gap-1 text-sm'>
                <StarIcon className='size-3.5 fill-amber-400 text-amber-400' />
                <span>
                  {tourPackage.rating} ({tourPackage.reviewCount} reviews)
                </span>
              </div>
            </div>
            <div className={cn('flex items-start gap-3', isList && 'justify-between')}>
              <div>
                <h3 className='text-lg font-semibold'>{tourPackage.title}</h3>
                <div className='text-muted-foreground flex items-center gap-1.5 text-sm'>
                  <MapPinIcon className='size-3.5' />
                  <span>{tourPackage.location}</span>
                </div>
              </div>
              {isList && (
                <Button className='group hidden shrink-0 sm:inline-flex' size='sm'>
                  View Details
                  <ArrowRightIcon className='transition-transform duration-200 group-hover:translate-x-0.5' />
                </Button>
              )}
            </div>
            <div className='flex items-center justify-between text-sm'>
              <span>
                {tourPackage.days} days / {tourPackage.nights} nights
              </span>
              <span className='flex items-center gap-1.5'>
                {hasDiscount && <span className='text-muted-foreground line-through'>${tourPackage.price}</span>}
                <span className='font-medium'>${discountedPrice} / person</span>
              </span>
            </div>
          </CardContent>
          <CardContent className={cn('mt-auto', isList && 'sm:hidden')}>
            <Button className='group w-full' size='sm'>
              View Details
              <ArrowRightIcon className='transition-transform duration-200 group-hover:translate-x-0.5' />
            </Button>
          </CardContent>
        </div>
      </Card>
    </Link>
  )
}

export default TourPackageCard
