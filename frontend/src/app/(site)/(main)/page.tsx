// Component Imports
import HomeView from '@/views/pages/home'

// Data Imports
import { getHomePageData } from '@/app/server/actions'

const HomePage = async () => {
  const { popularDestinations, recommendedPackages, testimonials, faqs } = await getHomePageData()

  return (
    <HomeView
      popularDestinations={popularDestinations}
      recommendedPackages={recommendedPackages}
      testimonials={testimonials}
      faqs={faqs}
    />
  )
}

export default HomePage
