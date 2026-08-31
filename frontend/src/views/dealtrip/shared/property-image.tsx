// Next Imports
import Image from 'next/image'

// Util Imports
import { cn } from '@/lib/utils'

type Props = {
  src?: string
  alt: string
  className?: string

  /** Rendered when a property has no photography of its own. */
  fallbackLabel?: string
  sizes?: string
  priority?: boolean
}

/**
 * Property or room photography.
 *
 * Onboarded merchants arrive without images, so the empty case is a designed
 * state rather than a broken one: a tinted panel carrying the property's
 * initials, which reads as deliberate next to the seeded properties that do
 * have photographs.
 */
const PropertyImage = ({ src, alt, className, fallbackLabel, sizes = '(max-width: 768px) 100vw, 33vw', priority }: Props) => {
  if (!src) {
    const initials = (fallbackLabel ?? alt)
      .split(/\s+/)
      .slice(0, 2)
      .map(word => word[0]?.toUpperCase() ?? '')
      .join('')

    return (
      <div
        className={cn(
          'from-primary/15 to-primary/5 text-primary/70 flex items-center justify-center bg-gradient-to-br text-lg font-semibold',
          className
        )}
        aria-label={alt}
        role='img'
      >
        {initials}
      </div>
    )
  }

  return (
    <div className={cn('bg-muted relative overflow-hidden', className)}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className='object-cover' />
    </div>
  )
}

export default PropertyImage
