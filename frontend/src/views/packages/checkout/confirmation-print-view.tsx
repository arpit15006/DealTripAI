// Type Imports
import type { PaymentResult } from '@/types/packages/checkout-types'

// Component Imports
import { Separator } from '@/components/ui/separator'
import LogoSvg from '@/assets/svg/logo'
import themeConfig from '@/configs/themeConfig'

type ConfirmationPrintViewProps = {
  packageTitle: string
  packageLocation: string
  packageDays: number
  packageNights: number
  travelers: number
  formattedTravelDate: string
  formattedBookedAt: string
  contactName: string
  contactEmail: string
  finalTotal: number
  bookingRef: string
  paymentResult: PaymentResult
}

type ReceiptRowProps = {
  label: string
  value: string
}

const ReceiptRow = ({ label, value }: ReceiptRowProps) => (
  <div className='flex items-baseline justify-between gap-6 text-sm'>
    <span className='text-muted-foreground'>{label}</span>
    <span className='text-right font-medium'>{value}</span>
  </div>
)

const ConfirmationPrintView = ({
  packageTitle,
  packageLocation,
  packageDays,
  packageNights,
  travelers,
  formattedTravelDate,
  formattedBookedAt,
  contactName,
  contactEmail,
  finalTotal,
  bookingRef,
  paymentResult
}: ConfirmationPrintViewProps) => {
  const paidVia = paymentResult.method === 'card' ? `Card •••• ${paymentResult.cardLast4}` : 'UPI'

  return (
    <div className='mx-auto flex w-full max-w-xl flex-col gap-6'>
      <div className='flex items-start justify-between text-xs'>
        <span className='text-muted-foreground'>{formattedBookedAt.split(',')[0]}</span>
        <span className='text-muted-foreground'>This is your receipt</span>
      </div>

      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-2'>
          <LogoSvg className='[&_rect]:fill-primary size-8 [&_line]:stroke-white [&_path]:stroke-white' />
          <span className='text-lg font-bold'>{themeConfig.templateName}</span>
        </div>
        <div className='text-right'>
          <p className='text-muted-foreground text-xs'>Booking Number</p>
          <p className='font-semibold'>{bookingRef}</p>
        </div>
      </div>

      <Separator />

      <div className='flex flex-col gap-2'>
        <h3 className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Your Details</h3>
        <ReceiptRow label='Name' value={contactName} />
        <ReceiptRow label='Email address' value={contactEmail} />
        <ReceiptRow label='Date' value={formattedBookedAt} />
      </div>

      <Separator />

      <div className='flex flex-col gap-2'>
        <h3 className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Booking Details</h3>
        <ReceiptRow label='Package name' value={packageTitle} />
        <ReceiptRow label='Location' value={packageLocation} />
        <ReceiptRow label='Booking number' value={bookingRef} />
        <ReceiptRow label='Payment method' value={paidVia} />
        <ReceiptRow label='Travel date' value={formattedTravelDate} />
        <ReceiptRow label='Duration' value={`${packageDays}D / ${packageNights}N`} />
        <ReceiptRow label='Travelers' value={`${travelers}`} />
        <ReceiptRow label={`Amount paid on ${formattedBookedAt}`} value={`$${finalTotal.toLocaleString()}`} />
      </div>

      <Separator />

      <div className='text-muted-foreground flex flex-col items-center gap-1 text-center text-xs'>
        <p>Your receipt is automatically generated</p>
        <p>This is proof of your transaction with {themeConfig.templateName}.</p>
      </div>
    </div>
  )
}

export default ConfirmationPrintView
