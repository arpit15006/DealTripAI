'use client'

// Third-party Imports
import { format } from 'date-fns'
import { StarIcon } from 'lucide-react'

// Type Imports
import type { Review } from '@/types/settings/reviews-types'
import { REVIEW_STATUS_STYLES } from '@/types/settings/reviews-types'

// Component Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// Utils Imports
import { cn } from '@/lib/utils'

type ReviewDetailDialogProps = {
  review: Review | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const RATING_MAX = 5

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const ReviewDetailDialog = ({ review, open, onOpenChange }: ReviewDetailDialogProps) => {
  if (!review) return null

  const style = REVIEW_STATUS_STYLES[review.status]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Review Details</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-5'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <Avatar className='size-11'>
                <AvatarImage src={review.userAvatar} alt={review.userName} />
                <AvatarFallback className='bg-primary/10 text-primary text-sm font-semibold'>
                  {getInitials(review.userName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className='text-sm font-medium'>{review.userName}</p>
                <p className='text-muted-foreground text-xs'>{format(new Date(review.date), 'dd MMM yyyy')}</p>
              </div>
            </div>
            <Badge className={cn('gap-1.5 capitalize', style.text, style.bg)}>
              <span className={cn('size-1.5 rounded-full', style.dot)} />
              {review.status}
            </Badge>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-1.5'>
              <Label className='text-muted-foreground text-xs'>Tour Package</Label>
              <p className='text-sm font-medium'>{review.tourPackageTitle}</p>
            </div>
            <div className='flex flex-col gap-1.5'>
              <Label className='text-muted-foreground text-xs'>Rating</Label>
              <div className='flex items-center gap-0.5'>
                {Array.from({ length: RATING_MAX }).map((_, index) => (
                  <StarIcon
                    key={index}
                    className={cn(
                      'size-4',
                      index < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                    )}
                  />
                ))}
                <span className='text-muted-foreground ml-1 text-xs'>({review.rating}/5)</span>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='review-detail-text' className='text-muted-foreground text-xs'>
              Review
            </Label>
            <Textarea id='review-detail-text' value={review.review} readOnly rows={6} className='resize-none' />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ReviewDetailDialog
