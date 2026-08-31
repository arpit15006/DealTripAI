// Type Imports
import type { SavedPaymentMethod } from '@/types/packages/checkout-types'

export const db: SavedPaymentMethod[] = [
  {
    id: 'visa',
    name: 'Visa ending in 7658',
    expiry: '10/24',
    logo: '/images/brands/visa.webp',
    alt: 'Visa'
  },
  {
    id: 'mastercard',
    name: 'Mastercard ending in 8489',
    expiry: '10/24',
    logo: '/images/brands/mastercard.webp',
    alt: 'Mastercard'
  },
  {
    id: 'paypal',
    name: 'Paypal ending in 8489',
    expiry: '10/24',
    logo: '/images/brands/paypal-icon.webp',
    alt: 'PayPal'
  },
  {
    id: 'amazon',
    name: 'Amazon Pay ending in 8489',
    expiry: '10/26',
    logo: '/images/brands/amazon-pay.webp',
    alt: 'Amazon Pay'
  }
]
