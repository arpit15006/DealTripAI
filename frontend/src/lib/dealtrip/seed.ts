/**
 * Seed marketplace.
 *
 * Five Goa merchants plus two elsewhere. The numbers are deliberate: each
 * merchant plays a distinct structural role against the reference intent
 * ("Goa, 2 people, 3 nights, ₹60,000 hard, beachfront required, breakfast
 * preferred"), and the roles fall out of arithmetic rather than luck.
 *
 *   OceanVista   opens ~₹64,800 — over budget. Its 5% discount ceiling cannot
 *                close the gap alone, so the agent MUST restructure the bundle.
 *                This is the negotiation showcase.
 *   PalmStay     its only beachfront room cannot reach ₹60,000 with the full
 *                package at ANY legal discount (the 26% margin floor binds at
 *                ₹63,582). Its first revision is therefore blocked by the
 *                Commerce Guard as a matter of arithmetic, and it has to strip
 *                the package down to comply. This is the policy showcase.
 *   Sunset Bay   opens already compliant and already carrying breakfast.
 *   Casa Aurora  cheapest beachfront inventory, but self-catering: it has no
 *                breakfast product at all, so it forfeits the preference.
 *   Kokum Cliffs beautiful, well-rated, cliff-top — and therefore NOT
 *                beachfront. Fails the hard requirement no matter the price.
 *
 * Everything here is synthetic sample inventory for demonstration. It is not
 * real pricing from any real property.
 */
import type { Merchant } from './types'

