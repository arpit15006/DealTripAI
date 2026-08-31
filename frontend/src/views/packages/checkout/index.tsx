'use client'

// React Imports
import { useEffect, useMemo } from 'react'

// Next Imports
import { notFound } from 'next/navigation'

// Type Imports
import type { PackageDetail } from '@/types/packages/package-detail-types'
import type { BookingContactInfo, PaymentResult, TravelerInfo } from '@/types/packages/checkout-types'

// Component Imports
import CheckoutStepper from './checkout-stepper'
import ConfirmationStep from './confirmation-step'
import EnterInfoStep from './enter-info-step'
import OrderSummaryCard from './order-summary-card'
import PaymentStep from './payment-step'

// Store Imports
import { useBookingDraftStore } from '@/store/use-booking-draft-store'
import { useBookingsStore } from '@/store/use-bookings-store'
import { useCheckoutStore } from '@/store/use-checkout-store'
import { useCouponStore } from '@/store/use-coupon-store'
import { useCouponsStore } from '@/store/use-coupons-store'
import { useProfileStore } from '@/store/use-profile-store'
import { useTourPackagesStore } from '@/store/use-tour-packages-store'
import { useTransactionsStore } from '@/store/use-transactions-store'

// Utils Imports
import { DEFAULT_CONTACT_AVATAR } from '@/utils/booking-utils'
import { buildPackageDetail } from '@/utils/build-package-detail'

type CheckoutViewProps = {
  slug: string
  initialPackageDetail: PackageDetail | null
  travelers: number
  travelDate: string
}

const CheckoutView = ({ slug, initialPackageDetail, travelers, travelDate }: CheckoutViewProps) => {
  const tourPackage = useTourPackagesStore(state =>
    state.items.find(item => item.slug === slug && item.isPublished !== false)
  )

  const packageDetail = useMemo(
    () => (tourPackage ? buildPackageDetail(tourPackage) : initialPackageDetail),
    [tourPackage, initialPackageDetail]
  )

  const step = useCheckoutStore(state => state.step)
  const contactInfo = useCheckoutStore(state => state.contactInfo)
  const travelersInfo = useCheckoutStore(state => state.travelersInfo)
  const promoDiscount = useCheckoutStore(state => state.promoDiscount)
  const bookingRef = useCheckoutStore(state => state.bookingRef)
  const paymentResult = useCheckoutStore(state => state.paymentResult)
  const bookedAt = useCheckoutStore(state => state.bookedAt)
  const initializeForPackage = useCheckoutStore(state => state.initializeForPackage)
  const setPromoDiscount = useCheckoutStore(state => state.setPromoDiscount)
  const completeInfoStep = useCheckoutStore(state => state.completeInfoStep)
  const completePaymentStep = useCheckoutStore(state => state.completePaymentStep)
  const addBooking = useBookingsStore(state => state.addBooking)
  const appliedCouponCode = useCouponStore(state => state.appliedCouponCode)
  const specialRequests = useBookingDraftStore(state => state.specialRequests)
  const profileAvatar = useProfileStore(state => state.user.avatar)

  useEffect(() => {
    if (packageDetail) initializeForPackage(packageDetail.slug)
  }, [packageDetail, initializeForPackage])

  if (!packageDetail) {
    notFound()
  }

  const baseTotal = packageDetail.price * travelers
  const finalTotal = baseTotal - promoDiscount

  const handleInfoComplete = (info: BookingContactInfo, travelersInfo: TravelerInfo[], discount: number) => {
    completeInfoStep(info, travelersInfo, discount)
  }

  const handlePaymentComplete = (result: PaymentResult) => {
    const ts = Date.now().toString(36).toUpperCase().slice(-6)
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase()
    const bookingRef = `TRV-${ts}-${rnd}`
    const bookedAtIso = new Date().toISOString()

    completePaymentStep(bookingRef, result, bookedAtIso)

    const bookingInput = {
      packageSlug: packageDetail.slug,
      packageTitle: packageDetail.title,
      packageImage: packageDetail.images[0],
      packageLocation: packageDetail.location,
      packageDays: packageDetail.days,
      packageNights: packageDetail.nights,
      travelers,
      travelDate,
      bookingRef,
      totalAmount: finalTotal,
      paymentResult: result,
      bookedAt: bookedAtIso,
      contactName: contactInfo ? `${contactInfo.firstName} ${contactInfo.lastName}` : '',
      contactEmail: contactInfo?.email ?? '',
      contactPhone: contactInfo?.phone,
      contactAvatar: profileAvatar || DEFAULT_CONTACT_AVATAR,
      travelersInfo: travelersInfo ?? undefined,
      baseAmount: baseTotal,
      discountAmount: promoDiscount > 0 ? promoDiscount : undefined,
      couponCode: promoDiscount > 0 ? (appliedCouponCode ?? undefined) : undefined,
      notes: specialRequests.trim() || undefined
    }

    const newBookingId = addBooking(bookingInput)

    useTransactionsStore.getState().addChargeFromBooking({ ...bookingInput, id: newBookingId, status: 'upcoming' })

    if (bookingInput.couponCode) {
      useCouponsStore.getState().incrementUsageByCode(bookingInput.couponCode)
    }
  }

  return (
    <div className='mx-auto w-full max-w-360 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16'>
      {step !== 'confirmation' && <CheckoutStepper currentStep={step} />}

      <div className={`mt-8 grid grid-cols-1 gap-6 ${step !== 'confirmation' ? 'lg:grid-cols-3' : ''}`}>
        {step === 'confirmation' && contactInfo && bookingRef && paymentResult && bookedAt ? (
          <ConfirmationStep
            packageDetail={packageDetail}
            travelers={travelers}
            travelDate={travelDate}
            contactInfo={contactInfo}
            finalTotal={finalTotal}
            bookingRef={bookingRef}
            paymentResult={paymentResult}
            bookedAt={new Date(bookedAt)}
          />
        ) : (
          <>
            <div className='flex flex-col gap-5 lg:col-span-2'>
              {step === 'enter-info' && (
                <EnterInfoStep
                  packageDetail={packageDetail}
                  travelers={travelers}
                  travelDate={travelDate}
                  onPromoChange={setPromoDiscount}
                  onComplete={handleInfoComplete}
                />
              )}
              {step === 'payment' && (
                <PaymentStep
                  finalTotal={finalTotal}
                  baseTotal={baseTotal}
                  promoDiscount={promoDiscount}
                  onComplete={handlePaymentComplete}
                />
              )}
            </div>

            <div className='lg:col-span-1'>
              <OrderSummaryCard
                packageDetail={packageDetail}
                travelers={travelers}
                travelDate={travelDate}
                promoDiscount={promoDiscount}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CheckoutView
