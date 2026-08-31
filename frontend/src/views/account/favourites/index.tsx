'use client'

// React Imports
import { useMemo } from 'react'

// Next Imports
import Link from 'next/link'

// Component Imports
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import TourPackageCard from '@/views/packages/tour-package-card'

// Store Imports
import { useFavouritesStore } from '@/store/use-favourites-store'
import { useTourPackagesStore } from '@/store/use-tour-packages-store'

// SVGs Imports
import FavouriteSvg from '@/assets/svg/favourite'

const FavouritesView = () => {
  const slugs = useFavouritesStore(state => state.slugs)

  const items = useTourPackagesStore(state => state.items)

  const favouritePackages = useMemo(() => items.filter(tourPackage => slugs.includes(tourPackage.slug)), [items, slugs])

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold'>My Favourite</h1>
        <p className='text-muted-foreground text-sm'>Tour packages you&apos;ve saved for later</p>
      </div>

      {favouritePackages.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant='default'>
              <FavouriteSvg />
            </EmptyMedia>
            <EmptyTitle className='text-2xl font-semibold'>No favourites yet</EmptyTitle>
            <EmptyDescription>Browse any tour package to save it here for quick access later.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link href='/tour-packages' />} nativeButton={false}>
              Browse Tour Packages
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
          {favouritePackages.map(tourPackage => (
            <TourPackageCard key={tourPackage.id} tourPackage={tourPackage} />
          ))}
        </div>
      )}
    </div>
  )
}

export default FavouritesView