export const SEED_MERCHANTS: Merchant[] = [
  {
    id: 'mch_oceanvista',
    slug: 'oceanvista',
    name: 'OceanVista Resort',
    destination: 'Goa',
    tagline: 'Candolim · direct beach access',
    description:
      'A 78-room beachfront resort on Candolim with three room grades, an in-house spa and a water sports desk. Runs at high occupancy on weekends and carries spare weekday inventory it would rather sell than hold.',
    rating: 4.6,
    attributes: ['beachfront', 'pool', 'wifi', 'air_conditioning', 'free_cancellation'],
    rooms: [
      {
        id: 'ov-garden',
        name: 'Garden Room',
        tier: 2,
        base_price_per_night: 11900,
        cost_per_night: 6300,
        max_occupancy: 3,
        attributes: ['quiet', 'balcony'],
        inventory_available: 6
      },
      {
        id: 'ov-standard-beach',
        name: 'Standard Beach Room',
        tier: 3,
        base_price_per_night: 15400,
        cost_per_night: 8300,
        max_occupancy: 2,
        attributes: ['sea_view', 'balcony'],
        inventory_available: 4
      },
      {
        id: 'ov-premium-beach',
        name: 'Premium Beach Room',
        tier: 4,
        base_price_per_night: 19200,
        cost_per_night: 10400,
        max_occupancy: 3,
        attributes: ['sea_view', 'balcony', 'romantic'],
        inventory_available: 2
      }
    ],
    addons: [
      { id: 'ov-breakfast', name: 'Daily breakfast', price: 900, cost: 380, per_night: true, per_person: false, attributes: ['breakfast'], group: 'meals' },
      { id: 'ov-half-board', name: 'Half board (breakfast + dinner)', price: 2400, cost: 1150, per_night: true, per_person: false, attributes: ['breakfast', 'all_meals'], group: 'meals' },
      { id: 'ov-private-transfer', name: 'Private airport transfer (return)', price: 4500, cost: 2600, per_night: false, per_person: false, attributes: ['airport_transfer', 'private_transfer'], group: 'transfer' },
      { id: 'ov-shared-transfer', name: 'Shared airport transfer (return)', price: 1600, cost: 900, per_night: false, per_person: false, attributes: ['airport_transfer'], group: 'transfer' },
      { id: 'ov-watersports', name: 'Water sports package', price: 3200, cost: 1900, per_night: false, per_person: true, attributes: ['water_sports'], group: 'activity' },
      { id: 'ov-spa', name: 'Couples spa ritual', price: 4800, cost: 2300, per_night: false, per_person: false, attributes: ['spa', 'romantic'], group: 'wellness' },
      { id: 'ov-late-checkout', name: 'Guaranteed late checkout', price: 1200, cost: 200, per_night: false, per_person: false, attributes: ['late_checkout'], group: 'flex' }
    ],
    policy: {
      max_discount_pct: 5,
      min_margin_pct: 30,
      max_counter_rounds: 2,
      allow_substitutions: true,
      substitutable_groups: ['meals', 'transfer', 'activity', 'wellness', 'flex', 'room_category'],
      locked_addons: [],
      objectives: ['maximize_revenue', 'protect_margin', 'move_unsold_inventory'],
      offer_ttl_minutes: 20
    },
    voice: 'Warm and concierge-like. Leads with the beachfront position, and would rather restructure a package than cut the headline rate.'
  },

  {
    id: 'mch_palmstay',
    slug: 'palmstay',
    name: 'PalmStay Beach Villas',
    destination: 'Goa',
    tagline: 'Morjim · private villas',
    description:
      'Six standalone villas set back from Morjim beach, plus garden cabanas. Only the villas front the sand. Housekeeping is bundled into every stay and cannot be removed.',
    rating: 4.4,
    attributes: ['wifi', 'air_conditioning', 'quiet', 'pet_friendly', 'free_cancellation'],
    rooms: [
      {
        id: 'ps-villa',
        name: 'Two-Bedroom Beach Villa',
        tier: 4,
        base_price_per_night: 21000,
        cost_per_night: 13900,
        max_occupancy: 4,
        attributes: ['beachfront', 'sea_view', 'kitchenette', 'balcony'],
        inventory_available: 2
      },
      {
        id: 'ps-cabana',
        name: 'Garden Cabana',
        tier: 2,
        base_price_per_night: 12400,
        cost_per_night: 8900,
        max_occupancy: 2,
        attributes: ['quiet', 'balcony'],
        inventory_available: 5
      }
    ],
    addons: [
      { id: 'ps-breakfast', name: 'Breakfast hamper', price: 1150, cost: 700, per_night: true, per_person: false, attributes: ['breakfast'], group: 'meals' },
      { id: 'ps-transfer', name: 'Airport pickup', price: 2400, cost: 1900, per_night: false, per_person: false, attributes: ['airport_transfer'], group: 'transfer' },
      { id: 'ps-housekeeping', name: 'Daily housekeeping', price: 600, cost: 450, per_night: true, per_person: false, attributes: [], group: null }
    ],
    policy: {
      max_discount_pct: 12,
      min_margin_pct: 26,
      max_counter_rounds: 2,
      allow_substitutions: true,
      substitutable_groups: ['meals', 'transfer', 'room_category'],
      locked_addons: ['ps-housekeeping'],
      objectives: ['protect_margin', 'maximize_occupancy'],
      offer_ttl_minutes: 20
    },
    voice: 'Plain and slightly blunt. Will say when it cannot go lower rather than dressing it up.'
  },

  {
    id: 'mch_sunsetbay',
    slug: 'sunsetbay',
    name: 'Sunset Bay Retreat',
    destination: 'Goa',
    tagline: 'Colva · family beachfront',
    description:
      'A mid-market beachfront property on Colva with a large pool and a family focus. Prices its packages to fill rooms rather than to top the rate card.',
    rating: 4.5,
    attributes: ['beachfront', 'pool', 'wifi', 'air_conditioning', 'family_friendly', 'free_cancellation'],
    rooms: [
      {
        id: 'sb-courtyard',
        name: 'Courtyard Room',
        tier: 2,
        base_price_per_night: 11200,
        cost_per_night: 6400,
        max_occupancy: 2,
        attributes: ['quiet'],
        inventory_available: 8
      },
      {
        id: 'sb-sea',
        name: 'Sea-Facing Room',
        tier: 3,
        base_price_per_night: 15600,
        cost_per_night: 8600,
        max_occupancy: 3,
        attributes: ['sea_view', 'balcony'],
        inventory_available: 5
      },
      {
        id: 'sb-suite',
        name: 'Deluxe Sea Suite',
        tier: 4,
        base_price_per_night: 19800,
        cost_per_night: 11200,
        max_occupancy: 4,
        attributes: ['sea_view', 'balcony', 'spa'],
        inventory_available: 3
      }
    ],
    addons: [
      { id: 'sb-breakfast', name: 'Buffet breakfast', price: 780, cost: 340, per_night: true, per_person: true, attributes: ['breakfast'], group: 'meals' },
      { id: 'sb-transfer', name: 'Return airport transfer', price: 3200, cost: 1700, per_night: false, per_person: false, attributes: ['airport_transfer'], group: 'transfer' },
      { id: 'sb-cruise', name: 'Sunset cruise for two', price: 3900, cost: 2100, per_night: false, per_person: false, attributes: ['romantic'], group: 'activity' },
      { id: 'sb-early', name: 'Early check-in', price: 900, cost: 150, per_night: false, per_person: false, attributes: ['early_checkin'], group: 'flex' }
    ],
    policy: {
      max_discount_pct: 10,
      min_margin_pct: 28,
      max_counter_rounds: 2,
      allow_substitutions: true,
      substitutable_groups: ['meals', 'transfer', 'activity', 'flex', 'room_category'],
      locked_addons: [],
      objectives: ['maximize_occupancy', 'maximize_revenue', 'increase_package_value'],
      offer_ttl_minutes: 20
    },
    voice: 'Friendly and practical. Quotes a fair number first rather than holding margin back for a haggle.'
  },

  {
    id: 'mch_casa_aurora',
    slug: 'casa-aurora',
    name: 'Casa Aurora',
    destination: 'Goa',
    tagline: 'Anjuna · self-catering boutique',
    description:
      'A nine-key boutique house in Anjuna. Self-catering by design — there is no kitchen service, so no breakfast product exists to sell. Cheapest beachfront inventory in the set.',
    rating: 4.3,
    attributes: ['wifi', 'air_conditioning', 'nightlife_nearby'],
    rooms: [
      {
        id: 'ca-loft',
        name: 'Artist Loft',
        tier: 2,
        base_price_per_night: 9600,
        cost_per_night: 5200,
        max_occupancy: 2,
        attributes: ['workspace', 'quiet'],
        inventory_available: 6
      },
      {
        id: 'ca-beach',
        name: 'Beach House Suite',
        tier: 3,
        base_price_per_night: 16400,
        cost_per_night: 9100,
        max_occupancy: 3,
        attributes: ['beachfront', 'sea_view', 'kitchenette'],
        inventory_available: 3
      }
    ],
    addons: [
      { id: 'ca-scooter', name: 'Scooter rental', price: 700, cost: 300, per_night: true, per_person: false, attributes: [], group: 'mobility' },
      { id: 'ca-transfer', name: 'Airport drop', price: 1900, cost: 1200, per_night: false, per_person: false, attributes: ['airport_transfer'], group: 'transfer' },
      { id: 'ca-chef', name: 'In-house chef dinner', price: 4200, cost: 2400, per_night: false, per_person: false, attributes: ['romantic'], group: 'dining' }
    ],
    policy: {
      max_discount_pct: 6,
      min_margin_pct: 22,
      max_counter_rounds: 1,
      allow_substitutions: true,
      substitutable_groups: ['mobility', 'transfer', 'dining', 'room_category'],
      locked_addons: [],
      objectives: ['maximize_occupancy', 'move_unsold_inventory'],
      offer_ttl_minutes: 20
    },
    voice: 'Understated and design-led. Honest that it does not do breakfast.'
  },

  {
    id: 'mch_kokum_cliffs',
    slug: 'kokum-cliffs',
    name: 'Kokum Cliffs',
    destination: 'Goa',
    tagline: 'Vagator · cliff-top adults-only',
    description:
      'The highest-rated property in the set and the most photogenic — perched on the Vagator cliff with an infinity pool over the water. It is not, however, on the sand.',
    rating: 4.7,
    attributes: ['pool', 'wifi', 'air_conditioning', 'spa', 'quiet', 'romantic'],
    rooms: [
      {
        id: 'kc-cliff',
        name: 'Cliff-Edge Room',
        tier: 4,
        base_price_per_night: 17800,
        cost_per_night: 9600,
        max_occupancy: 2,
        attributes: ['sea_view', 'balcony'],
        inventory_available: 4
      },
      {
        id: 'kc-suite',
        name: 'Infinity Suite',
        tier: 5,
        base_price_per_night: 24500,
        cost_per_night: 13200,
        max_occupancy: 2,
        attributes: ['sea_view', 'balcony', 'romantic'],
        inventory_available: 2
      }
    ],
    addons: [
      { id: 'kc-breakfast', name: 'Cliffside breakfast', price: 1000, cost: 420, per_night: true, per_person: false, attributes: ['breakfast'], group: 'meals' },
      { id: 'kc-transfer', name: 'Private transfer (return)', price: 3600, cost: 2000, per_night: false, per_person: false, attributes: ['airport_transfer', 'private_transfer'], group: 'transfer' },
      { id: 'kc-spa', name: 'Spa credit', price: 3500, cost: 1500, per_night: false, per_person: false, attributes: ['spa'], group: 'wellness' }
    ],
    policy: {
      max_discount_pct: 7,
      min_margin_pct: 32,
      max_counter_rounds: 2,
      allow_substitutions: true,
      substitutable_groups: ['meals', 'transfer', 'wellness', 'room_category'],
      locked_addons: [],
      objectives: ['protect_margin', 'maximize_revenue'],
      offer_ttl_minutes: 20
    },
    voice: 'Assured, a little aloof. Sells the view, never apologises for the rate.'
  },

  /* Non-Goa inventory. Present so that discovery visibly filters rather than
     appearing to filter — a judge can watch these sit out the Goa run. */
  {
    id: 'mch_alpine_rowan',
    slug: 'alpine-rowan',
    name: 'Alpine Rowan Lodge',
    destination: 'Manali',
    tagline: 'Old Manali · riverside timber lodge',
    description: 'Fourteen-room timber lodge above the Beas, with a wood-fired common room and guided trek desk.',
    rating: 4.5,
    attributes: ['wifi', 'quiet', 'family_friendly', 'free_cancellation'],
    rooms: [
      { id: 'ar-valley', name: 'Valley View Room', tier: 3, base_price_per_night: 8400, cost_per_night: 4600, max_occupancy: 3, attributes: ['balcony'], inventory_available: 7 },
      { id: 'ar-cabin', name: 'Cedar Cabin', tier: 4, base_price_per_night: 12600, cost_per_night: 6900, max_occupancy: 4, attributes: ['balcony', 'kitchenette', 'romantic'], inventory_available: 3 }
    ],
    addons: [
      { id: 'ar-breakfast', name: 'Mountain breakfast', price: 700, cost: 300, per_night: true, per_person: false, attributes: ['breakfast'], group: 'meals' },
      { id: 'ar-transfer', name: 'Kullu airport transfer', price: 4200, cost: 2700, per_night: false, per_person: false, attributes: ['airport_transfer'], group: 'transfer' }
    ],
    policy: {
      max_discount_pct: 9,
      min_margin_pct: 25,
      max_counter_rounds: 2,
      allow_substitutions: true,
      substitutable_groups: ['meals', 'transfer', 'room_category'],
      locked_addons: [],
      objectives: ['maximize_occupancy', 'move_unsold_inventory'],
      offer_ttl_minutes: 20
    },
    voice: 'Unhurried and outdoorsy.'
  },

  {
    id: 'mch_haveli_amrit',
    slug: 'haveli-amrit',
    name: 'Haveli Amrit',
    destination: 'Udaipur',
    tagline: 'Lake Pichola · restored haveli',
    description: 'A restored twelve-room haveli on the eastern ghats of Lake Pichola, with a rooftop dining terrace.',
    rating: 4.8,
    attributes: ['wifi', 'air_conditioning', 'city_center', 'romantic', 'spa'],
    rooms: [
      { id: 'ha-courtyard', name: 'Courtyard Chamber', tier: 3, base_price_per_night: 13800, cost_per_night: 7200, max_occupancy: 2, attributes: ['quiet'], inventory_available: 5 },
      { id: 'ha-lake', name: 'Lake-Facing Suite', tier: 5, base_price_per_night: 22400, cost_per_night: 11800, max_occupancy: 3, attributes: ['balcony', 'romantic'], inventory_available: 2 }
    ],
    addons: [
      { id: 'ha-breakfast', name: 'Rooftop breakfast', price: 1200, cost: 500, per_night: true, per_person: false, attributes: ['breakfast'], group: 'meals' },
      { id: 'ha-boat', name: 'Private boat hour', price: 3800, cost: 1900, per_night: false, per_person: false, attributes: ['romantic'], group: 'activity' }
    ],
    policy: {
      max_discount_pct: 6,
      min_margin_pct: 34,
      max_counter_rounds: 1,
      allow_substitutions: true,
      substitutable_groups: ['meals', 'activity', 'room_category'],
      locked_addons: [],
      objectives: ['protect_margin', 'increase_package_value'],
      offer_ttl_minutes: 20
    },
    voice: 'Formal and heritage-proud.'
  }
]

/** The request the demo opens with. */
export const DEMO_REQUEST =
  'Goa for two people, 3 nights. Budget ₹60,000 all-in — that is a hard limit. Beachfront is essential, breakfast would be nice. My dates are flexible by a couple of days.'
