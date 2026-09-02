/**
 * Seed marketplace.
 *
 * Every property charges more for Friday and Saturday nights (weekend_uplift_pct)
 * while its costs stay flat, so shifting a flexible traveller onto weekdays is a
 * real concession a merchant can make instead of discounting, and a real saving
 * a traveller can win by being flexible.
 *
 * Five Goa merchants plus two elsewhere. The numbers are deliberate: each
 * merchant plays a distinct structural role against the reference intent
 * ("Goa, 2 people, 3 nights, ₹60,000 hard, beachfront required, breakfast
 * preferred"), and the roles fall out of arithmetic rather than luck.
 *
 *   OceanVista   opens ~₹64,800. Over budget. Its 5% discount ceiling cannot
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
 *   Kokum Cliffs beautiful, well-rated, cliff-top, and therefore NOT
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
    image: '/images/countries/maldives/maldives-1.webp',
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
    weekend_uplift_pct: 28,
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
    image: '/images/countries/maldives/maldives-2.webp',
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
    weekend_uplift_pct: 22,
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
    image: '/images/countries/maldives/maldives-4.webp',
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
    weekend_uplift_pct: 20,
    voice: 'Friendly and practical. Quotes a fair number first rather than holding margin back for a haggle.'
  },

  {
    id: 'mch_casa_aurora',
    slug: 'casa-aurora',
    name: 'Casa Aurora',
    destination: 'Goa',
    tagline: 'Anjuna · self-catering boutique',
    description:
      'A nine-key boutique house in Anjuna. Self-catering by design. There is no kitchen service, so no breakfast product exists to sell. Cheapest beachfront inventory in the set.',
    rating: 4.3,
    image: '/images/countries/indonesia/indonesia-2.webp',
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
    weekend_uplift_pct: 18,
    voice: 'Understated and design-led. Honest that it does not do breakfast.'
  },

  {
    id: 'mch_kokum_cliffs',
    slug: 'kokum-cliffs',
    name: 'Kokum Cliffs',
    destination: 'Goa',
    tagline: 'Vagator · cliff-top adults-only',
    description:
      'The highest-rated property in the set and the most photogenic, perched on the Vagator cliff with an infinity pool over the water. It is not, however, on the sand.',
    rating: 4.7,
    image: '/images/countries/greece/greece-1.webp',
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
    weekend_uplift_pct: 32,
    voice: 'Assured, a little aloof. Sells the view, never apologises for the rate.'
  },

  /* Non-Goa inventory. Present so that discovery visibly filters rather than
     appearing to filter, a judge can watch these sit out the Goa run. */
  {
    id: 'mch_alpine_rowan',
    slug: 'alpine-rowan',
    name: 'Alpine Rowan Lodge',
    destination: 'Manali',
    tagline: 'Old Manali · riverside timber lodge',
    description: 'Fourteen-room timber lodge above the Beas, with a wood-fired common room and guided trek desk.',
    rating: 4.5,
    image: '/images/countries/switzerland/switzerland-1.webp',
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
    weekend_uplift_pct: 15,
    voice: 'Unhurried and outdoorsy.'
  },


  /* ══════════════════════════════════════════════════════════════════════
   * MANALI · mountains
   *
   * A different shape of demand to Goa: nobody asks for beachfront, but
   * kitchenette, quiet, workspace and pet_friendly all become decisive. The
   * five below deliberately do not overlap, so an intent that names any one
   * requirement has an obvious winner and an obvious set of near-misses.
   * ═══════════════════════════════════════════════════════════════════════ */

  {
    id: 'mch_solang_peaks',
    slug: 'solang-peaks',
    name: 'Solang Peaks Resort',
    destination: 'Manali',
    tagline: 'Solang valley · full-board activity resort',
    description:
      'A 96-room resort at the mouth of the Solang valley with a heated indoor pool, a gym and a guided-activity desk. Sells full board because most guests are out all day and eat where they sleep.',
    rating: 4.4,
    image: '/images/countries/switzerland/switzerland-3.webp',
    attributes: ['pool', 'gym', 'wifi', 'air_conditioning', 'family_friendly', 'free_cancellation'],
    rooms: [
      { id: 'sp-valley', name: 'Valley Twin', tier: 2, base_price_per_night: 7400, cost_per_night: 4100, max_occupancy: 3, attributes: ['balcony'], inventory_available: 12 },
      { id: 'sp-summit', name: 'Summit Room', tier: 3, base_price_per_night: 10800, cost_per_night: 5900, max_occupancy: 3, attributes: ['balcony', 'quiet'], inventory_available: 7 },
      { id: 'sp-suite', name: 'Glacier Suite', tier: 4, base_price_per_night: 15200, cost_per_night: 8300, max_occupancy: 4, attributes: ['balcony', 'spa', 'romantic'], inventory_available: 3 }
    ],
    addons: [
      { id: 'sp-breakfast', name: 'Breakfast buffet', price: 650, cost: 280, per_night: true, per_person: true, attributes: ['breakfast'], group: 'meals' },
      { id: 'sp-fullboard', name: 'Full board', price: 1900, cost: 950, per_night: true, per_person: true, attributes: ['breakfast', 'all_meals'], group: 'meals' },
      { id: 'sp-transfer', name: 'Kullu airport transfer', price: 4600, cost: 2900, per_night: false, per_person: false, attributes: ['airport_transfer'], group: 'transfer' },
      { id: 'sp-adventure', name: 'Guided adventure day', price: 2800, cost: 1600, per_night: false, per_person: true, attributes: ['water_sports'], group: 'activity' },
      { id: 'sp-early', name: 'Early check-in', price: 800, cost: 120, per_night: false, per_person: false, attributes: ['early_checkin'], group: 'flex' }
    ],
    policy: {
      max_discount_pct: 11,
      min_margin_pct: 27,
      max_counter_rounds: 2,
      allow_substitutions: true,
      substitutable_groups: ['meals', 'transfer', 'activity', 'flex', 'room_category'],
      locked_addons: [],
      objectives: ['maximize_occupancy', 'increase_package_value', 'maximize_revenue'],
      offer_ttl_minutes: 20
    },
    weekend_uplift_pct: 26,
    voice: 'Energetic and logistics-minded. Talks about what you will actually do each day.'
  },

  {
    id: 'mch_hadimba_inn',
    slug: 'hadimba-inn',
    name: 'Hadimba Heritage Inn',
    destination: 'Manali',
    tagline: 'Old Manali · walkable and cheap',
    description:
      'A plain eleven-room inn a few minutes from Hadimba temple and the Old Manali cafes. No pool, no spa, no transfers worth speaking of. The cheapest bed in the set, and honest about it.',
    rating: 3.9,
    image: '/images/countries/chile/chile-2.webp',
    attributes: ['wifi', 'city_center', 'nightlife_nearby', 'free_cancellation'],
    rooms: [
      { id: 'hi-standard', name: 'Standard Double', tier: 1, base_price_per_night: 3200, cost_per_night: 2050, max_occupancy: 2, attributes: [], inventory_available: 9 },
      { id: 'hi-deodar', name: 'Deodar View Room', tier: 2, base_price_per_night: 4900, cost_per_night: 3000, max_occupancy: 3, attributes: ['balcony'], inventory_available: 5 }
    ],
    addons: [
      { id: 'hi-breakfast', name: 'Cafe breakfast', price: 350, cost: 190, per_night: true, per_person: true, attributes: ['breakfast'], group: 'meals' },
      { id: 'hi-taxi', name: 'Shared taxi from Kullu', price: 1500, cost: 1050, per_night: false, per_person: false, attributes: ['airport_transfer'], group: 'transfer' }
    ],
    policy: {
      // Thin margins leave almost nothing to give: the margin floor binds long
      // before the discount ceiling does, so this merchant withdraws early
      // rather than negotiating a deal it cannot afford.
      max_discount_pct: 6,
      min_margin_pct: 30,
      max_counter_rounds: 1,
      allow_substitutions: true,
      substitutable_groups: ['meals', 'transfer', 'room_category'],
      locked_addons: [],
      objectives: ['maximize_occupancy'],
      offer_ttl_minutes: 20
    },
    weekend_uplift_pct: 14,
    voice: 'Blunt and unpolished. Quotes a low number and does not pretend to be more than it is.'
  },

  {
    id: 'mch_cloudveil',
    slug: 'cloudveil',
    name: 'Cloudveil Chalets',
    destination: 'Manali',
    tagline: 'Naggar ridge · adults-only chalets',
    description:
      'Six standalone cedar chalets on the Naggar ridge, each with a wood stove, a private deck and a kitchenette. Adults only, deliberately hard to reach, and priced for people who want nobody else nearby.',
    rating: 4.8,
    image: '/images/countries/switzerland/switzerland-4.webp',
    attributes: ['quiet', 'romantic', 'wifi', 'free_cancellation'],
    rooms: [
      { id: 'cv-cedar', name: 'Cedar Chalet', tier: 4, base_price_per_night: 14800, cost_per_night: 7900, max_occupancy: 2, attributes: ['balcony', 'kitchenette', 'romantic'], inventory_available: 4 },
      { id: 'cv-ridge', name: 'Ridge Chalet', tier: 5, base_price_per_night: 21500, cost_per_night: 11200, max_occupancy: 3, attributes: ['balcony', 'kitchenette', 'romantic', 'spa'], inventory_available: 2 }
    ],
    addons: [
      { id: 'cv-hamper', name: 'Breakfast hamper', price: 1250, cost: 560, per_night: true, per_person: false, attributes: ['breakfast'], group: 'meals' },
      { id: 'cv-private', name: 'Private mountain transfer', price: 6200, cost: 3400, per_night: false, per_person: false, attributes: ['airport_transfer', 'private_transfer'], group: 'transfer' },
      { id: 'cv-spa', name: 'In-chalet massage for two', price: 5400, cost: 2600, per_night: false, per_person: false, attributes: ['spa', 'romantic'], group: 'wellness' },
      { id: 'cv-latecheckout', name: 'Late checkout', price: 1400, cost: 200, per_night: false, per_person: false, attributes: ['late_checkout'], group: 'flex' }
    ],
    policy: {
      max_discount_pct: 4,
      min_margin_pct: 38,
      max_counter_rounds: 1,
      allow_substitutions: true,
      substitutable_groups: ['meals', 'wellness', 'flex'],
      locked_addons: [],
      objectives: ['protect_margin', 'increase_package_value'],
      offer_ttl_minutes: 25
    },
    weekend_uplift_pct: 34,
    voice: 'Spare and a little austere. Says less than it could and never discounts to win.'
  },

  {
    id: 'mch_beas_workstay',
    slug: 'beas-workstay',
    name: 'Beas Workstay',
    destination: 'Manali',
    tagline: 'Prini · long-stay studios for remote work',
    description:
      'Fourteen serviced studios built for people working a full week from the mountains: a real desk, a fibre line with a backup, a kitchenette in every room and laundry down the hall. Weekly rates, not nightly ones, in spirit.',
    rating: 4.5,
    image: '/images/countries/canada/canada-3.webp',
    attributes: ['workspace', 'wifi', 'quiet', 'air_conditioning', 'pet_friendly', 'free_cancellation'],
    rooms: [
      { id: 'bw-studio', name: 'Work Studio', tier: 3, base_price_per_night: 6800, cost_per_night: 3600, max_occupancy: 2, attributes: ['kitchenette', 'workspace'], inventory_available: 10 },
      { id: 'bw-corner', name: 'Corner Studio', tier: 4, base_price_per_night: 9400, cost_per_night: 4900, max_occupancy: 3, attributes: ['kitchenette', 'workspace', 'balcony'], inventory_available: 4 }
    ],
    addons: [
      { id: 'bw-breakfast', name: 'Breakfast delivered', price: 480, cost: 240, per_night: true, per_person: true, attributes: ['breakfast'], group: 'meals' },
      { id: 'bw-transfer', name: 'Airport transfer', price: 4000, cost: 2600, per_night: false, per_person: false, attributes: ['airport_transfer'], group: 'transfer' },
      { id: 'bw-desk', name: 'Dedicated desk in the co-working room', price: 700, cost: 180, per_night: true, per_person: true, attributes: ['workspace'], group: 'work' },
      { id: 'bw-laundry', name: 'Weekly laundry', price: 900, cost: 420, per_night: false, per_person: false, attributes: [], group: 'services' }
    ],
    policy: {
      max_discount_pct: 14,
      min_margin_pct: 24,
      max_counter_rounds: 3,
      allow_substitutions: true,
      substitutable_groups: ['meals', 'transfer', 'work', 'services', 'room_category'],
      locked_addons: [],
      objectives: ['maximize_occupancy', 'move_unsold_inventory'],
      offer_ttl_minutes: 30
    },
    weekend_uplift_pct: 8,
    voice: 'Practical and specific. Leads with bandwidth, desk height and how quiet the street is.'
  },

  {
    id: 'mch_haveli_amrit',
    slug: 'haveli-amrit',
    name: 'Haveli Amrit',
    destination: 'Udaipur',
    tagline: 'Lake Pichola · restored haveli',
    description: 'A restored twelve-room haveli on the eastern ghats of Lake Pichola, with a rooftop dining terrace.',
    rating: 4.8,
    image: '/images/countries/india/india-3.webp',
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
    weekend_uplift_pct: 24,
    voice: 'Formal and heritage-proud.'
  },

  /* ══════════════════════════════════════════════════════════════════════
   * UDAIPUR · lakes and heritage
   *
   * Here the decisive attributes are city_center, romantic, spa and
   * pet_friendly. As in Goa, one property is deliberately unable to satisfy
   * the destination's most-asked-for requirement, so a hard constraint has
   * something real to exclude.
   * ═══════════════════════════════════════════════════════════════════════ */

  {
    id: 'mch_pichola_palace',
    slug: 'pichola-palace',
    name: 'Pichola Palace Retreat',
    destination: 'Udaipur',
    tagline: 'Lake Pichola · restored palace wing',
    description:
      'Twenty-two rooms in a restored wing of a lakeside palace, with a courtyard pool, a full spa and boats on call. The most expensive inventory in the marketplace, and the least willing to discount.',
    rating: 4.9,
    image: '/images/countries/switzerland/switzerland-2.webp',
    attributes: ['pool', 'spa', 'wifi', 'air_conditioning', 'romantic', 'city_center'],
    rooms: [
      { id: 'pp-courtyard', name: 'Courtyard Room', tier: 3, base_price_per_night: 16800, cost_per_night: 8600, max_occupancy: 2, attributes: ['quiet'], inventory_available: 8 },
      { id: 'pp-lake', name: 'Lake-Facing Room', tier: 4, base_price_per_night: 24500, cost_per_night: 12400, max_occupancy: 3, attributes: ['balcony', 'romantic'], inventory_available: 5 },
      { id: 'pp-suite', name: 'Maharani Suite', tier: 5, base_price_per_night: 38000, cost_per_night: 18900, max_occupancy: 4, attributes: ['balcony', 'romantic', 'spa'], inventory_available: 2 }
    ],
    addons: [
      { id: 'pp-breakfast', name: 'Courtyard breakfast', price: 1400, cost: 590, per_night: true, per_person: true, attributes: ['breakfast'], group: 'meals' },
      { id: 'pp-halfboard', name: 'Half board', price: 3200, cost: 1500, per_night: true, per_person: true, attributes: ['breakfast', 'all_meals'], group: 'meals' },
      { id: 'pp-transfer', name: 'Private car from Dabok', price: 5200, cost: 2700, per_night: false, per_person: false, attributes: ['airport_transfer', 'private_transfer'], group: 'transfer' },
      { id: 'pp-boat', name: 'Sunset boat for two', price: 6800, cost: 3100, per_night: false, per_person: false, attributes: ['romantic'], group: 'activity' },
      { id: 'pp-spa', name: 'Royal spa ritual', price: 7400, cost: 3300, per_night: false, per_person: false, attributes: ['spa'], group: 'wellness' }
    ],
    policy: {
      max_discount_pct: 5,
      min_margin_pct: 40,
      max_counter_rounds: 1,
      allow_substitutions: true,
      substitutable_groups: ['meals', 'activity', 'wellness', 'room_category'],
      locked_addons: [],
      objectives: ['protect_margin', 'maximize_revenue'],
      offer_ttl_minutes: 25
    },
    weekend_uplift_pct: 30,
    voice: 'Formal and unhurried. Sells the address and does not apologise for the rate.'
  },

  {
    id: 'mch_saheli_courtyard',
    slug: 'saheli-courtyard',
    name: 'Saheli Courtyard',
    destination: 'Udaipur',
    tagline: 'Saheliyon ki Bari · family stays',
    description:
      'A thirty-room hotel near Saheliyon ki Bari built around a shallow pool, with interconnecting rooms, cots on request and an early dinner service. Designed around families and priced to fill.',
    rating: 4.4,
    image: '/images/countries/india/india-4.webp',
    attributes: ['pool', 'wifi', 'air_conditioning', 'family_friendly', 'free_cancellation'],
    rooms: [
      { id: 'sc-garden', name: 'Garden Room', tier: 2, base_price_per_night: 7600, cost_per_night: 4200, max_occupancy: 3, attributes: ['quiet'], inventory_available: 14 },
      { id: 'sc-family', name: 'Family Room', tier: 3, base_price_per_night: 11400, cost_per_night: 6100, max_occupancy: 5, attributes: ['balcony', 'family_friendly'], inventory_available: 8 },
      { id: 'sc-connect', name: 'Interconnecting Pair', tier: 4, base_price_per_night: 16200, cost_per_night: 8800, max_occupancy: 6, attributes: ['balcony', 'family_friendly'], inventory_available: 3 }
    ],
    addons: [
      { id: 'sc-breakfast', name: 'Family breakfast', price: 620, cost: 270, per_night: true, per_person: true, attributes: ['breakfast'], group: 'meals' },
      { id: 'sc-allmeals', name: 'All meals', price: 1750, cost: 880, per_night: true, per_person: true, attributes: ['breakfast', 'all_meals'], group: 'meals' },
      { id: 'sc-transfer', name: 'Airport transfer', price: 3400, cost: 1900, per_night: false, per_person: false, attributes: ['airport_transfer'], group: 'transfer' },
      { id: 'sc-earlycheckin', name: 'Early check-in', price: 950, cost: 160, per_night: false, per_person: false, attributes: ['early_checkin'], group: 'flex' }
    ],
    policy: {
      max_discount_pct: 12,
      min_margin_pct: 26,
      max_counter_rounds: 2,
      allow_substitutions: true,
      substitutable_groups: ['meals', 'transfer', 'flex', 'room_category'],
      locked_addons: [],
      objectives: ['maximize_occupancy', 'increase_package_value'],
      offer_ttl_minutes: 20
    },
    weekend_uplift_pct: 22,
    voice: 'Warm and reassuring. Answers the questions parents actually ask.'
  },

  {
    id: 'mch_ambrai_house',
    slug: 'ambrai-house',
    name: 'Ambrai Backpacker House',
    destination: 'Udaipur',
    tagline: 'Ambrai ghat · cheap beds by the water',
    description:
      'Bunks and small private rooms a minute from Ambrai ghat, above a busy cafe. Loud, central and the cheapest way to sleep in Udaipur. No pool, no spa, no quiet.',
    rating: 4.1,
    image: '/images/countries/greece/greece-4.webp',
    attributes: ['wifi', 'city_center', 'nightlife_nearby', 'free_cancellation'],
    rooms: [
      { id: 'ah-private', name: 'Small Private Room', tier: 1, base_price_per_night: 2900, cost_per_night: 1750, max_occupancy: 2, attributes: [], inventory_available: 11 },
      { id: 'ah-terrace', name: 'Terrace Room', tier: 2, base_price_per_night: 4400, cost_per_night: 2600, max_occupancy: 3, attributes: ['balcony'], inventory_available: 6 }
    ],
    addons: [
      { id: 'ah-breakfast', name: 'Cafe breakfast', price: 300, cost: 150, per_night: true, per_person: true, attributes: ['breakfast'], group: 'meals' },
      { id: 'ah-airport', name: 'Airport pickup', price: 1900, cost: 1300, per_night: false, per_person: false, attributes: ['airport_transfer'], group: 'transfer' },
      { id: 'ah-locker', name: 'Luggage store and late checkout', price: 500, cost: 120, per_night: false, per_person: false, attributes: ['late_checkout'], group: 'flex' }
    ],
    policy: {
      max_discount_pct: 8,
      min_margin_pct: 22,
      max_counter_rounds: 2,
      allow_substitutions: true,
      substitutable_groups: ['meals', 'transfer', 'flex', 'room_category'],
      locked_addons: [],
      objectives: ['maximize_occupancy', 'move_unsold_inventory'],
      offer_ttl_minutes: 15
    },
    weekend_uplift_pct: 18,
    voice: 'Casual and unbothered. Tells you where to eat before it tells you about the room.'
  },

  {
    id: 'mch_fateh_villas',
    slug: 'fateh-villas',
    name: 'Fateh Lake Villas',
    destination: 'Udaipur',
    tagline: 'Fateh Sagar · self-catering villas, pets welcome',
    description:
      'Four two-bedroom villas above Fateh Sagar with full kitchens, walled gardens and no restaurant at all. Dogs stay free. Nothing here is in the old city, and it does not pretend to be.',
    rating: 4.6,
    image: '/images/countries/greece/greece-3.webp',
    attributes: ['wifi', 'air_conditioning', 'pet_friendly', 'quiet', 'free_cancellation'],
    rooms: [
      { id: 'fv-garden', name: 'Garden Villa', tier: 3, base_price_per_night: 12600, cost_per_night: 7100, max_occupancy: 4, attributes: ['kitchenette', 'balcony'], inventory_available: 3 },
      { id: 'fv-lake', name: 'Lake View Villa', tier: 4, base_price_per_night: 18400, cost_per_night: 10200, max_occupancy: 5, attributes: ['kitchenette', 'balcony', 'romantic'], inventory_available: 2 }
    ],
    addons: [
      // No kitchen of its own, so no breakfast product exists to sell. A
      // traveller who marks breakfast as a must-have cannot be served here at
      // any price, which is the honest answer rather than a workaround.
      { id: 'fv-hamper', name: 'Grocery hamper on arrival', price: 2400, cost: 1500, per_night: false, per_person: false, attributes: [], group: 'provisions' },
      { id: 'fv-transfer', name: 'Airport transfer', price: 3600, cost: 2100, per_night: false, per_person: false, attributes: ['airport_transfer'], group: 'transfer' },
      { id: 'fv-housekeeping', name: 'Daily housekeeping', price: 800, cost: 520, per_night: true, per_person: false, attributes: [], group: null }
    ],
    policy: {
      max_discount_pct: 9,
      min_margin_pct: 28,
      max_counter_rounds: 2,
      allow_substitutions: true,
      substitutable_groups: ['provisions', 'transfer', 'room_category'],
      locked_addons: ['fv-housekeeping'],
      objectives: ['protect_margin', 'maximize_occupancy'],
      offer_ttl_minutes: 20
    },
    weekend_uplift_pct: 20,
    voice: 'Low-key and domestic. Talks about the kitchen and the garden gate.'
  }
]

/** The request the demo opens with. */
export const DEMO_REQUEST =
  'Goa for two people, 3 nights. Budget ₹60,000 all-in, that is a hard limit. Beachfront is essential, breakfast would be nice. My dates are flexible by a couple of days.'
