// Third-party Imports
import { ChevronDownIcon, ChevronUpIcon, EllipsisVerticalIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

// SVGs Imports
import FacebookIcon from '@/assets/svg/facebook-icon'
import InstagramIcon from '@/assets/svg/instagram-icon'
import LinkedinIcon from '@/assets/svg/linkedin-icon'
import SnapchatIcon from '@/assets/svg/snapchat-icon'
import TwitterIcon from '@/assets/svg/twitter-icon'
import YoutubeIcon from '@/assets/svg/youtube-icon'

// Utils Imports
import { cn } from '@/lib/utils'

const listItems = ['Share', 'Update', 'Refresh']

const socialStats = [
  { icon: YoutubeIcon, value: '2,344', label: 'Subscribers' },
  { icon: InstagramIcon, value: '1,283', label: 'Followers' },
  { icon: LinkedinIcon, value: '1,004', label: 'Followers' },
  { icon: TwitterIcon, value: '2,344', label: 'Following' },
  { icon: SnapchatIcon, value: '1,283', label: 'Views' },
  { icon: FacebookIcon, value: '1,004', label: 'Messages' }
]

type PageStat = { label: string; value: string; trend: 'up' | 'down'; changePercentage: string; comparison: string }

const engagementStats: PageStat[] = [
  { label: 'Total Engagement', value: '8,921', trend: 'up', changePercentage: '12%', comparison: 'Vs 7,963' },
  { label: 'New Engagement', value: '1,204', trend: 'down', changePercentage: '6%', comparison: 'Vs 1,281' }
]

const followerStats: PageStat[] = [
  { label: 'Total Followers', value: '2,344', trend: 'down', changePercentage: '80%', comparison: 'Vs 11,793' },
  { label: 'New Followers', value: '432', trend: 'up', changePercentage: '34%', comparison: 'Vs 321' }
]

const StatPairRow = ({ stats }: { stats: PageStat[] }) => (
  <CardContent className='flex gap-4'>
    {stats.map((stat, index) => (
      <div key={stat.label} className='flex flex-1 items-center gap-4'>
        {index > 0 && (
          <>
            <Separator orientation='vertical' className='self-stretch' />
          </>
        )}
        <div className='flex flex-1 flex-col items-center gap-1'>
          <span className='text-muted-foreground text-sm'>{stat.label}</span>
          <span className='text-2xl font-semibold'>{stat.value}</span>
          <div className='flex items-center gap-1 text-sm'>
            <span
              className={cn(
                'flex items-center',
                stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-destructive'
              )}
            >
              {stat.trend === 'up' ? <ChevronUpIcon className='size-4' /> : <ChevronDownIcon className='size-4' />}
              {stat.changePercentage}
            </span>
            <span className='text-muted-foreground'>{stat.comparison}</span>
          </div>
        </div>
      </div>
    ))}
  </CardContent>
)

const SocialMediaWidget = ({ className }: { className?: string }) => {
  return (
    <Card className={className}>
      <CardHeader className='flex items-start justify-between'>
        <span className='text-lg font-semibold'>Social Media Overview</span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant='ghost' size='icon' className='text-muted-foreground size-6 rounded-full' />}
          >
            <EllipsisVerticalIcon />
            <span className='sr-only'>Menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuGroup>
              {listItems.map((item, index) => (
                <DropdownMenuItem key={index}>{item}</DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col gap-4'>
        <span className='text-muted-foreground text-sm font-medium'>Followers Stats</span>
        <div className='grid grid-cols-3 gap-x-4 gap-y-6'>
          {socialStats.map((stat, index) => (
            <div key={index} className='flex flex-col items-center gap-2'>
              <div className='bg-primary/10 flex size-12 items-center justify-center overflow-hidden rounded-lg'>
                <stat.icon className='text-primary size-7 object-contain' />
              </div>
              <p className='flex flex-col text-center'>
                <span className='text-base font-semibold'>{stat.value}</span>
                <span className='text-muted-foreground text-xs'>{stat.label}</span>
              </p>
            </div>
          ))}
        </div>
      </CardContent>

      <Separator />
      <StatPairRow stats={engagementStats} />

      <Separator />
      <StatPairRow stats={followerStats} />
    </Card>
  )
}

export default SocialMediaWidget
