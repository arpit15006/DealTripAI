// Component Imports
import EditPackageView from '@/views/apps/tour-packages/edit'

type EditPackagePageProps = {
  params: Promise<{ id: string }>
}

const EditPackagePage = async ({ params }: EditPackagePageProps) => {
  const { id } = await params

  return <EditPackageView id={id} />
}

export default EditPackagePage
