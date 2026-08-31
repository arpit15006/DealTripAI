'use client'

// Component Imports
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BoardView from '@/views/apps/coupons-promotions/board-view'
import { columns } from '@/views/apps/coupons-promotions/columns'
import CouponCreateSheet from '@/views/apps/coupons-promotions/coupon-create-sheet'
import CouponStats from '@/views/apps/coupons-promotions/coupon-stats'
import { CouponsDataTable } from '@/views/apps/coupons-promotions/data-table'

// Store Imports
import { useCouponsStore } from '@/store/use-coupons-store'

const CouponsPromotionsView = () => {
  const items = useCouponsStore(state => state.items)

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Coupons &amp; Promotions</h1>
        <p className='text-muted-foreground text-sm'>Create and manage discount coupons across the platform.</p>
      </div>

      <CouponStats items={items} />

      <Tabs defaultValue='table'>
        <div className='flex items-center justify-between gap-3'>
          <TabsList>
            <TabsTrigger value='table'>Table View</TabsTrigger>
            <TabsTrigger value='card'>Card View</TabsTrigger>
          </TabsList>

          <CouponCreateSheet />
        </div>

        <TabsContent value='table' className='mt-4'>
          <Card className='w-full gap-0 py-0'>
            <CouponsDataTable columns={columns} data={items} />
          </Card>
        </TabsContent>

        <TabsContent value='card' className='mt-4'>
          <BoardView items={items} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CouponsPromotionsView
