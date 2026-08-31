'use client'

// Component Imports
import { Card } from '@/components/ui/card'
import { reviewColumns } from '@/views/apps/settings/reviews-ratings/columns'
import { ReviewsDataTable } from '@/views/apps/settings/reviews-ratings/data-table'
import ReviewStats from '@/views/apps/settings/reviews-ratings/review-stats'

// Store Imports
import { useReviewsStore } from '@/store/use-reviews-store'

const ReviewsRatingsView = () => {
  const items = useReviewsStore(state => state.items)

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Reviews & Ratings</h1>
        <p className='text-muted-foreground text-sm'>Moderate and manage customer reviews across your tour packages.</p>
      </div>

      <ReviewStats items={items} />

      <Card className='w-full gap-0 py-0'>
        <ReviewsDataTable columns={reviewColumns} data={items} />
      </Card>
    </div>
  )
}

export default ReviewsRatingsView
