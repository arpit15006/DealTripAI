'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { CopyIcon, EllipsisVerticalIcon, PencilIcon, PowerIcon, PowerOffIcon, Trash2Icon } from 'lucide-react'
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

// Store Imports
import { useCouponsStore } from '@/store/use-coupons-store'

type CouponCardMenuProps = {
  coupon: Coupon
  onEdit: () => void
}

const CouponCardMenu = ({ coupon, onEdit }: CouponCardMenuProps) => {
  const toggleCouponStatus = useCouponsStore(state => state.toggleCouponStatus)
  const duplicateCoupon = useCouponsStore(state => state.duplicateCoupon)
  const deleteCoupon = useCouponsStore(state => state.deleteCoupon)

  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleToggleStatus = () => {
    toggleCouponStatus(coupon.id)
    toast.success(coupon.isActive ? `${coupon.code} deactivated` : `${coupon.code} activated`)
  }

  const handleDuplicate = () => {
    duplicateCoupon(coupon.id)
    toast.success(`${coupon.code} duplicated`)
  }

  const handleDelete = () => {
    deleteCoupon(coupon.id)
    setDeleteOpen(false)
    toast.success(`${coupon.code} deleted`)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant='secondary'
              size='icon-sm'
              aria-label='More actions'
              className='absolute top-3 right-3 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-open:opacity-100'
            />
          }
        >
          <EllipsisVerticalIcon className='size-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onEdit}>
              <PencilIcon className='mr-2 size-3.5' /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleStatus}>
              {coupon.isActive ? <PowerOffIcon className='mr-2 size-3.5' /> : <PowerIcon className='mr-2 size-3.5' />}
              {coupon.isActive ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}>
              <CopyIcon className='mr-2 size-3.5' /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant='destructive' onClick={() => setDeleteOpen(true)}>
              <Trash2Icon className='mr-2 size-3.5' /> Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
    </>
  )
}

export default CouponCardMenu
