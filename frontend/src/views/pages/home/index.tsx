// Type Imports
import type { Faq, PopularDestination, RecommendedPackage, Testimonial } from '@/types/pages/home-types'

// Component Imports
import HeroSection from '@/views/pages/home/hero-section'
import PopularDestinations from '@/views/pages/home/popular-destinations'
import RecommendedPackages from '@/views/pages/home/recommended-packages'
import SpecialOffers from '@/views/pages/home/special-offers'
import Testimonials from '@/views/pages/home/testimonials/testimonials'
import FaqSection from '@/views/pages/home/faq-section'

type HomeViewProps = {
  popularDestinations: PopularDestination[]
  recommendedPackages: RecommendedPackage[]
  testimonials: Testimonial[]
  faqs: Faq[]
}

const HomeView = ({ popularDestinations, recommendedPackages, testimonials, faqs }: HomeViewProps) => {
  return (
    <div className='flex flex-col'>
      <HeroSection popularDestinations={popularDestinations} />
      <PopularDestinations popularDestinations={popularDestinations} />
      <RecommendedPackages recommendedPackages={recommendedPackages} />
      <SpecialOffers />
      <Testimonials testimonials={testimonials} />
      <FaqSection faqs={faqs} />
    </div>
  )
}

export default HomeView
