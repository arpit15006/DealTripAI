type TripInformationProps = {
  tripInformation: string
}

const TripInformation = ({ tripInformation }: TripInformationProps) => {
  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-lg font-semibold'>Trip Information</h2>
      <div
        className='text-muted-foreground [&_a]:text-primary [&_h2]:text-foreground [&_h3]:text-foreground flex flex-col gap-3 leading-relaxed [&_a]:underline [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_ol]:ml-4 [&_ol]:list-decimal [&_ul]:ml-4 [&_ul]:list-disc'
        dangerouslySetInnerHTML={{ __html: tripInformation }}
      />
    </div>
  )
}

export default TripInformation
