// Component Imports
import { Marquee } from '@/components/ui/marquee'

// Utils Imports
import { cn } from '@/lib/utils'

type MarqueeGalleryProps = {
  className?: string
  rows?: number
  tilesPerRow?: number
  tileWidth?: number
  gap?: number
  borderRadius?: string
  borderWidth?: number
  borderColor?: string
  durationSeconds?: number
  overlayBlurColor?: string
  fadeOpacity?: number
}

// Country folders under public/images/countries — reused so the auth marquee matches the rest of the app
const GALLERY_COUNTRIES = [
  'indonesia',
  'switzerland',
  'india',
  'maldives',
  'kenya',
  'greece',
  'newzealand',
  'japan',
  'uae',
  'chile',
  'thailand',
  'canada',
  'australia',
  'russia',
  'usa'
]

const GALLERY_IMAGES = GALLERY_COUNTRIES.flatMap(country =>
  Array.from({ length: 4 }, (_, index) => ({
    src: `/images/countries/${country}/${country}-${index + 1}.webp`,
    alt: `${country} travel photo`
  }))
)

// A decorative, non-interactive image wall for auth-page backgrounds — built from stacked Marquee rows
const MarqueeGallery = ({
  className,
  rows = 5,
  tilesPerRow = 10,
  tileWidth = 190,
  gap = 0,
  borderRadius = '0px',
  borderWidth = 6,
  borderColor = '#ffffff',
  durationSeconds = 34,
  overlayBlurColor = '#120F17',
  fadeOpacity = 0.55
}: MarqueeGalleryProps) => {
  const rowsData = Array.from({ length: rows }, (_, r) => ({
    reverse: r % 2 === 1,
    duration: durationSeconds + (r % 3) * 5,
    tiles: Array.from({ length: tilesPerRow }, (_, i) => GALLERY_IMAGES[(r * tilesPerRow + i) % GALLERY_IMAGES.length])
  }))

  return (
    <div className={cn('relative flex size-full flex-col justify-center overflow-hidden', className)}>
      {rowsData.map((row, r) => (
        <div key={r} className='min-h-0 flex-1 overflow-hidden'>
          <Marquee duration={row.duration} gap={gap} reverse={row.reverse} repeat={2} className='h-full p-0'>
            {row.tiles.map((tile, i) => (
              <div
                key={i}
                className='shrink-0 overflow-hidden bg-gray-200'
                style={{ width: tileWidth, borderRadius, border: `${borderWidth}px solid ${borderColor}` }}
              >
                <img
                  src={tile.src}
                  alt={tile.alt}
                  draggable={false}
                  className='pointer-events-none size-full object-cover'
                />
              </div>
            ))}
          </Marquee>
        </div>
      ))}

      <div
        className='pointer-events-none absolute inset-y-0 left-0 w-1/6'
        style={{
          background: `linear-gradient(to right, color-mix(in oklab, ${overlayBlurColor} ${fadeOpacity * 100}%, transparent), transparent)`
        }}
      />
      <div
        className='pointer-events-none absolute inset-y-0 right-0 w-1/6'
        style={{
          background: `linear-gradient(to left, color-mix(in oklab, ${overlayBlurColor} ${fadeOpacity * 100}%, transparent), transparent)`
        }}
      />
    </div>
  )
}

export default MarqueeGallery
