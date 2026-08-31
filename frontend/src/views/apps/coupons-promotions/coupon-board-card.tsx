'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { format } from 'date-fns'
import { CalendarIcon, CopyIcon, StarIcon } from 'lucide-react'
import { toast } from 'sonner'

// Type Imports
import type { Coupon } from '@/types/apps/coupon-types'
import { COUPON_STATUS_STYLES } from '@/types/apps/coupon-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import CouponCardMenu from '@/views/apps/coupons-promotions/coupon-card-menu'
import CouponEditSheet from '@/views/apps/coupons-promotions/coupon-edit-sheet'

// Store Imports
import { MAX_FEATURED_COUPONS, useCouponsStore } from '@/store/use-coupons-store'

// Utils Imports
import { cn } from '@/lib/utils'
import { formatCouponDiscount, getCouponBannerImage, getCouponStatus } from '@/utils/coupon-utils'

type CouponBoardCardProps = {
  coupon: Coupon
}

const CouponBoardCard = ({ coupon }: CouponBoardCardProps) => {
  const toggleFeatured = useCouponsStore(state => state.toggleFeatured)

  const [editOpen, setEditOpen] = useState(false)

  const status = getCouponStatus(coupon)
  const statusStyle = COUPON_STATUS_STYLES[status]

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code)
    toast.success(`Coupon code "${coupon.code}" copied!`)
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

  return (
    <Card className='group relative gap-0 overflow-hidden py-0'>
      <img src={getCouponBannerImage(coupon)} alt={coupon.title} className='h-36 w-full object-cover' />

      <Badge
        variant='secondary'
        className='absolute top-3 left-3 gap-1.5 bg-white/90 text-neutral-900 shadow-sm backdrop-blur dark:bg-neutral-900/80 dark:text-neutral-100'
      >
        <span className={cn('size-1.5 rounded-full', statusStyle.dot)} />
        <span className='capitalize'>{status}</span>
      </Badge>

      <CouponCardMenu coupon={coupon} onEdit={() => setEditOpen(true)} />

      <div className='flex flex-1'>
        <CardContent className='flex flex-1 flex-col gap-3 py-4'>
          <div>
            <h3 className='text-primary text-lg font-semibold text-balance'>{coupon.title}</h3>
            <p className='text-muted-foreground mt-1 text-xs font-medium tracking-wide uppercase'>Up to</p>
            <p className='text-primary text-3xl font-bold'>
              {formatCouponDiscount(coupon)} <span className='text-base font-semibold'>OFF</span>
            </p>
          </div>

          {coupon.description && <p className='text-muted-foreground line-clamp-3 text-sm'>{coupon.description}</p>}

          <div className='text-muted-foreground mt-auto flex items-center gap-1.5 text-xs'>
            <CalendarIcon className='size-3.5' />
            Valid till {format(new Date(coupon.validUntil), 'dd MMM yyyy')}
          </div>
        </CardContent>

        <div className='border-primary/40 flex w-9 shrink-0 items-center justify-center border-l border-dashed'>
          <span
            className='text-primary rotate-180 text-xs font-semibold tracking-widest'
            style={{ writingMode: 'vertical-rl' }}
          >
            {coupon.code}
          </span>
        </div>
      </div>

      <CardFooter className='bg-card grid grid-cols-2 gap-2 border-t'>
        <Button variant='outline' size='sm' onClick={() => setEditOpen(true)}>
          View Details
        </Button>
        <Button size='sm' onClick={handleCopyCode} className='gap-1.5'>
          Copy Code
          <CopyIcon className='size-3.5' />
        </Button>
        <Button variant='outline' size='sm' className='col-span-2 gap-1.5' onClick={handleToggleFeatured}>
          <StarIcon
            className={cn(
              'size-3.5',
              coupon.isFeatured && 'fill-amber-600 text-amber-600 dark:fill-amber-400 dark:text-amber-400'
            )}
          />
          {coupon.isFeatured ? 'Unfeature' : 'Feature'}
        </Button>
      </CardFooter>

      <CouponEditSheet coupon={coupon} open={editOpen} onOpenChange={setEditOpen} />
    </Card>
  )
}

export default CouponBoardCard
