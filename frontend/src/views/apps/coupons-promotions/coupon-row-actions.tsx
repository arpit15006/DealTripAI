'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { CopyIcon, EllipsisVerticalIcon, PencilIcon, PowerIcon, PowerOffIcon, StarIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

// Type Imports
import type { Coupon } from '@/types/apps/coupon-types'

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
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import CouponEditSheet from '@/views/apps/coupons-promotions/coupon-edit-sheet'

// Store Imports
import { MAX_FEATURED_COUPONS, useCouponsStore } from '@/store/use-coupons-store'

// Utils Imports
import { cn } from '@/lib/utils'

type CouponRowActionsProps = {
  coupon: Coupon
}

const CouponRowActions = ({ coupon }: CouponRowActionsProps) => {
  const toggleCouponStatus = useCouponsStore(state => state.toggleCouponStatus)
  const toggleFeatured = useCouponsStore(state => state.toggleFeatured)
  const duplicateCoupon = useCouponsStore(state => state.duplicateCoupon)
  const deleteCoupon = useCouponsStore(state => state.deleteCoupon)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleToggleStatus = () => {
    toggleCouponStatus(coupon.id)
    toast.success(coupon.isActive ? `${coupon.code} deactivated` : `${coupon.code} activated`)
  }

  const handleToggleFeatured = () => {
    const result = toggleFeatured(coupon.id)

    if (result === 'limit-reached') {
      toast.error(`Only ${MAX_FEATURED_COUPONS} coupons can be featured on the landing page. Remove one first.`)

      return
    }

    if (result === 'not-active') {
      toast.error('Only active coupons can be featured on the landing page.')

      return
    }

    toast.success(
      result === 'featured'
        ? `${coupon.code} featured on the landing page`
        : `${coupon.code} removed from the landing page`
    )
  }

  const handleDuplicate = () => {
    duplicateCoupon(coupon.id)
    toast.success(`${coupon.code} duplicated`)
  }

  const handleDelete = () => {
    deleteCoupon(coupon.id)
    setDeleteDialogOpen(false)
    toast.success(`${coupon.code} deleted`)
  }

  return (
    <div className='flex items-center justify-end gap-1'>
      <Tooltip>
        <TooltipTrigger
          render={<Button variant='ghost' size='icon' aria-label='Edit coupon' onClick={() => setEditOpen(true)} />}
        >
          <PencilIcon className='size-4' />
        </TooltipTrigger>
        <TooltipContent>
          <p>Edit</p>
        </TooltipContent>
      </Tooltip>

      <CouponEditSheet coupon={coupon} open={editOpen} onOpenChange={setEditOpen} />

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant='ghost' size='icon' aria-label='More actions' />}>
          <EllipsisVerticalIcon className='size-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleToggleStatus}>
              {coupon.isActive ? <PowerOffIcon className='mr-2 size-3.5' /> : <PowerIcon className='mr-2 size-3.5' />}
              {coupon.isActive ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleFeatured}>
              <StarIcon
                className={cn(
                  'mr-2 size-3.5',
                  coupon.isFeatured && 'fill-amber-600 text-amber-600 dark:fill-amber-400 dark:text-amber-400'
                )}
              />
              {coupon.isFeatured ? 'Unfeature' : 'Feature'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}>
              <CopyIcon className='mr-2 size-3.5' /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant='destructive' onClick={() => setDeleteDialogOpen(true)}>
              <Trash2Icon className='mr-2 size-3.5' /> Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &ldquo;{coupon.code}&rdquo; from the coupons list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default CouponRowActions
