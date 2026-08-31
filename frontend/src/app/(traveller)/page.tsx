// Component Imports
import Process from '@/components/shadcn-studio/blocks/timeline-component-06/timeline-component-06'
import IntentComposer from '@/views/dealtrip/intent'

/**
 * How the desk works, as narrative.
 *
 * The scroll-driven reveal is honest here in a way it would not be on the Trust
 * Timeline: these five steps are a description of the product, not a record of
 * what happened, so tying progress to scroll position misrepresents nothing.
 */
const HOW_IT_WORKS = [
  {
    id: '01',
    title: 'Describe the trip',
    content:
      'Say what you want in your own words. DealTrip turns it into explicit constraints — and shows you the parse before anything is negotiated, so a misread must-have never becomes a hard gate you did not set.'
  },
  {
    id: '02',
    title: 'Merchants are discovered',
    content:
      'Every merchant in your destination publishes a machine-readable catalog. The desk contacts each of them at once with your constraints, not a search query.'
  },
  {
    id: '03',
    title: 'Agents negotiate',
    content:
      'Each merchant agent composes a package and defends its own margin. When one is not winning, the desk tells it exactly what it would have to beat — and a merchant that cannot reach your target says so rather than pretending.'
  },
  {
    id: '04',
    title: 'The Commerce Guard rules',
    content:
      'Twelve deterministic checks on every offer, including recomputing the price from the merchant catalog. An agent cannot invent a price, breach a discount ceiling or cross a margin floor — those are refused, not repriced.'
  },
  {
    id: '05',
    title: 'You approve, Razorpay settles',
    content:
      'Nothing is charged until you approve one specific offer. The guard re-runs before an order exists, the amount is recomputed server-side, and the payment signature is verified before anything is called booked.'
  }
]

export const metadata = {
  title: 'DealTrip — the agentic deal desk for travel',
  description:
    'Describe the trip you want. DealTrip turns it into hard constraints and negotiates with merchant agents on your behalf.'
}

const IntentPage = () => (
  <>
    <IntentComposer />
    <div className='border-t'>
      <Process
        data={HOW_IT_WORKS}
        eyebrow='How it works'
        title='Intent in, a defensible deal out'
        description='Five steps between what you asked for and what you paid for — each one recorded, and each one checkable afterwards.'
      />
    </div>
  </>
)

export default IntentPage
