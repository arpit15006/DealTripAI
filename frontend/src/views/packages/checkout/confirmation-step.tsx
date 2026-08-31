'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { format } from 'date-fns'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import {
  BadgeCheckIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  CreditCardIcon,
  DownloadIcon,
  HomeIcon,
  InfoIcon,
  MapPinIcon,
  MessageCircleQuestionIcon,
  SmartphoneIcon,
  UsersIcon
} from 'lucide-react'

// Type Imports
import type { PackageDetail } from '@/types/packages/package-detail-types'
import type { BookingContactInfo, PaymentResult } from '@/types/packages/checkout-types'

// Component Imports
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Rating } from '@/components/ui/rating'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import AddToCalendarPopover from '@/views/packages/checkout/add-to-calendar-popover'
import BookingConfetti from '@/views/packages/checkout/booking-confetti'
import ConfirmationPrintView from '@/views/packages/checkout/confirmation-print-view'
import PackageTypeBadge from '@/views/packages/checkout/package-type-badge'

// Hook Imports
import { useMounted } from '@/hooks/use-mounted'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type ConfirmationStepProps = {
  packageDetail: PackageDetail
  travelers: number
  travelDate: string
  contactInfo: BookingContactInfo
  finalTotal: number
  bookingRef: string
  paymentResult: PaymentResult
  bookedAt: Date
}

