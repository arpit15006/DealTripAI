// Type Imports
import type { Destination } from '@/types/packages/destination-types'
import { COUNTRY_NAMES } from '@/types/packages/tour-package-types'

export const db: Destination[] = Object.entries(COUNTRY_NAMES).map(([key, name]) => ({
  id: `destination-${key}`,
  key,
  name
}))
