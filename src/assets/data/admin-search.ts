// Third-party Imports
import {
  FileJson2Icon,
  HistoryIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StoreIcon,
  TerminalIcon,
  TrendingUpIcon,
  UploadIcon
} from 'lucide-react'

// Type Imports
import type { SearchData } from '@/assets/data/search'

/** Command-palette index for the operator dashboard. */
export const adminSearchData: SearchData[] = [
  {
    title: 'Deal Desk',
    data: [
      { icon: LayoutDashboardIcon, name: 'Overview', href: '/dashboard', tags: ['home', 'dashboard'] },
      { icon: SparklesIcon, name: 'Start a new negotiation', href: '/', tags: ['intent', 'traveller', 'new'] },
      { icon: HistoryIcon, name: 'Negotiations', href: '/dashboard/negotiations', tags: ['history', 'runs'] }
    ]
  },
  {
    title: 'Merchants',
    data: [
      { icon: StoreIcon, name: 'All merchants', href: '/dashboard/merchants', tags: ['catalog', 'inventory'] },
      {
        icon: UploadIcon,
        name: 'Onboard a merchant',
        href: '/dashboard/merchants/onboard',
        tags: ['add', 'import', 'catalog']
      },
      {
        icon: ShieldCheckIcon,
        name: 'Policy Studio',
        href: '/dashboard/merchants',
        tags: ['discount', 'margin', 'guard', 'limits']
      }
    ]
  },
  {
    title: 'Insights',
    data: [
      {
        icon: TrendingUpIcon,
        name: 'Revenue simulator',
        href: '/dashboard/simulator',
        tags: ['revenue', 'conversion', 'margin', 'evaluation']
      }
    ]
  },
  {
    title: 'Developers',
    data: [
      { icon: TerminalIcon, name: 'Agent API', href: '/dashboard/agent-api', tags: ['curl', 'endpoints', 'quote'] },
      {
        icon: FileJson2Icon,
        name: 'Discovery document',
        href: '/.well-known/agent-commerce.json',
        openInNewTab: true,
        tags: ['well-known', 'agent', 'discovery']
      }
    ]
  }
]
