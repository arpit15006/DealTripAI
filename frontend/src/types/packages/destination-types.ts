export interface Destination {
  id: string
  key: string
  name: string
}

export type CreateDestinationInput = {
  name: string
  assignPackageIds?: string[]
}
