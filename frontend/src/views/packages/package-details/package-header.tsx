// Third-party Imports
import { MapPinIcon, SparklesIcon, StarIcon } from 'lucide-react'

// Type Imports
import type { PackageDetail } from '@/types/packages/package-detail-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

type PackageHeaderProps = {
  packageDetail: PackageDetail
}

const PackageHeader = ({ packageDetail }: PackageHeaderProps) => {
  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <Badge variant='secondary' className='w-fit capitalize'>
          {packageDetail.category}
        </Badge>
        {packageDetail.packageType === 'premium' && (
          <Badge className='gap-1 bg-amber-500 text-white'>
            <SparklesIcon className='size-3' />
            Premium
          </Badge>
        )}
      </div>
      <h1 className='text-2xl font-semibold sm:text-3xl'>{packageDetail.title}</h1>
      <div className='text-muted-foreground flex flex-wrap items-center gap-2 text-sm'>
        <span className='flex items-center gap-1'>
          <MapPinIcon className='size-4' />
          {packageDetail.location}
        </span>
        <Separator orientation='vertical' className='h-4' />
        <span className='flex items-center gap-1.5'>
          <StarIcon className='size-4 fill-amber-400 text-amber-400' />
          <span className='text-foreground font-medium'>{packageDetail.rating}</span>
          <span>({packageDetail.reviewCount} reviews)</span>
        </span>
      </div>
      {packageDetail.tags && packageDetail.tags.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {packageDetail.tags.map(tag => (
            <Badge key={tag} variant='outline' className='text-xs'>
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export default PackageHeader
