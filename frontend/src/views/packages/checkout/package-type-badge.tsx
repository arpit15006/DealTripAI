// Third-party Imports
import { SparklesIcon } from 'lucide-react'

// Type Imports
import type { TourPackageType } from '@/types/packages/tour-package-types'

// Component Imports
import { Badge } from '@/components/ui/badge'

// Utils Imports
import { cn } from '@/lib/utils'

type PackageTypeBadgeProps = {
  packageType: TourPackageType
  className?: string
}

const PackageTypeBadge = ({ packageType, className }: PackageTypeBadgeProps) => {
  if (packageType === 'premium') {
    return (
      <Badge className={cn('gap-1 bg-amber-500 text-white', className)}>
        <SparklesIcon className='size-3' />
        Premium
      </Badge>
    )
  }

  return (
    <Badge variant='outline' className={cn('capitalize', className)}>
      {packageType}
    </Badge>
  )
}

export default PackageTypeBadge
