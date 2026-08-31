export interface CurrentUserAddress {
  country: string
  city: string
  streetAddress: string
  zipCode: string
}

export interface CurrentUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar: string
  birthday: string
  gender: 'male' | 'female' | 'other'
  address: CurrentUserAddress
}