const ConfirmationStep = ({
  packageDetail,
  travelers,
  travelDate,
  contactInfo,
  finalTotal,
  bookingRef,
  paymentResult,
  bookedAt
}: ConfirmationStepProps) => {
  const mounted = useMounted()

  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const travelDateObj = (() => {
    const parsed = new Date(travelDate)

    return Number.isNaN(parsed.getTime()) ? new Date() : parsed
  })()

  const formattedTravelDate = format(travelDateObj, 'dd MMMM yyyy')
  const formattedBookedAt = format(bookedAt, 'dd MMMM yyyy, hh:mm a')

  const handleDownloadReceipt = () => {
    window.print()
  }

  const handleSubmitFeedback = () => {
    toast.success('Thanks for your feedback!')
    setFeedbackRating(0)
    setFeedbackMessage('')
  }

  return (
    <div className='flex flex-col gap-6'>
      <BookingConfetti />

      {/* Success Banner */}
      <Card className='overflow-hidden shadow-none'>
        <CardContent className='flex gap-4'>
          <Avatar className='size-15 after:border-green-600/50 dark:after:border-green-400/50'>
            <AvatarFallback className='bg-green-600/10 text-green-600 dark:text-green-400'>
              <CheckCircle2Icon className='size-9' strokeWidth={1.5} />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className='text-2xl font-bold tracking-tight text-green-600 dark:text-green-400'>Booking Confirmed!</h2>
            <p className='text-muted-foreground mt-2 text-sm'>
              Your adventure awaits. A confirmation has been sent to{' '}
              <span className='text-foreground font-semibold'>{contactInfo.email}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start'>
        {/* Left Column */}
        <div className='flex flex-col gap-6 lg:col-span-2'>
          {/* Package Details */}
          <Card>
            <CardContent className='flex flex-col gap-4'>
              <div className='flex items-start gap-4'>
                <div className='size-20 shrink-0 overflow-hidden rounded-xl'>
                  <img src={packageDetail.images[0]} alt={packageDetail.title} className='size-full object-cover' />
                </div>
                <div className='min-w-0'>
                  <p className='leading-snug font-semibold'>{packageDetail.title}</p>
                  <div className='text-muted-foreground mt-1 flex items-center gap-1 text-sm'>
                    <MapPinIcon className='size-3.5 shrink-0' />
                    {packageDetail.location}
                  </div>
                  <div className='mt-2 flex flex-wrap gap-1.5'>
                    <PackageTypeBadge packageType={packageDetail.packageType} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className='grid grid-cols-2 gap-4 text-sm sm:grid-cols-3'>
                <div className='flex flex-col gap-1'>
                  <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                    <CalendarIcon className='size-3.5' />
                    Travel Date
                  </div>
                  <p className='font-semibold'>{formattedTravelDate}</p>
                </div>
                <div className='flex flex-col gap-1'>
                  <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                    <ClockIcon className='size-3.5' />
                    Duration
                  </div>
                  <p className='font-semibold'>
                    {packageDetail.days}D / {packageDetail.nights}N
                  </p>
                </div>
                <div className='flex flex-col gap-1'>
                  <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                    <UsersIcon className='size-3.5' />
                    Travelers
                  </div>
                  <p className='font-semibold'>
                    {travelers} {travelers === 1 ? 'person' : 'people'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Amount Paid</span>
                <span className='font-semibold'>${finalTotal.toLocaleString()}</span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground flex items-center gap-1.5'>
                  {paymentResult.method === 'card' ? (
                    <CreditCardIcon className='size-3.5' />
                  ) : (
                    <SmartphoneIcon className='size-3.5' />
                  )}
                  Paid via
                </span>
                <span className='font-semibold'>
                  {paymentResult.method === 'card' ? `Card •••• ${paymentResult.cardLast4}` : 'UPI'}
                </span>
              </div>

              {packageDetail.cancellationPolicy[0] && (
                <div className='bg-primary/10 text-primary flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm'>
                  <BadgeCheckIcon className='mt-0.5 size-4 shrink-0' />
                  {packageDetail.cancellationPolicy[0]}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Important Travel Instructions */}
          {packageDetail.importantInfo.length > 0 && (
            <Card className='shadow-none'>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-base font-semibold'>
                  <InfoIcon className='size-4' />
                  Important Travel Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col gap-4'>
                {packageDetail.importantInfo.map(section => (
                  <div key={section.title} className='flex flex-col gap-1.5'>
                    <p className='text-sm font-semibold'>{section.title}</p>
                    <ul className='ml-4 flex list-disc flex-col gap-1 text-sm'>
                      {section.points.map(point => (
                        <li key={point} className='text-muted-foreground'>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className='flex flex-col gap-6 lg:sticky lg:top-35 lg:col-span-1'>
          <Card className='bg-muted/60 shadow-none'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base font-semibold'>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Booking ID</span>
                <span className='font-mono font-semibold'>{bookingRef}</span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Booked on</span>
                <span className='font-medium'>{formattedBookedAt}</span>
              </div>

              <Separator />

              <div className='flex flex-col gap-3'>
                <Button size='lg' className='w-full' onClick={handleDownloadReceipt}>
                  <DownloadIcon className='size-4' />
                  Download Receipt
                </Button>
                <AddToCalendarPopover travelDate={travelDateObj} destination={packageDetail.location} />
                <Link href='/tour-packages' className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                  <HomeIcon className='size-4' />
                  Keep Exploring
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Have Questions */}
          <Card className='shadow-none'>
            <CardContent className='flex items-start gap-3'>
              <div className='bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full'>
                <MessageCircleQuestionIcon className='size-5' />
              </div>
              <div>
                <p className='font-semibold'>Have Questions?</p>
                <p className='text-muted-foreground text-sm'>
                  Our friendly customer support team is your extended family.
                </p>
                <Link href='/about-us' className='text-primary mt-1 inline-block text-sm font-medium underline'>
                  Contact Us
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card className='shadow-none'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base font-semibold'>How was your experience?</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              <Rating value={feedbackRating} onValueChange={setFeedbackRating} variant='yellow' size={22} />
              <Textarea
                placeholder='Share your feedback!'
                value={feedbackMessage}
                onChange={e => setFeedbackMessage(e.target.value)}
              />
              <Button
                variant='outline'
                className='w-full'
                disabled={feedbackRating === 0}
                onClick={handleSubmitFeedback}
              >
                Submit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {mounted &&
        createPortal(
          <>
            <style>{`
              @media print {
                body > *:not(#confirmation-print-content) {
                  display: none !important;
                }
                #confirmation-print-content {
                  display: block !important;
                  padding: 1rem;
                }
              }
            `}</style>
            <div id='confirmation-print-content' className='hidden print:block'>
              <ConfirmationPrintView
                packageTitle={packageDetail.title}
                packageLocation={packageDetail.location}
                packageDays={packageDetail.days}
                packageNights={packageDetail.nights}
                travelers={travelers}
                formattedTravelDate={formattedTravelDate}
                formattedBookedAt={formattedBookedAt}
                contactName={`${contactInfo.firstName} ${contactInfo.lastName}`}
                contactEmail={contactInfo.email}
                finalTotal={finalTotal}
                bookingRef={bookingRef}
                paymentResult={paymentResult}
              />
            </div>
          </>,
          document.body
        )}
    </div>
  )
}

export default ConfirmationStep
