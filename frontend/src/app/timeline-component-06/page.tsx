import Process from '@/components/shadcn-studio/blocks/timeline-component-06/timeline-component-06'

const processSteps = [
  {
    id: '01',
    title: 'Discover & Strategy',
    content: 'Through discovery workshops and research, we start by defining a strategy aligned with your vision.'
  },
  {
    id: '02',
    title: 'UX & Visual Design',
    content:
      'We map out user journeys, project milestones, and deliverables ensuring a smooth, transparent workflow from start to finish.'
  },
  {
    id: '03',
    title: 'Development',
    content: 'Our team crafts purposeful designs, copy, and branding that communicate clearly and convert.'
  },
  {
    id: '04',
    title: 'Testing & Optimization',
    content:
      "Whether it's no-code or custom, we bring your digital presence to life with pixel-perfect execution and performance optimization."
  },
  {
    id: '05',
    title: 'Launch & Support',
    content:
      'Post-launch, we stay close, monitoring performance, making refinements, and helping your brand adapt and grow continuously.'
  }
]

const TimelinePage = () => {
  return <Process data={processSteps} />
}

export default TimelinePage
