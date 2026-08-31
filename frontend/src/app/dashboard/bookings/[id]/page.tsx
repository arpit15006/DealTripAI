// Component Imports
import BookingDetailsView from '@/views/apps/bookings/booking-details'

type BookingDetailsPageProps = {
  params: Promise<{ id: string }>
}

const BookingDetailsPage = async ({ params }: BookingDetailsPageProps) => {
  const { id } = await params

  return <BookingDetailsView id={id} />
}

export default BookingDetailsPage
