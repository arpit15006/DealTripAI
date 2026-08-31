// Third-party Imports
import {
  BedIcon,
  BinocularsIcon,
  BusIcon,
  CalendarDaysIcon,
  PlaneIcon,
  UserRoundIcon,
  UtensilsIcon,
  type LucideIcon
} from 'lucide-react'

// Type Imports
import type { HighlightIcon, PackageDetail } from '@/types/packages/package-detail-types'

// Component Imports
import { Card } from '@/components/ui/card'

// Utils Imports
import { cn } from '@/lib/utils'

type PackageHighlightsProps = {
  packageDetail: PackageDetail
}

const HIGHLIGHT_ICON_MAP: Record<HighlightIcon, LucideIcon> = {
  transfer: BusIcon,
  stay: BedIcon,
  meals: UtensilsIcon,
  sightseeing: BinocularsIcon,
  flight: PlaneIcon,
  guide: UserRoundIcon
}

const COLUMNS = 3

const PackageHighlights = ({ packageDetail }: PackageHighlightsProps) => {
  const { highlights } = packageDetail
  const isLastColumn = (index: number) => (index + 1) % COLUMNS === 0
  const isLastRow = (index: number) => index >= highlights.length - COLUMNS

  return (
    <div className='flex flex-col gap-4'>
      <div className='text-muted-foreground flex items-center gap-2 text-sm'>
        <CalendarDaysIcon className='size-4' />
        <span>
          {packageDetail.days} Days / {packageDetail.nights} Nights &middot; {packageDetail.itinerary.length}-stop
          itinerary
        </span>
      </div>
      <Card className='grid grid-cols-1 gap-0 py-0 shadow-none sm:grid-cols-3'>
        {highlights.map((highlight, index) => {
          const Icon = HIGHLIGHT_ICON_MAP[highlight.icon]

          return (
            <div
              key={highlight.label}
              className={cn(
                'flex items-center justify-between gap-3 p-4',
                index !== highlights.length - 1 && 'border-b',
                isLastRow(index) && 'sm:border-b-0',
                !isLastColumn(index) && 'sm:border-e'
              )}
            >
              <div>
                <p className='text-base font-medium'>{highlight.label}</p>
                <p className='text-muted-foreground text-sm'>{highlight.value}</p>
              </div>
              <div className='bg-muted flex size-10 shrink-0 items-center justify-center rounded-md'>
                <Icon />
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}

export default PackageHighlights
