/**
 * ! The data below is used to seed the Email Templates store. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can replace this with your
 * ! own database queries inside the server action.
 */

// Type Imports
import type { EmailTemplate } from '@/types/settings/email-template-types'

export const db: EmailTemplate[] = [
  {
    id: 'template-001',
    name: 'Booking Confirmation',
    event: 'booking-confirmation',
    subject: 'Your booking with {{companyName}} is confirmed!',
    sections: [
      {
        id: 'section-banner',
        type: 'banner',
        title: 'Booking Confirmed!',
        message: 'Your adventure awaits. A confirmation has been sent to {{customerEmail}}'
      },
      {
        id: 'section-hero',
        type: 'hero',
        image: '/images/countries/indonesia/indonesia-1.webp',
        badge: '{{tripDuration}}',
        title: '{{packageName}}',
        location: '{{packageLocation}}',
        description:
          'Experience the perfect blend of adventure, culture and relaxation in the beautiful island of Bali.',
        infoItems: [
          { label: 'Travel Dates', value: '{{travelStartDate}} - {{travelEndDate}}', note: '({{tripDuration}})' },
          { label: 'Travelers', value: '{{travelerCount}}', note: '({{roomCount}})' }
        ]
      },
      {
        id: 'section-details',
        type: 'detailsGrid',
        title: 'Booking Details',
        rows: [
          { label: 'Booking Reference', value: '{{bookingReference}}' },
          { label: 'Booking Date', value: '{{bookingDate}}' },
          { label: 'Package', value: '{{packageName}} ({{tripDuration}})' },
          { label: 'Travel Date', value: '{{travelStartDate}} - {{travelEndDate}}' },
          { label: 'Lead Traveler', value: '{{customerName}}' },
          { label: 'Contact', value: '{{customerPhone}}' },
          { label: 'Email', value: '{{customerEmail}}' }
        ]
      },
      {
        id: 'section-summary',
        type: 'summaryGrid',
        title: 'Payment Summary',
        rows: [
          { label: 'Package Price', value: '{{packagePrice}}' },
          { label: 'Taxes & Fees', value: '{{taxesFees}}' },
          { label: 'Discount', value: '- {{discountAmount}}', emphasis: 'discount' }
        ],
        totalLabel: 'Total Amount',
        totalValue: '{{totalAmount}}',
        statusLabel: 'PAID',
        statusNote: 'Payment completed {{paymentDate}}'
      },
      {
        id: 'section-button',
        type: 'button',
        label: 'View My Booking',
        url: '{{bookingUrl}}',
        helperText: 'You can manage your booking, view itinerary, and more.'
      }
    ],
    status: 'active',
    updatedAt: '2026-07-18'
  },
  {
    id: 'template-002',
    name: 'Payment Receipt',
    event: 'payment-receipt',
    subject: 'Payment received — Receipt {{receiptId}}',
    sections: [
      {
        id: 'section-banner',
        type: 'banner',
        title: 'Payment Received!',
        message: 'Thanks {{customerName}}, we’ve received your payment for booking {{bookingReference}}.'
      },
      {
        id: 'section-summary',
        type: 'summaryGrid',
        title: 'Payment Summary',
        rows: [
          { label: 'Payment Method', value: '{{paymentMethod}}' },
          { label: 'Transaction ID', value: '{{transactionId}}' },
          { label: 'Payment Date', value: '{{paymentDate}}' }
        ],
        totalLabel: 'Amount Paid',
        totalValue: '{{amount}}',
        statusLabel: 'PAID',
        statusNote: 'Payment completed {{paymentDate}}'
      },
      {
        id: 'section-button',
        type: 'button',
        label: 'Download Receipt',
        url: '{{receiptUrl}}',
        helperText: 'Keep this receipt for your records.'
      }
    ],
    status: 'active',
    updatedAt: '2026-07-10'
  },
  {
    id: 'template-003',
    name: 'Booking Cancelled',
    event: 'booking-cancelled',
    subject: 'Your booking {{bookingReference}} has been cancelled',
    sections: [
      {
        id: 'section-banner',
        type: 'banner',
        title: 'Booking Cancelled',
        message: 'Hi {{customerName}}, your booking for {{packageName}} has been cancelled as requested.'
      },
      {
        id: 'section-details',
        type: 'detailsGrid',
        title: 'Cancellation Details',
        rows: [
          { label: 'Booking Reference', value: '{{bookingReference}}' },
          { label: 'Package', value: '{{packageName}}' },
          { label: 'Refund Amount', value: '{{refundAmount}}' },
          { label: 'Refund Status', value: '{{refundStatus}}' }
        ]
      },
      {
        id: 'section-button',
        type: 'button',
        label: 'View Cancellation Details',
        url: '#',
        helperText: 'Eligible refunds are processed within 5-7 business days.'
      }
    ],
    status: 'active',
    updatedAt: '2026-06-22'
  },
  {
    id: 'template-004',
    name: 'Password Reset',
    event: 'password-reset',
    subject: 'Reset your {{companyName}} password',
    sections: [
      {
        id: 'section-banner',
        type: 'banner',
        title: 'Reset Your Password',
        message: 'Hi {{customerName}}, we received a request to reset your {{companyName}} account password.'
      },
      {
        id: 'section-button',
        type: 'button',
        label: 'Reset Password',
        url: '{{resetLink}}',
        helperText: 'This link expires in 30 minutes. If you didn’t request this, you can ignore this email.'
      }
    ],
    status: 'active',
    updatedAt: '2026-05-30'
  },
  {
    id: 'template-005',
    name: 'Welcome Email',
    event: 'welcome',
    subject: 'Welcome to {{companyName}}, {{customerName}}!',
    sections: [
      {
        id: 'section-banner',
        type: 'banner',
        title: 'Welcome Aboard!',
        message:
          'Hi {{customerName}}, welcome to {{companyName}}. Explore handpicked tour packages and start planning your next trip.'
      },
      {
        id: 'section-button',
        type: 'button',
        label: 'Explore Tour Packages',
        url: '{{exploreUrl}}',
        helperText: 'Handpicked destinations, curated just for you.'
      }
    ],
    status: 'inactive',
    updatedAt: '2026-04-14'
  }
]
