export const VARIABLE_SAMPLE_DATA: Record<string, string> = {
  customerName: 'Mitchell Johnson',
  customerEmail: 'mitchelljohnson@email.com',
  customerPhone: '+1 (415) 867-2394',
  companyName: 'Wanderly Travel',
  bookingReference: 'WT-76851234',
  bookingDate: '18 May 2025, 10:30 AM',
  packageName: 'Bali Escape',
  packageLocation: 'Bali, Indonesia',
  tripDuration: '5 Days / 4 Nights',
  travelStartDate: '20 Jun 2025',
  travelEndDate: '24 Jun 2025',
  travelerCount: '2 Adults, 1 Child',
  roomCount: '2 Rooms',
  packagePrice: '$72,000.00',
  taxesFees: '$6,480.00',
  discountAmount: '$3,000.00',
  totalAmount: '$75,480.00',
  paymentDate: '18 May 2025, 10:30 AM',
  bookingUrl: 'https://wanderlytravel.com/bookings/WT-76851234',
  supportPhone: '+91 11 4567 8900',
  supportEmail: 'support@wanderlytravel.com',
  currentYear: '2026',
  amount: '$75,480.00',
  paymentMethod: 'Credit Card •••• 4242',
  transactionId: 'TXN-88213456',
  receiptId: 'RCPT-55421',
  receiptUrl: 'https://wanderlytravel.com/receipts/RCPT-55421',
  refundAmount: '$68,000.00',
  refundStatus: 'Processing',
  resetLink: 'https://wanderlytravel.com/reset-password?token=abc123',
  exploreUrl: 'https://wanderlytravel.com/tour-packages'
}

const VARIABLE_PATTERN = /\{\{(\w+)\}\}/g

export const resolveVariables = (text: string, overrides: Record<string, string> = {}): string => {
  const sampleData = { ...VARIABLE_SAMPLE_DATA, ...overrides }

  return text.replace(VARIABLE_PATTERN, (match, key: string) => sampleData[key] ?? match)
}
