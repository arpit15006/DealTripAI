'use client'

// React Imports
import { useEffect, useState } from 'react'

// Third-party Imports
import { format } from 'date-fns'
import { createPortal } from 'react-dom'

// Type Imports
import type { Booking } from '@/types/account/booking-types'

// Component Imports
import ConfirmationPrintView from '@/views/packages/checkout/confirmation-print-view'

// Hook Imports
import { useMounted } from '@/hooks/use-mounted'

export const useBookingReceiptPrinter = () => {
  const mounted = useMounted()
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null)

  useEffect(() => {
    if (!receiptBooking) return

    window.print()

    const clearReceipt = () => setReceiptBooking(null)

    window.addEventListener('afterprint', clearReceipt, { once: true })

    return () => window.removeEventListener('afterprint', clearReceipt)
  }, [receiptBooking])

  const receiptPortal =
    mounted && receiptBooking
      ? createPortal(
          <>
            <style>{`
              @media print {
                body > *:not(#booking-print-content) {
                  display: none !important;
                }
                #booking-print-content {
                  display: block !important;
                  padding: 1rem;
                }
              }
            `}</style>
            <div id='booking-print-content' className='hidden print:block'>
              <ConfirmationPrintView
                packageTitle={receiptBooking.packageTitle}
                packageLocation={receiptBooking.packageLocation}
                packageDays={receiptBooking.packageDays}
                packageNights={receiptBooking.packageNights}
                travelers={receiptBooking.travelers}
                formattedTravelDate={format(new Date(receiptBooking.travelDate), 'dd MMMM yyyy')}
                formattedBookedAt={format(new Date(receiptBooking.bookedAt), 'dd MMMM yyyy, hh:mm a')}
                contactName={receiptBooking.contactName}
                contactEmail={receiptBooking.contactEmail}
                finalTotal={receiptBooking.totalAmount}
                bookingRef={receiptBooking.bookingRef}
                paymentResult={receiptBooking.paymentResult}
              />
            </div>
          </>,
          document.body
        )
      : null

  return { downloadReceipt: setReceiptBooking, receiptPortal }
}
