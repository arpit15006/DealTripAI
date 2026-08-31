'use client'

// React Imports
import { useMemo, useState } from 'react'

// Third-party Imports
import { TicketPercentIcon } from 'lucide-react'

// Type Imports
import type { Coupon, CouponAppliesTo } from '@/types/apps/coupon-types'
import { COUPON_APPLIES_TO_LABELS, COUPON_APPLIES_TO_LIST } from '@/types/apps/coupon-types'

// Component Imports
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import CouponBoardCard from '@/views/apps/coupons-promotions/coupon-board-card'

// Utils Imports
import type { CouponBoardSortValue } from '@/utils/board-constants'
import { COUPON_BOARD_ICONS, COUPON_BOARD_SORT_OPTIONS } from '@/utils/board-constants'

type CouponBoardViewProps = {
  items: Coupon[]
}

const CouponBoardView = ({ items }: CouponBoardViewProps) => {
  const [appliesToFilter, setAppliesToFilter] = useState<CouponAppliesTo>('all')
  const [sort, setSort] = useState<CouponBoardSortValue>('newest')

  const filteredItems = useMemo(() => {
    const filtered = appliesToFilter === 'all' ? items : items.filter(item => item.appliesTo === appliesToFilter)

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return a.createdAt.localeCompare(b.createdAt)
        case 'discount':
          return b.discountValue - a.discountValue
        case 'ending-soon':
          return a.validUntil.localeCompare(b.validUntil)
        default:
          return b.createdAt.localeCompare(a.createdAt)
      }
    })
  }, [items, appliesToFilter, sort])

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <ToggleGroup
          variant='outline'
          value={[appliesToFilter]}
          onValueChange={value => value[0] && setAppliesToFilter(value[0] as CouponAppliesTo)}
          className='flex-wrap'
        >
          {COUPON_APPLIES_TO_LIST.map(option => {
            const Icon = COUPON_BOARD_ICONS[option]

            return (
              <ToggleGroupItem
                key={option}
                value={option}
                aria-label={COUPON_APPLIES_TO_LABELS[option]}
                className='gap-1.5 rounded-full px-4'
              >
                <Icon className='size-4' />
                {COUPON_APPLIES_TO_LABELS[option]}
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>

        <Select
          items={COUPON_BOARD_SORT_OPTIONS}
          value={sort}
          onValueChange={value => value && setSort(value as CouponBoardSortValue)}
        >
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {COUPON_BOARD_SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {filteredItems.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <TicketPercentIcon />
            </EmptyMedia>
            <EmptyTitle>No coupons in this category</EmptyTitle>
            <EmptyDescription>Try a different category or check back after creating one.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4'>
          {filteredItems.map(item => (
            <CouponBoardCard key={item.id} coupon={item} />
          ))}
        </div>
      )}
    </div>
  )
}

export default CouponBoardView
