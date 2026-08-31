'use client'

// React Imports
import { useMemo } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { ExternalLinkIcon, MapPinIcon, PencilIcon, RadioIcon, StarIcon } from 'lucide-react'
import { toast } from 'sonner'

// Type Imports
import type { TourPackage } from '@/types/packages/tour-package-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import PackageTypeBadge from '@/views/packages/checkout/package-type-badge'
import ImageCarousel from './image-carousel'

// Store Imports
import { useTourPackagesStore } from '@/store/use-tour-packages-store'

// Utils Imports
import { getDiscountedPrice, resolveTripInformation } from '@/utils/build-package-detail'
import { cn } from '@/lib/utils'

type PackageCatalogCardProps = {
  tourPackage: TourPackage
}

const PackageCatalogCard = ({ tourPackage }: PackageCatalogCardProps) => {
  const togglePublish = useTourPackagesStore(state => state.togglePublish)

  const isPublished = tourPackage.isPublished !== false
  const discountedPrice = getDiscountedPrice(tourPackage)

  const tripInformation = useMemo(() => resolveTripInformation(tourPackage), [tourPackage])

  const handleTogglePublish = () => {
    togglePublish(tourPackage.id)
    toast.success(isPublished ? `${tourPackage.title} unpublished` : `${tourPackage.title} published`)
  }

  return (
    <Card className='shadow-none'>
      <CardContent className='flex flex-col gap-5 lg:h-72 lg:flex-row'>
        <div className='w-full shrink-0 lg:w-72'>
          <ImageCarousel images={tourPackage.images} alt={tourPackage.title} />
        </div>

        <div className='flex min-h-0 flex-1 flex-col gap-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='outline' className='capitalize'>
              {tourPackage.category}
            </Badge>
            <Badge variant={isPublished ? 'secondary' : 'outline'}>{isPublished ? 'Published' : 'Draft'}</Badge>
          </div>

          <div>
            <h3 className='text-lg font-semibold'>{tourPackage.title}</h3>
            <div className='text-muted-foreground flex items-center gap-1 text-sm'>
              <MapPinIcon className='size-3.5' />
              <span>{tourPackage.location}</span>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-3 text-sm'>
            <span className='flex items-center gap-1.5'>
              <StarIcon className='size-4 fill-amber-400 text-amber-400' />
              <span className='font-medium'>{tourPackage.rating > 0 ? tourPackage.rating.toFixed(1) : '—'}</span>
              <span className='text-muted-foreground'>({tourPackage.reviewCount} reviews)</span>
            </span>
            <Separator orientation='vertical' className='h-auto' />
            <span className='text-muted-foreground'>
              {tourPackage.days}D / {tourPackage.nights}N
            </span>
            <Separator orientation='vertical' className='h-auto' />
            <div className='flex items-center gap-1.5'>
              {tourPackage.discountPercent ? (
                <>
                  <span className='text-muted-foreground line-through'>${tourPackage.price.toLocaleString()}</span>
                  <span className='font-semibold'>${discountedPrice.toLocaleString()}</span>
                  <Badge variant='outline' className='border-green-600/20 bg-green-600/10 text-green-600'>
                    {tourPackage.discountPercent}% off
                  </Badge>
                </>
              ) : (
                <span className='font-semibold'>${tourPackage.price.toLocaleString()}</span>
              )}
              <span className='text-muted-foreground'>/ person</span>
            </div>
            <Separator orientation='vertical' className='h-auto' />
            <PackageTypeBadge packageType={tourPackage.packageType} />
          </div>

          <ScrollArea className='min-h-0 flex-1 rounded-md'>
            <div
              className={cn(
                'text-muted-foreground pr-3 text-sm leading-relaxed',
                '[&_h2]:text-foreground [&_h3]:text-foreground [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_ol]:ml-4 [&_ol]:list-decimal [&_p]:mb-2 [&_ul]:ml-4 [&_ul]:list-disc'
              )}
              dangerouslySetInnerHTML={{ __html: tripInformation }}
            />
          </ScrollArea>

          <div className='mt-auto flex flex-wrap gap-2 pt-1'>
            <Button
              size='sm'
              render={<Link href={`/dashboard/tour-packages/${tourPackage.id}/edit`} />}
              nativeButton={false}
            >
              <PencilIcon className='size-3.5' />
              Edit
            </Button>
            <Button size='sm' variant='outline' onClick={handleTogglePublish}>
              <RadioIcon className='size-3.5' />
              {isPublished ? 'Unpublish' : 'Publish'}
            </Button>
            {isPublished && (
              <Button
                size='sm'
                variant='ghost'
                render={<Link href={`/tour-packages/${tourPackage.slug}`} />}
                nativeButton={false}
              >
                <ExternalLinkIcon className='size-3.5' />
                View on site
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PackageCatalogCard
