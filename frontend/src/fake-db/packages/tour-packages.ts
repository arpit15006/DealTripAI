// Type Imports
import type { TourPackage } from '@/types/packages/tour-package-types'

const countryImage = (country: string, index: number) => `/images/countries/${country}/${country}-${index}.webp`

// Rotates the 4 photos so `cover` is first (images[0] is the card/gallery cover) —
// keeps all 4 for the gallery while still giving each package in a country its own
// distinct cover photo instead of every package defaulting to the same `-1` image.
const countryImages = (country: string, cover = 1) => {
  const order = [1, 2, 3, 4]
  const rotated = [...order.slice(order.indexOf(cover)), ...order.slice(0, order.indexOf(cover))]

  return rotated.map(index => countryImage(country, index))
}

export const db: TourPackage[] = [
  // Indonesia
  {
    id: '1',
    slug: 'bali-island-escape',
    title: 'Bali Island Escape',
    category: 'beach',
    packageType: 'regular',
    location: 'Bali, Indonesia',
    days: 6,
    nights: 5,
    price: 899,
    rating: 1,
    reviewCount: 214,
    country: 'indonesia',
    images: countryImages('indonesia', 1),
    isRecommended: true,
    isTrending: true,
    tripInformation:
      "<ul><li><strong>Uluwatu & Nusa Dua beaches:</strong> Relax on powder-soft sand and swim in warm, turquoise water along Bali's dramatic southern coastline.</li><li><strong>Sunset at Tanah Lot:</strong> Watch the sky turn gold behind the cliffside sea temple, one of Bali's most iconic sights.</li><li><strong>Water sports:</strong> Try surfing at Kuta Beach or snorkeling around Nusa Penida's crystal-clear reefs.</li><li><strong>Balinese cuisine:</strong> Sample authentic babi guling and fresh seafood grills at beachfront warungs.</li><li><strong>Spa & wellness:</strong> Unwind with a traditional Balinese massage overlooking the Indian Ocean.</li></ul>"
  },
  {
    id: '2',
    slug: 'ubud-rice-terrace-retreat',
    title: 'Ubud Rice Terrace Retreat',
    category: 'cultural',
    packageType: 'regular',
    location: 'Ubud, Indonesia',
    days: 5,
    nights: 4,
    price: 749,
    rating: 4.6,
    reviewCount: 162,
    country: 'indonesia',
    images: countryImages('indonesia', 3),
    tripInformation:
      "<ul><li><strong>Tegallalang Rice Terraces:</strong> Walk the emerald tiers of Bali's most photographed landscape at sunrise.</li><li><strong>Sacred Monkey Forest:</strong> Explore ancient temple ruins shaded by banyan trees and resident long-tailed macaques.</li><li><strong>Traditional craft villages:</strong> Watch silversmiths and wood carvers at work in nearby artisan hamlets.</li><li><strong>Balinese dance performance:</strong> Experience a live Legong or Kecak fire dance at a village temple courtyard.</li><li><strong>Farm-to-table dining:</strong> Enjoy an organic Balinese cooking class using produce grown in Ubud's terraced fields.</li></ul>"
  },

  // Switzerland
  {
    id: '3',
    slug: 'swiss-alps-adventure',
    title: 'Swiss Alps Adventure',
    category: 'adventure',
    packageType: 'premium',
    location: 'Interlaken, Switzerland',
    days: 7,
    nights: 6,
    price: 2199,
    rating: 4.9,
    reviewCount: 132,
    country: 'switzerland',
    images: countryImages('switzerland', 1),
    isRecommended: true,
    tripInformation:
      '<ul><li><strong>Jungfraujoch railway:</strong> Ride Europe\'s highest railway station, the "Top of Europe," through glaciers and alpine passes.</li><li><strong>Paragliding over Interlaken:</strong> Soar between Lake Thun and Lake Brienz for unmatched views of the Bernese Oberland.</li><li><strong>Via ferrata & hiking:</strong> Climb marked mountain trails with panoramic views of the Eiger, Mönch, and Jungfrau peaks.</li><li><strong>Grindelwald cable cars:</strong> Cross the First Cliff Walk suspension trail above the valley floor.</li><li><strong>Alpine cuisine:</strong> Warm up with a traditional cheese fondue in a mountainside chalet restaurant.</li></ul>'
  },
  {
    id: '4',
    slug: 'zermatt-alpine-escape',
    title: 'Zermatt Alpine Escape',
    category: 'adventure',
    packageType: 'regular',
    location: 'Zermatt, Switzerland',
    days: 6,
    nights: 5,
    price: 2099,
    rating: 4.6,
    reviewCount: 118,
    country: 'switzerland',
    images: countryImages('switzerland', 3),
    tripInformation:
      "<ul><li><strong>Matterhorn views:</strong> Take the Gornergrat railway for uninterrupted views of Switzerland's most famous peak.</li><li><strong>Glacier skiing:</strong> Access year-round skiing and snowboarding on the Theodul Glacier, Europe's highest lift-served terrain.</li><li><strong>Car-free village charm:</strong> Wander Zermatt's traffic-free streets lined with wooden chalets and mountain boutiques.</li><li><strong>Five Lakes Hike:</strong> Trek between alpine lakes that mirror the Matterhorn on clear days.</li><li><strong>Mountain gastronomy:</strong> Dine at a Michelin-recognized alpine restaurant with panoramic peak views.</li></ul>"
  },
  {
    id: '5',
    slug: 'geneva-lakeside-discovery',
    title: 'Geneva Lakeside Discovery',
    category: 'cultural',
    packageType: 'regular',
    location: 'Geneva, Switzerland',
    days: 4,
    nights: 3,
    price: 1799,
    rating: 4.5,
    reviewCount: 87,
    country: 'switzerland',
    images: countryImages('switzerland', 2),
    tripInformation:
      "<ul><li><strong>Jet d'Eau:</strong> See Geneva's iconic 140-metre fountain rising from Lake Geneva's waterfront.</li><li><strong>Old Town Geneva:</strong> Wander cobbled lanes around St. Pierre Cathedral and the Reformation Wall.</li><li><strong>Lake Geneva cruise:</strong> Sail past the Alps and the vineyards of Lavaux on a scenic boat tour.</li><li><strong>United Nations quarter:</strong> Visit the Palais des Nations, home to international diplomacy since 1936.</li><li><strong>Swiss chocolate & watches:</strong> Browse Geneva's historic chocolatiers and watchmaking ateliers.</li></ul>"
  },

  // India
  {
    id: '6',
    slug: 'taj-mahal-trail',
    title: 'Taj Mahal',
    category: 'cultural',
    packageType: 'regular',
    location: 'Agra, India',
    days: 8,
    nights: 7,
    price: 1149,
    rating: 4.6,
    reviewCount: 189,
    country: 'india',
    images: countryImages('india', 1),
    isTrending: true,
    tripInformation:
      "<ul><li><strong>Taj Mahal at sunrise:</strong> Watch the marble mausoleum glow pink and gold as the sun rises over the Yamuna River.</li><li><strong>Agra Fort:</strong> Explore the red sandstone Mughal fortress that once housed emperors and their courts.</li><li><strong>Mehtab Bagh gardens:</strong> View the Taj Mahal's reflection from the moonlit garden across the river.</li><li><strong>Marble inlay craft:</strong> Watch artisans hand-carve pietra dura inlay work, a craft passed down since the Mughal era.</li><li><strong>Mughlai cuisine:</strong> Taste rich Agra-style biryani and petha, the city's signature sweet.</li></ul>"
  },
  {
    id: '7',
    slug: 'kerala-backwaters-bliss',
    title: 'Kerala Backwaters Bliss',
    category: 'honeymoon',
    packageType: 'regular',
    location: 'Kerala, India',
    days: 6,
    nights: 5,
    price: 1299,
    rating: 4.7,
    reviewCount: 145,
    country: 'india',
    images: countryImages('india', 3),
    tripInformation:
      "<ul><li><strong>Houseboat cruise:</strong> Drift along Alleppey's palm-fringed backwaters aboard a traditional Kettuvallam houseboat.</li><li><strong>Ayurvedic spa treatments:</strong> Enjoy a couple's Ayurveda massage at a lakeside wellness resort.</li><li><strong>Spice plantation tour:</strong> Walk through fragrant cardamom, pepper, and tea estates in the Western Ghats.</li><li><strong>Sunset on Marari Beach:</strong> Share a quiet evening on Kerala's unspoiled fishing-village coastline.</li><li><strong>Kerala cuisine:</strong> Savor a traditional sadya feast served on a banana leaf.</li></ul>"
  },

  // Maldives
  {
    id: '8',
    slug: 'maldives-honeymoon-bliss',
    title: 'Maldives Honeymoon Bliss',
    category: 'honeymoon',
    packageType: 'regular',
    location: 'Malé Atoll, Maldives',
    days: 5,
    nights: 4,
    price: 3299,
    rating: 4.9,
    reviewCount: 97,
    country: 'maldives',
    images: countryImages('maldives', 1),
    isRecommended: true,
    tripInformation:
      '<ul><li><strong>Overwater villa stay:</strong> Wake up to direct lagoon access from a private overwater bungalow.</li><li><strong>Sunset dolphin cruise:</strong> Watch spinner dolphins play in the Indian Ocean as the sky turns orange.</li><li><strong>Private sandbank dinner:</strong> Share a candlelit meal on a secluded sandbar reachable only by boat.</li><li><strong>Coral reef snorkeling:</strong> Swim through vibrant house reefs just steps from your villa.</li><li><strong>Couples spa ritual:</strong> Relax with an overwater spa treatment framed by uninterrupted ocean views.</li></ul>'
  },
  {
    id: '9',
    slug: 'maldives-scuba-snorkel-adventure',
    title: 'Maldives Scuba & Snorkel Adventure',
    category: 'adventure',
    packageType: 'premium',
    location: 'Baa Atoll, Maldives',
    days: 5,
    nights: 4,
    price: 2899,
    rating: 4.8,
    reviewCount: 93,
    country: 'maldives',
    images: countryImages('maldives', 3),
    tripInformation:
      '<ul><li><strong>Hanifaru Bay:</strong> Snorkel alongside manta rays and whale sharks in this UNESCO Biosphere Reserve (seasonal).</li><li><strong>PADI-certified diving:</strong> Explore vibrant coral walls and reef sharks with certified dive instructors.</li><li><strong>Night snorkeling:</strong> Encounter bioluminescent plankton and nocturnal reef life after dark.</li><li><strong>Thila drift dives:</strong> Dive submerged reef pinnacles teeming with turtles, rays, and reef fish.</li><li><strong>Island-hopping speedboat tours:</strong> Visit local fishing islands and untouched sandbanks across Baa Atoll.</li></ul>'
  },

  // Kenya
  {
    id: '10',
    slug: 'kenya-safari-explorer',
    title: 'Kenya Safari Explorer',
    category: 'wildlife',
    packageType: 'regular',
    location: 'Maasai Mara, Kenya',
    days: 6,
    nights: 5,
    price: 2549,
    rating: 4.8,
    reviewCount: 76,
    country: 'kenya',
    images: countryImages('kenya', 3),
    isTrending: true,
    tripInformation:
      "<ul><li><strong>Great Migration viewing:</strong> Witness millions of wildebeest and zebra cross the Mara River (seasonal).</li><li><strong>Big Five game drives:</strong> Track lion, elephant, leopard, rhino, and buffalo with an experienced Maasai guide.</li><li><strong>Hot air balloon safari:</strong> Float above the savanna at dawn for a bird's-eye view of the herds.</li><li><strong>Maasai village visit:</strong> Learn traditional customs and beadwork from a local Maasai community.</li><li><strong>Sundowner bush dinner:</strong> Dine under the stars with the sounds of the savanna at nightfall.</li></ul>"
  },
  {
    id: '11',
    slug: 'amboseli-elephant-safari',
    title: 'Amboseli Elephant Safari',
    category: 'wildlife',
    packageType: 'regular',
    location: 'Amboseli, Kenya',
    days: 5,
    nights: 4,
    price: 2199,
    rating: 4.7,
    reviewCount: 68,
    country: 'kenya',
    images: countryImages('kenya', 1),
    tripInformation:
      "<ul><li><strong>Elephant herds beneath Kilimanjaro:</strong> Photograph free-roaming elephant families against Africa's tallest peak.</li><li><strong>Observation Hill:</strong> Climb Amboseli's only public viewpoint for panoramic views of the swamps and plains.</li><li><strong>Birdwatching in the marshes:</strong> Spot over 400 bird species around Amboseli's permanent wetlands.</li><li><strong>Guided game drives:</strong> Track lion, giraffe, and buffalo across open savanna with a Maasai ranger.</li><li><strong>Cultural boma visit:</strong> Meet a local Maasai community to learn about coexistence with wildlife.</li></ul>"
  },
  {
    id: '38',
    slug: 'kenya-ultimate-safari-grand-circuit',
    title: 'Kenya Ultimate Safari Grand Circuit',
    category: 'wildlife',
    packageType: 'premium',
    location: 'Maasai Mara to Lake Nakuru, Kenya',
    days: 9,
    nights: 8,
    price: 3299,
    rating: 4.9,
    reviewCount: 61,
    country: 'kenya',
    images: countryImages('kenya', 2),
    isRecommended: true,
    tripInformation:
      "<ul><li><strong>Maasai Mara Great Migration:</strong> Spend three full days tracking the Big Five and the annual wildebeest crossing.</li><li><strong>Lake Nakuru flamingos:</strong> Cruise past thousands of flamingos and rhino sanctuaries along the alkaline lakeshore.</li><li><strong>Amboseli & Kilimanjaro views:</strong> Photograph elephant herds roaming beneath Africa's tallest peak.</li><li><strong>Hot air balloon safari:</strong> Drift over the savanna at sunrise for a bird's-eye view of grazing herds.</li><li><strong>Private safari lodges:</strong> Stay in premium tented camps and lodges across all three reserves.</li></ul>"
  },

  // Greece
  {
    id: '12',
    slug: 'santorini-sunset-getaway',
    title: 'Santorini Sunset Getaway',
    category: 'honeymoon',
    packageType: 'premium',
    location: 'Santorini, Greece',
    days: 6,
    nights: 5,
    price: 2699,
    rating: 4.8,
    reviewCount: 168,
    country: 'greece',
    images: countryImages('greece', 1),
    isRecommended: true,
    tripInformation:
      "<ul><li><strong>Oia sunset:</strong> Watch the world-famous sunset from Oia's caldera-view terraces.</li><li><strong>Caldera catamaran cruise:</strong> Sail past volcanic cliffs and swim in hot springs off Nea Kameni.</li><li><strong>Private cliffside dinner:</strong> Enjoy a candlelit meal overlooking the Aegean Sea from a whitewashed terrace.</li><li><strong>Wine tasting in Pyrgos:</strong> Sample volcanic-soil Assyrtiko wines at a family-run Santorini winery.</li><li><strong>Red & Black Beach visits:</strong> Relax on Santorini's striking volcanic-sand beaches near Akrotiri.</li></ul>"
  },
  {
    id: '13',
    slug: 'athens-ancient-wonders',
    title: 'Athens Ancient Wonders',
    category: 'cultural',
    packageType: 'regular',
    location: 'Athens, Greece',
    days: 5,
    nights: 4,
    price: 1599,
    rating: 4.6,
    reviewCount: 172,
    country: 'greece',
    images: countryImages('greece', 2),
    tripInformation:
      "<ul><li><strong>The Acropolis & Parthenon:</strong> Walk the Sacred Rock that has crowned Athens for over 2,500 years.</li><li><strong>Acropolis Museum:</strong> View original sculptures and friezes just steps from where they once stood.</li><li><strong>Plaka old town:</strong> Wander Athens' oldest neighborhood, lined with neoclassical houses and tavernas.</li><li><strong>Ancient Agora:</strong> Explore the birthplace of democracy where Socrates once taught.</li><li><strong>Greek taverna evening:</strong> Share mezze plates and live rebetiko music in a traditional Athens taverna.</li></ul>"
  },

  // New Zealand
  {
    id: '14',
    slug: 'queenstown-adrenaline-rush',
    title: 'Queenstown Adrenaline Rush',
    category: 'adventure',
    packageType: 'regular',
    location: 'Queenstown, New Zealand',
    days: 7,
    nights: 6,
    price: 2399,
    rating: 4.9,
    reviewCount: 152,
    country: 'newzealand',
    images: countryImages('newzealand', 2),
    isRecommended: true,
    tripInformation:
      "<ul><li><strong>Bungy jumping at Kawarau Bridge:</strong> Take the leap where commercial bungy jumping was born.</li><li><strong>Shotover Jet boating:</strong> Speed through the narrow canyons of the Shotover River.</li><li><strong>Skyline Gondola & luge:</strong> Ride above Lake Wakatipu for sweeping views of the Remarkables mountain range.</li><li><strong>Milford Sound day trip:</strong> Cruise the fiord's waterfalls, seals, and dramatic cliffs.</li><li><strong>Queenstown wine trail:</strong> Taste Central Otago Pinot Noir at vineyards just outside town.</li></ul>"
  },
  {
    id: '15',
    slug: 'fiordland-wilderness-trail',
    title: 'Fiordland Wilderness Trail',
    category: 'wildlife',
    packageType: 'regular',
    location: 'Fiordland, New Zealand',
    days: 6,
    nights: 5,
    price: 2299,
    rating: 4.8,
    reviewCount: 84,
    country: 'newzealand',
    images: countryImages('newzealand', 3),
    tripInformation:
      "<ul><li><strong>Milford Sound cruise:</strong> Spot fur seals, dolphins, and penguins beneath towering fiord cliffs.</li><li><strong>Doubtful Sound wilderness:</strong> Explore New Zealand's remotest fiord, reachable only by boat and coach.</li><li><strong>Fiordland National Park hikes:</strong> Trek native rainforest trails within a UNESCO World Heritage site.</li><li><strong>Glowworm caves:</strong> Drift by boat beneath a ceiling of bioluminescent glowworms at Te Anau.</li><li><strong>Kiwi bird spotting:</strong> Search for New Zealand's iconic flightless bird on a guided night walk.</li></ul>"
  },
  {
    id: '36',
    slug: 'new-zealand-grand-journey',
    title: 'New Zealand Grand Journey',
    category: 'adventure',
    packageType: 'premium',
    location: 'Auckland to Queenstown, New Zealand',
    days: 14,
    nights: 13,
    price: 4699,
    rating: 4.9,
    reviewCount: 52,
    country: 'newzealand',
    images: countryImages('newzealand', 1),
    isRecommended: true,
    tripInformation:
      "<ul><li><strong>Auckland harbour city:</strong> Begin in the 'City of Sails' with a Sky Tower view and Waiheke Island vineyard visit.</li><li><strong>Rotorua geothermal wonders:</strong> Walk between bubbling mud pools and geysers, then experience Māori culture at a traditional hangi feast.</li><li><strong>Wellington to South Island ferry:</strong> Cross the Cook Strait past the Marlborough Sounds en route to the South Island.</li><li><strong>Queenstown adventure capital:</strong> Bungy jump, jet boat, and gondola ride above Lake Wakatipu.</li><li><strong>Milford Sound & Fiordland finale:</strong> Cap the journey with a cruise through New Zealand's most iconic fiord.</li></ul>"
  },

  // Japan
  {
    id: '16',
    slug: 'kyoto-temple-discovery',
    title: 'Kyoto Temple Discovery',
    category: 'cultural',
    packageType: 'regular',
    location: 'Kyoto, Japan',
    days: 8,
    nights: 7,
    price: 1899,
    rating: 4.7,
    reviewCount: 203,
    country: 'japan',
    images: countryImages('japan', 1),
    isTrending: true,
    tripInformation:
      '<ul><li><strong>Fushimi Inari Shrine:</strong> Walk beneath thousands of vermillion torii gates winding up Mount Inari.</li><li><strong>Kinkaku-ji (Golden Pavilion):</strong> See the gold-leaf temple reflected in its still garden pond.</li><li><strong>Arashiyama Bamboo Grove:</strong> Stroll a towering bamboo forest just outside central Kyoto.</li><li><strong>Gion geisha district:</strong> Wander preserved machiya streets where geiko and maiko still train.</li><li><strong>Traditional tea ceremony:</strong> Experience an authentic matcha ceremony guided by a local tea master.</li></ul>'
  },
  {
    id: '17',
    slug: 'tokyo-neon-nights',
    title: 'Tokyo Neon Nights',
    category: 'cultural',
    packageType: 'regular',
    location: 'Tokyo, Japan',
    days: 6,
    nights: 5,
    price: 2399,
    rating: 4.8,
    reviewCount: 198,
    country: 'japan',
    images: countryImages('japan', 3),
    isTrending: true,
    tripInformation:
      "<ul><li><strong>Shibuya Crossing:</strong> Experience the world's busiest pedestrian scramble beneath giant video screens.</li><li><strong>Shinjuku nightlife:</strong> Explore neon-lit alleys of Omoide Yokocho and rooftop bars with skyline views.</li><li><strong>Senso-ji Temple:</strong> Visit Tokyo's oldest temple in historic Asakusa, beautifully lit after dark.</li><li><strong>Akihabara electric town:</strong> Browse anime, gaming, and retro electronics in Tokyo's pop-culture hub.</li><li><strong>Izakaya food crawl:</strong> Sample yakitori, sushi, and sake across Tokyo's atmospheric backstreet eateries.</li></ul>"
  },
  {
    id: '18',
    slug: 'osaka-street-food-trail',
    title: 'Osaka Street Food Trail',
    category: 'cultural',
    packageType: 'regular',
    location: 'Osaka, Japan',
    days: 5,
    nights: 4,
    price: 1699,
    rating: 4.5,
    reviewCount: 134,
    country: 'japan',
    images: countryImages('japan', 2),
    tripInformation:
      "<ul><li><strong>Dotonbori food street:</strong> Taste takoyaki and okonomiyaki beneath Osaka's iconic glowing signboards.</li><li><strong>Kuromon Ichiba Market:</strong> Sample fresh seafood and wagyu skewers at \"Osaka's Kitchen.\"</li><li><strong>Osaka Castle:</strong> Explore the grounds of one of Japan's most iconic feudal-era castles.</li><li><strong>Shinsekai retro district:</strong> Wander a nostalgic neighborhood famous for kushikatsu skewers and Tsutenkaku Tower.</li><li><strong>Cooking class:</strong> Learn to make authentic okonomiyaki from a local Osaka chef.</li></ul>"
  },
  {
    id: '39',
    slug: 'japan-complete-discovery',
    title: 'Japan Complete Discovery',
    category: 'cultural',
    packageType: 'premium',
    location: 'Tokyo to Osaka, Japan',
    days: 10,
    nights: 9,
    price: 3499,
    rating: 4.9,
    reviewCount: 87,
    country: 'japan',
    images: countryImages('japan', 4),
    isRecommended: true,
    tripInformation:
      "<ul><li><strong>Tokyo neon nights:</strong> Explore Shibuya Crossing, Shinjuku's glowing alleys, and Akihabara's electric town.</li><li><strong>Kyoto's ancient temples:</strong> Walk beneath thousands of torii gates at Fushimi Inari and stroll the Arashiyama Bamboo Grove.</li><li><strong>Bullet train journey:</strong> Ride the Shinkansen between Tokyo, Kyoto, and Osaka for a true cross-country experience.</li><li><strong>Osaka street food finale:</strong> Taste takoyaki and okonomiyaki beneath Dotonbori's iconic glowing signboards.</li><li><strong>Traditional tea ceremony:</strong> Experience an authentic matcha ceremony guided by a local tea master.</li></ul>"
  },

  // UAE
  {
    id: '19',
    slug: 'dubai-luxury-city-break',
    title: 'Dubai Luxury City Break',
    category: 'cultural',
    packageType: 'regular',
    location: 'Dubai, UAE',
    days: 4,
    nights: 3,
    price: 1999,
    rating: 4.7,
    reviewCount: 176,
    country: 'uae',
    images: countryImages('uae', 1),
    isRecommended: true,
    tripInformation:
      '<ul><li><strong>Burj Khalifa observation deck:</strong> Take in panoramic desert and skyline views from the tallest building in the world.</li><li><strong>Dubai Mall & Fountain:</strong> Watch the choreographed Dubai Fountain show beneath the Burj Khalifa.</li><li><strong>Gold & Spice Souks:</strong> Browse traditional markets in historic Deira along Dubai Creek.</li><li><strong>Palm Jumeirah:</strong> Visit the man-made island and its beachfront resorts and skyline views.</li><li><strong>Fine dining skyline dinner:</strong> Enjoy an evening meal at a rooftop restaurant overlooking the city lights.</li></ul>'
  },
  {
    id: '20',
    slug: 'abu-dhabi-desert-safari',
    title: 'Abu Dhabi Desert Safari',
    category: 'adventure',
    packageType: 'regular',
    location: 'Abu Dhabi, UAE',
    days: 4,
    nights: 3,
    price: 1599,
    rating: 4.6,
    reviewCount: 121,
    country: 'uae',
    images: countryImages('uae', 3),
    tripInformation:
      '<ul><li><strong>Dune bashing:</strong> Ride a 4x4 across the towering red dunes of the Liwa desert.</li><li><strong>Camel trekking:</strong> Cross the sands the traditional way as the sun sets over the desert.</li><li><strong>Bedouin camp evening:</strong> Enjoy a traditional dinner, henna painting, and tanoura dance under desert stars.</li><li><strong>Sandboarding:</strong> Glide down soft dune slopes for an adrenaline-filled desert activity.</li><li><strong>Sheikh Zayed Grand Mosque:</strong> Marvel at one of the largest mosques in the world, adorned with marble and gold detailing.</li></ul>'
  },
  {
    id: '21',
    slug: 'dubai-marina-cruise-and-skyline',
    title: 'Dubai Marina Cruise & Skyline',
    category: 'cultural',
    packageType: 'premium',
    location: 'Dubai Marina, UAE',
    days: 4,
    nights: 3,
    price: 2299,
    rating: 4.8,
    reviewCount: 95,
    country: 'uae',
    images: countryImages('uae', 2),
    isRecommended: true,
    tripInformation:
      '<ul><li><strong>Dubai Marina Walk:</strong> Stroll the waterfront promenade lined with skyscrapers and yacht-filled marinas.</li><li><strong>Dhow dinner cruise:</strong> Sail past the illuminated skyline aboard a traditional wooden dhow.</li><li><strong>JBR Beach:</strong> Relax on The Beach at Jumeirah Beach Residence with marina skyline views.</li><li><strong>Ain Dubai:</strong> Ride one of the tallest observation wheels in the world for sweeping coastal views.</li><li><strong>Skydive Dubai views:</strong> Watch skydivers land near Palm Jumeirah from the marina promenade.</li></ul>'
  },
  {
    id: '22',
    slug: 'sharjah-heritage-walk',
    title: 'Sharjah Heritage Walk',
    category: 'cultural',
    packageType: 'regular',
    location: 'Sharjah, UAE',
    days: 3,
    nights: 2,
    price: 999,
    rating: 4.4,
    reviewCount: 58,
    country: 'uae',
    images: countryImages('uae', 1),
    tripInformation:
      '<ul><li><strong>Sharjah Heritage Area:</strong> Wander restored wind-tower houses and courtyards in the old town.</li><li><strong>Sharjah Art Museum:</strong> Browse the largest collection of Arab and Islamic art in the UAE.</li><li><strong>Al Noor Mosque:</strong> Admire Ottoman-inspired architecture on the Khalid Lagoon waterfront.</li><li><strong>Souq Al Arsah:</strong> Shop for spices, perfumes, and antiques in one of the oldest marketplaces in the UAE.</li><li><strong>Sharjah Museum of Islamic Civilization:</strong> Explore centuries of Islamic art, science, and culture.</li></ul>'
  },
  {
    id: '37',
    slug: 'dubai-express-weekend',
    title: 'Dubai Express Weekend',
    category: 'cultural',
    packageType: 'regular',
    location: 'Dubai, UAE',
    days: 2,
    nights: 1,
    price: 749,
    rating: 4.5,
    reviewCount: 138,
    country: 'uae',
    images: countryImages('uae', 4),
    isTrending: true,
    tripInformation:
      '<ul><li><strong>Burj Khalifa quick ascent:</strong> Ride to the 124th-floor observation deck for skyline views in under an hour.</li><li><strong>Dubai Mall & Fountain show:</strong> Catch the choreographed Dubai Fountain display right outside the mall entrance.</li><li><strong>Evening desert safari:</strong> Squeeze in dune bashing and a Bedouin camp dinner before your flight.</li><li><strong>Gold Souk browse:</strong> Window-shop glittering gold and spice stalls in historic Deira.</li><li><strong>JBR Beach sunset:</strong> End the trip with a quick beach walk along Jumeirah Beach Residence.</li></ul>'
  },

  // Chile
  {
    id: '23',
    slug: 'patagonia-trekking-expedition',
    title: 'Patagonia Trekking Expedition',
    category: 'adventure',
    packageType: 'premium',
    location: 'Torres del Paine, Chile',
    days: 9,
    nights: 8,
    price: 3199,
    rating: 4.8,
    reviewCount: 94,
    country: 'chile',
    images: countryImages('chile', 3),
    isRecommended: true,
    tripInformation:
      '<ul><li><strong>Torres del Paine W Trek:</strong> Hike toward the granite towers of the park past glacial lakes and valleys.</li><li><strong>Grey Glacier:</strong> Kayak or boat beside floating icebergs calved from a Patagonian ice field.</li><li><strong>Guanaco & condor spotting:</strong> Watch native wildlife roam the open Patagonian steppe.</li><li><strong>French Valley viewpoint:</strong> Take in panoramic views of hanging glaciers and jagged peaks.</li><li><strong>Refugio mountain lodging:</strong> Stay in trailside refugios for an authentic Patagonian trekking experience.</li></ul>'
  },
  {
    id: '24',
    slug: 'atacama-desert-stargazing',
    title: 'Atacama Desert Stargazing',
    category: 'adventure',
    packageType: 'premium',
    location: 'San Pedro de Atacama, Chile',
    days: 5,
    nights: 4,
    price: 2599,
    rating: 4.9,
    reviewCount: 71,
    country: 'chile',
    images: countryImages('chile', 1),
    tripInformation:
      '<ul><li><strong>Valle de la Luna:</strong> Watch the sunset paint the dunes and rock formations of the Moon Valley in pink light.</li><li><strong>World-class stargazing:</strong> Observe the Milky Way through telescopes under some of the clearest night skies in the world.</li><li><strong>El Tatio Geysers:</strong> Witness steaming geothermal geysers at sunrise, high in the Andes.</li><li><strong>Salar de Atacama:</strong> Spot flamingos wading through the largest salt flat in Chile.</li><li><strong>Atacameño culture:</strong> Learn about indigenous desert communities and their centuries-old traditions.</li></ul>'
  },

  // Thailand
  {
    id: '25',
    slug: 'phuket-beach-bliss',
    title: 'Phuket Beach Bliss',
    category: 'beach',
    packageType: 'regular',
    location: 'Phuket, Thailand',
    days: 6,
    nights: 5,
    price: 1099,
    rating: 2,
    reviewCount: 227,
    country: 'thailand',
    images: countryImages('thailand', 2),
    tripInformation:
      '<ul><li><strong>Patong & Kata beaches:</strong> Relax on golden sand and swim in the warm Andaman Sea.</li><li><strong>Phi Phi Islands day trip:</strong> Cruise to the turquoise waters and limestone cliffs made famous by "The Beach."</li><li><strong>Big Buddha Phuket:</strong> Visit the 45-metre hilltop statue with sweeping island views.</li><li><strong>Thai cooking class:</strong> Learn to prepare pad thai and tom yum with local island ingredients.</li><li><strong>Sunset at Promthep Cape:</strong> Watch the sun set over the sea from Phuket\'s southern viewpoint.</li></ul>'
  },
  {
    id: '26',
    slug: 'bangkok-grand-palace-tour',
    title: 'Bangkok Grand Palace Tour',
    category: 'cultural',
    packageType: 'regular',
    location: 'Bangkok, Thailand',
    days: 5,
    nights: 4,
    price: 1099,
    rating: 4.5,
    reviewCount: 223,
    country: 'thailand',
    images: countryImages('thailand', 1),
    tripInformation:
      "<ul><li><strong>Grand Palace & Wat Phra Kaew:</strong> Explore the former royal residence and the Emerald Buddha temple.</li><li><strong>Wat Arun:</strong> Climb the riverside spires of the Temple of Dawn along the Chao Phraya River.</li><li><strong>Chao Phraya river cruise:</strong> Sail past temples and floating markets on Bangkok's historic waterway.</li><li><strong>Chatuchak Weekend Market:</strong> Browse thousands of stalls at one of the largest markets in the world.</li><li><strong>Street food tour:</strong> Sample pad thai, mango sticky rice, and satay across Bangkok's night markets.</li></ul>"
  },
  {
    id: '27',
    slug: 'chiang-mai-jungle-retreat',
    title: 'Chiang Mai Jungle Retreat',
    category: 'adventure',
    packageType: 'regular',
    location: 'Chiang Mai, Thailand',
    days: 5,
    nights: 4,
    price: 1249,
    rating: 4.6,
    reviewCount: 109,
    country: 'thailand',
    images: countryImages('thailand', 3),
    tripInformation:
      '<ul><li><strong>Ethical elephant sanctuary:</strong> Feed and bathe rescued elephants in their natural jungle habitat.</li><li><strong>Doi Suthep temple:</strong> Climb the golden mountaintop temple overlooking the city.</li><li><strong>Jungle trekking & waterfalls:</strong> Hike through the rainforest of northern Thailand to hidden waterfalls.</li><li><strong>Old City temples:</strong> Explore the walled old town of Chiang Mai, home to over 300 Buddhist temples.</li><li><strong>Night bazaar:</strong> Shop for handwoven textiles and hill-tribe crafts at a famous market in Chiang Mai.</li></ul>'
  },

  // Canada
  {
    id: '28',
    slug: 'banff-wildlife-and-rockies-trail',
    title: 'Banff Wildlife & Rockies Trail',
    category: 'wildlife',
    packageType: 'regular',
    location: 'Banff, Canada',
    days: 6,
    nights: 5,
    price: 2299,
    rating: 3,
    reviewCount: 101,
    country: 'canada',
    images: countryImages('canada', 1),
    tripInformation:
      '<ul><li><strong>Lake Louise & Moraine Lake:</strong> Photograph turquoise glacial lakes framed by the Canadian Rockies.</li><li><strong>Wildlife safari drives:</strong> Spot elk, black bears, and bighorn sheep along the Icefields Parkway.</li><li><strong>Banff Gondola:</strong> Ride to the summit of Sulphur Mountain for panoramic Rockies views.</li><li><strong>Johnston Canyon hike:</strong> Walk catwalks beside cascading waterfalls carved through limestone canyon walls.</li><li><strong>Banff hot springs:</strong> Soak in natural mineral hot springs with mountain views.</li></ul>'
  },
  {
    id: '29',
    slug: 'niagara-falls-getaway',
    title: 'Niagara Falls Getaway',
    category: 'adventure',
    packageType: 'regular',
    location: 'Niagara Falls, Canada',
    days: 3,
    nights: 2,
    price: 899,
    rating: 4.5,
    reviewCount: 187,
    country: 'canada',
    images: countryImages('canada', 2),
    isTrending: true,
    tripInformation:
      "<ul><li><strong>Horseshoe Falls boat tour:</strong> Ride the Hornblower boat into the mist at the base of the falls.</li><li><strong>Journey Behind the Falls:</strong> Descend tunnels leading to viewing portals behind the cascading water.</li><li><strong>Niagara Parkway cycling:</strong> Bike the scenic route along the Niagara River gorge.</li><li><strong>Niagara-on-the-Lake wineries:</strong> Taste ice wine at boutique vineyards near the historic town.</li><li><strong>Skylon Tower views:</strong> Take in a bird's-eye view of both the Canadian and American falls.</li></ul>"
  },

  // Australia
  {
    id: '30',
    slug: 'great-barrier-reef-discovery',
    title: 'Great Barrier Reef Discovery',
    category: 'adventure',
    packageType: 'premium',
    location: 'Cairns, Australia',
    days: 6,
    nights: 5,
    price: 2799,
    rating: 4.8,
    reviewCount: 112,
    country: 'australia',
    images: countryImages('australia', 3),
    isRecommended: true,
    tripInformation:
      '<ul><li><strong>Outer Reef snorkeling:</strong> Swim alongside clownfish and sea turtles on a pristine coral reef.</li><li><strong>Scuba diving certification:</strong> Learn to dive or explore deeper reef sites with certified instructors.</li><li><strong>Scenic reef flight:</strong> See the colors of the reef and the Heart Reef formation from a helicopter or seaplane.</li><li><strong>Daintree Rainforest:</strong> Explore the oldest tropical rainforest in the world, just north of Cairns.</li><li><strong>Glass-bottom boat tour:</strong> View coral gardens and marine life without getting wet.</li></ul>'
  },
  {
    id: '31',
    slug: 'sydney-harbour-explorer',
    title: 'Sydney Harbour Explorer',
    category: 'cultural',
    packageType: 'regular',
    location: 'Sydney, Australia',
    days: 5,
    nights: 4,
    price: 1899,
    rating: 4.6,
    reviewCount: 165,
    country: 'australia',
    images: countryImages('australia', 1),
    tripInformation:
      '<ul><li><strong>Sydney Opera House tour:</strong> Go behind the scenes of one of the most iconic architectural landmarks in Australia.</li><li><strong>Harbour Bridge Climb:</strong> Ascend to the summit for 360-degree views of Sydney Harbour.</li><li><strong>Bondi to Coogee coastal walk:</strong> Follow the clifftop trail past the famous beaches of Sydney.</li><li><strong>Circular Quay ferry ride:</strong> Cruise the harbour past Fort Denison and Taronga Zoo.</li><li><strong>The Rocks markets:</strong> Browse the oldest neighborhood in Sydney for local art and weekend markets.</li></ul>'
  },

  // Russia
  {
    id: '32',
    slug: 'moscow-kremlin-and-red-square',
    title: 'Moscow Kremlin & Red Square',
    category: 'cultural',
    packageType: 'regular',
    location: 'Moscow, Russia',
    days: 5,
    nights: 4,
    price: 1799,
    rating: 4.5,
    reviewCount: 77,
    country: 'russia',
    images: countryImages('russia', 1),
    tripInformation:
      '<ul><li><strong>Red Square & St. Basil\'s Cathedral:</strong> See Moscow\'s iconic onion domes and historic central square.</li><li><strong>The Kremlin & Armoury Chamber:</strong> Tour the seat of Russian power and its imperial treasures.</li><li><strong>Moscow Metro architecture:</strong> Ride the ornate "underground palaces" built in the Soviet era.</li><li><strong>Bolshoi Theatre:</strong> Attend a ballet or opera performance at the most famous stage in Russia.</li><li><strong>GUM department store:</strong> Browse the historic 19th-century shopping arcade facing Red Square.</li></ul>'
  },
  {
    id: '33',
    slug: 'saint-petersburg-palace-tour',
    title: 'Saint Petersburg Palace Tour',
    category: 'cultural',
    packageType: 'regular',
    location: 'Saint Petersburg, Russia',
    days: 5,
    nights: 4,
    price: 1949,
    rating: 4.6,
    reviewCount: 64,
    country: 'russia',
    images: countryImages('russia', 2),
    tripInformation:
      '<ul><li><strong>The Hermitage Museum:</strong> Explore one of the largest art collections in the world inside the Winter Palace.</li><li><strong>Peterhof Palace gardens:</strong> Walk through the "Russian Versailles" and its gold-gilded fountains.</li><li><strong>Church of the Savior on Spilled Blood:</strong> Admire mosaic-covered domes rivaling St. Basil\'s in color.</li><li><strong>Neva River canal cruise:</strong> See the city\'s bridges and pastel palaces from the water.</li><li><strong>Catherine Palace & Amber Room:</strong> Visit the reconstructed Amber Room inside this imperial summer palace.</li></ul>'
  },

  // USA
  {
    id: '34',
    slug: 'new-york-city-explorer',
    title: 'New York City Explorer',
    category: 'cultural',
    packageType: 'regular',
    location: 'New York City, USA',
    days: 5,
    nights: 4,
    price: 2199,
    rating: 4.7,
    reviewCount: 241,
    country: 'usa',
    images: countryImages('usa', 2),
    isTrending: true,
    tripInformation:
      "<ul><li><strong>Statue of Liberty & Ellis Island:</strong> Ferry out to two of America's most iconic landmarks.</li><li><strong>Times Square & Broadway:</strong> Catch a Broadway show beneath the neon lights of Times Square.</li><li><strong>Central Park:</strong> Walk, bike, or picnic across Manhattan's 843-acre green heart.</li><li><strong>Top of the Rock:</strong> Take in skyline views from Rockefeller Center's observation deck.</li><li><strong>Museum Mile:</strong> Visit world-class museums including the Met and the Museum of Natural History.</li></ul>"
  },
  {
    id: '35',
    slug: 'grand-canyon-adventure',
    title: 'Grand Canyon Adventure',
    category: 'adventure',
    packageType: 'regular',
    location: 'Grand Canyon, Arizona, USA',
    days: 4,
    nights: 3,
    price: 1699,
    rating: 4,
    reviewCount: 96,
    country: 'usa',
    images: countryImages('usa', 1),
    tripInformation:
      "<ul><li><strong>South Rim viewpoints:</strong> Take in panoramic canyon views from Mather Point and Yavapai Observation Station.</li><li><strong>Grand Canyon hiking:</strong> Descend the Bright Angel Trail into the canyon's layered red-rock walls.</li><li><strong>Colorado River rafting:</strong> Navigate rapids carved through billions of years of geologic history.</li><li><strong>Sunset at Hopi Point:</strong> Watch the canyon walls glow red and orange at golden hour.</li><li><strong>Skywalk at Grand Canyon West:</strong> Step onto a glass horseshoe bridge suspended above the canyon floor.</li></ul>"
  }
]
