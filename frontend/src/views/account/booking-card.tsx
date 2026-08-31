'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { toast } from 'sonner'
import { CalendarIcon, MapPinnedIcon, StarIcon, UsersIcon } from 'lucide-react'

// Type Imports
import type { Booking } from '@/types/account/booking-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Rating } from '@/components/ui/rating'
import { Textarea } from '@/components/ui/textarea'

// Store Imports
import { usePackageReviewsStore } from '@/store/use-package-reviews-store'
import { useProfileStore } from '@/store/use-profile-store'

// Utils Imports
import { cn } from '@/lib/utils'
import {
  BOOKING_STATUS_BADGE_CLASSNAME,
  BOOKING_STATUS_BADGE_VARIANT,
  BOOKING_STATUS_LABEL
} from '@/utils/booking-utils'

type BookingCardProps = {
  booking: Booking
  onCancel?: (id: string) => void
}

const BookingCard = ({ booking, onCancel }: BookingCardProps) => {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')

  const user = useProfileStore(state => state.user)
  const addReview = usePackageReviewsStore(state => state.addReview)

  const formattedTravelDate = new Date(booking.travelDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  const handleConfirmCancel = () => {
    onCancel?.(booking.id)
    setIsCancelDialogOpen(false)
  }

  const handleSubmitReview = () => {
    addReview(booking.packageSlug, {
      id: crypto.randomUUID(),
      name: `${user.firstName} ${user.lastName}`,
      role: 'Verified Traveler',
      company: `Traveled ${new Date(booking.travelDate).getFullYear()}`,
      avatar: user.avatar,
      rating: reviewRating,
      content: reviewComment
    })

    toast.success('Thanks for your review!')
    setReviewRating(0)
    setReviewComment('')
    setIsReviewDialogOpen(false)
  }

  return (
    <Card className='h-full gap-4 overflow-hidden pt-0'>
      <img src={booking.packageImage} alt={booking.packageTitle} className='h-40 w-full object-cover' />

      <CardContent className='flex flex-1 flex-col gap-3'>
        <div className='flex flex-1 flex-col gap-1'>
          <div className='flex items-center justify-between gap-2'>
            <p className='font-semibold'>{booking.packageTitle}</p>
            <Badge
              variant={BOOKING_STATUS_BADGE_VARIANT[booking.status]}
              className={cn(BOOKING_STATUS_BADGE_CLASSNAME[booking.status])}
            >
              {BOOKING_STATUS_LABEL[booking.status]}
            </Badge>
          </div>
          <div className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm'>
            <span className='flex items-center gap-1.5'>
              <CalendarIcon className='size-3.5' />
              {formattedTravelDate}
            </span>
            <span className='flex items-center gap-1.5'>
              <UsersIcon className='size-3.5' />
              {booking.travelers} {booking.travelers === 1 ? 'traveler' : 'travelers'}
            </span>
            <span>Ref: {booking.bookingRef}</span>
          </div>
        </div>

        <span className='text-lg font-bold'>${booking.totalAmount.toLocaleString()}</span>
      </CardContent>

      <CardContent className='flex gap-2'>
        {booking.status === 'upcoming' && (
          <>
            <Button variant='outline' onClick={() => setIsCancelDialogOpen(true)} className='flex-1'>
              Cancel
            </Button>
            <Button
              render={<Link href={`/my-dashboard/track-booking?bookingId=${booking.id}`} />}
              nativeButton={false}
              className='flex-1'
            >
              <MapPinnedIcon className='size-4' />
              Track
            </Button>
          </>
        )}
        {booking.status === 'completed' && (
          <>
            <Button variant='outline' onClick={() => setIsReviewDialogOpen(true)} className='flex-1'>
              <StarIcon className='size-4' />
              Review
            </Button>
            <Button
              render={<Link href={`/tour-packages/${booking.packageSlug}`} />}
              nativeButton={false}
              className='flex-1'
            >
              View Details
            </Button>
          </>
        )}
        {booking.status === 'cancelled' && (
          <>
            <Button variant='outline' disabled className='flex-1'>
              Cancel
            </Button>
            <Button disabled className='flex-1'>
              <MapPinnedIcon className='size-4' />
              Track
            </Button>
          </>
        )}
      </CardContent>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className='sm:max-w-100'>
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              This will cancel your booking for {booking.packageTitle} (Ref: {booking.bookingRef}). This action
              can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={() => setIsCancelDialogOpen(false)}>
              Keep Booking
            </Button>
            <Button type='button' variant='destructive' onClick={handleConfirmCancel}>
              Cancel Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className='sm:max-w-100'>
          <DialogHeader>
            <DialogTitle>Review {booking.packageTitle}</DialogTitle>
            <DialogDescription>Share your experience with other travelers</DialogDescription>
          </DialogHeader>
          <div className='flex min-w-0 flex-col gap-3'>
            <Rating value={reviewRating} onValueChange={setReviewRating} variant='yellow' size={22} />
            <Textarea
              placeholder='Share your feedback!'
              value={reviewComment}
              className='wrap-break-word whitespace-pre-wrap'
              onChange={e => setReviewComment(e.target.value)}
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button type='button' disabled={reviewRating === 0} onClick={handleSubmitReview}>
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default BookingCard
