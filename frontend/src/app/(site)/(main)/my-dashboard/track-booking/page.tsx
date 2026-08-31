// React Imports
import { Suspense } from 'react'

// Component Imports
import TrackBookingView from '@/views/account/track-booking'

const TrackBookingPage = () => {
  return (
    <Suspense>
      <TrackBookingView />
    </Suspense>
  )
}

export default TrackBookingPage
