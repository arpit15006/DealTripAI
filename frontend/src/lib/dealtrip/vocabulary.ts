/**
 * The shared vocabulary, free of any runtime dependency.
 *
 * These constants are needed on both sides of the wire, the guard and the
 * scorer read them on the server, and every screen renders their labels in the
 * browser. They live apart from `types.ts` so that importing a label into a
 * client component does not also pull Zod and every schema into the bundle.
 */
export const ATTRIBUTES = [
  'beachfront',
  'sea_view',
  'pool',
  'breakfast',
  'all_meals',
  'airport_transfer',
  'private_transfer',
  'spa',
  'gym',
  'wifi',
  'air_conditioning',
  'balcony',
  'romantic',
  'family_friendly',
  'pet_friendly',
  'quiet',
  'city_center',
  'nightlife_nearby',
  'water_sports',
  'late_checkout',
  'early_checkin',
  'free_cancellation',
  'kitchenette',
  'workspace'
] as const

export type Attribute = (typeof ATTRIBUTES)[number]

/** Human labels, used in UI and in prompts so the model sees real words. */
export const ATTRIBUTE_LABELS: Record<Attribute, string> = {
  beachfront: 'Beachfront',
  sea_view: 'Sea view',
  pool: 'Pool',
  breakfast: 'Breakfast included',
  all_meals: 'All meals included',
  airport_transfer: 'Airport transfer',
  private_transfer: 'Private transfer',
  spa: 'Spa access',
  gym: 'Gym',
  wifi: 'Wi-Fi',
  air_conditioning: 'Air conditioning',
  balcony: 'Balcony',
  romantic: 'Romantic / couples',
  family_friendly: 'Family friendly',
  pet_friendly: 'Pet friendly',
  quiet: 'Quiet location',
  city_center: 'City centre',
  nightlife_nearby: 'Nightlife nearby',
  water_sports: 'Water sports',
  late_checkout: 'Late checkout',
  early_checkin: 'Early check-in',
  free_cancellation: 'Free cancellation',
  kitchenette: 'Kitchenette',
  workspace: 'Workspace'
} as const

export const ACTORS = ['user', 'orchestrator', 'merchant_agent', 'commerce_guard', 'razorpay', 'system'] as const

export type Actor = (typeof ACTORS)[number]

/** How each participant is named in the Trust Timeline. */
export const ACTOR_LABELS: Record<Actor, string> = {
  user: 'Traveller',
  orchestrator: 'Deal Orchestrator',
  merchant_agent: 'Merchant agent',
  commerce_guard: 'Commerce Guard',
  razorpay: 'Razorpay',
  system: 'System'
}
