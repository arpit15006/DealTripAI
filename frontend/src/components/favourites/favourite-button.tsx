'use client'

// React Imports
import type { MouseEvent } from 'react'

// Third-party Imports
import { HeartIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'

// Store Imports
import { useFavouritesStore } from '@/store/use-favourites-store'

// Utils Imports
import { cn } from '@/lib/utils'

type FavouriteButtonProps = {
  slug: string
}

const FavouriteButton = ({ slug }: FavouriteButtonProps) => {
  const isFavourite = useFavouritesStore(state => state.isFavourite(slug))
  const toggleFavourite = useFavouritesStore(state => state.toggleFavourite)

  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavourite(slug)
  }

  return (
    <Button
      type='button'
      variant='secondary'
      size='icon'
      aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
      onClick={handleClick}
      className={cn(
        'absolute top-3 left-3 size-8 rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-100',
        isFavourite && 'opacity-100'
      )}
    >
      <HeartIcon className={cn('size-4', isFavourite && 'fill-destructive text-destructive')} />
    </Button>
  )
}

export default FavouriteButton
