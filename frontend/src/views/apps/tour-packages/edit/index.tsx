'use client'

// Next Imports
import Link from 'next/link'

// Component Imports
import { Button } from '@/components/ui/button'
import PackageForm from '@/views/apps/tour-packages/package-form'

// Store Imports
import { useTourPackagesStore } from '@/store/use-tour-packages-store'

type EditPackageViewProps = {
  id: string
}

const EditPackageView = ({ id }: EditPackageViewProps) => {
  const tourPackage = useTourPackagesStore(state => state.items.find(item => item.id === id))

  if (!tourPackage) {
    return (
      <div className='flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center'>
        <p className='font-medium'>Package not found</p>
        <Button variant='outline' render={<Link href='/dashboard/tour-packages' />} nativeButton={false}>
          Back to Package List
        </Button>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Edit Tour Package</h1>
        <p className='text-muted-foreground text-sm'>Update the details of &ldquo;{tourPackage.title}&rdquo;.</p>
      </div>
      <PackageForm tourPackage={tourPackage} />
    </div>
  )
}

export default EditPackageView
