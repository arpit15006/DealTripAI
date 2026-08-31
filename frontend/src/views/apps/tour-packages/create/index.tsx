// Component Imports
import PackageForm from '@/views/apps/tour-packages/package-form'

const CreatePackageView = () => {
  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Create Tour Package</h1>
        <p className='text-muted-foreground text-sm'>Add a new package to the catalog.</p>
      </div>
      <PackageForm />
    </div>
  )
}

export default CreatePackageView
