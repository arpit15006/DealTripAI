'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { CheckIcon, EllipsisVerticalIcon, EyeIcon, HourglassIcon, Trash2Icon, XIcon } from 'lucide-react'
import { toast } from 'sonner'

// Type Imports
import type { Review } from '@/types/settings/reviews-types'

// Component Imports
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import ReviewDetailDialog from '@/views/apps/settings/reviews-ratings/review-detail-dialog'

// Store Imports
import { useReviewsStore } from '@/store/use-reviews-store'

type ReviewRowActionsProps = {
  review: Review
}

const ReviewRowActions = ({ review }: ReviewRowActionsProps) => {
  const setReviewStatus = useReviewsStore(state => state.setReviewStatus)
  const deleteReview = useReviewsStore(state => state.deleteReview)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const handleDelete = () => {
    deleteReview(review.id)
    setDeleteDialogOpen(false)
    toast.success(`Review by ${review.userName} deleted`)
  }

  const handleSetStatus = (status: Review['status']) => {
    setReviewStatus(review.id, status)
    toast.success(`Review marked as ${status}`)
  }

  return (
    <div className='flex items-center justify-end gap-1'>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant='ghost' size='icon' aria-label='View review' onClick={() => setViewDialogOpen(true)} />
          }
        >
          <EyeIcon className='size-4' />
        </TooltipTrigger>
        <TooltipContent>
          <p>View</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant='ghost' size='icon' aria-label='More actions' />}>
          <EllipsisVerticalIcon className='size-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-40' align='end'>
          <DropdownMenuGroup>
            <DropdownMenuItem disabled={review.status === 'published'} onClick={() => handleSetStatus('published')}>
              <CheckIcon className='mr-2 size-3.5' /> Publish
            </DropdownMenuItem>
            <DropdownMenuItem disabled={review.status === 'pending'} onClick={() => handleSetStatus('pending')}>
              <HourglassIcon className='mr-2 size-3.5' /> Mark Pending
            </DropdownMenuItem>
            <DropdownMenuItem disabled={review.status === 'rejected'} onClick={() => handleSetStatus('rejected')}>
              <XIcon className='mr-2 size-3.5' /> Reject
            </DropdownMenuItem>
            <DropdownMenuItem variant='destructive' onClick={() => setDeleteDialogOpen(true)}>
              <Trash2Icon className='mr-2 size-3.5' /> Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the review from &ldquo;{review.userName}&rdquo;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReviewDetailDialog review={review} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
    </div>
  )
}

export default ReviewRowActions
