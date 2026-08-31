// Type Imports
import type { GalleryImage } from '@/types/packages/package-detail-types'

// Utils Imports
import { cn } from '@/lib/utils'

type PackageGalleryProps = {
  images: GalleryImage[]
}

const PackageGallery = ({ images }: PackageGalleryProps) => {
  return (
    <div className='grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6'>
      {images.map((image, index) => (
        <div key={image.src + index} className={cn('overflow-hidden rounded-lg', image.className)}>
          <img
            src={image.src}
            alt={image.alt}
            className='h-full w-full object-cover transition-transform duration-300 hover:scale-105'
          />
        </div>
      ))}
    </div>
  )
}

export default PackageGallery
