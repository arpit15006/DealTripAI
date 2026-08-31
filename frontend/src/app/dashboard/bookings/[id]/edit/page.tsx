// Component Imports
import EditBookingView from '@/views/apps/bookings/edit'

type EditBookingPageProps = {
  params: Promise<{ id: string }>
}

const EditBookingPage = async ({ params }: EditBookingPageProps) => {
  const { id } = await params

  return <EditBookingView id={id} />
}

export default EditBookingPage
