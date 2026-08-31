// Type Imports
import type { PackageDetail } from '@/types/packages/package-detail-types'

// Component Imports
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

type PackagePoliciesProps = {
  packageDetail: PackageDetail
}

const PackagePolicies = ({ packageDetail }: PackagePoliciesProps) => {
  const policies = [
    { title: 'Confirmation Policy', points: packageDetail.confirmationPolicy },
    { title: 'Refund Policy', points: packageDetail.refundPolicy },
    { title: 'Cancellation Policy', points: packageDetail.cancellationPolicy },
    { title: 'Payment Policy', points: packageDetail.paymentPolicy }
  ]

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-lg font-semibold'>Policies</h2>
      <Accordion defaultValue={[policies[0].title]} className='gap-2'>
        {policies.map(policy => (
          <AccordionItem key={policy.title} value={policy.title} className='rounded-lg border px-4'>
            <AccordionTrigger>{policy.title}</AccordionTrigger>
            <AccordionContent>
              <ul className='ml-4 flex list-disc flex-col gap-1.5'>
                {policy.points.map(point => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default PackagePolicies
