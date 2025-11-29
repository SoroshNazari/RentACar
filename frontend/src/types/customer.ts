export interface Customer {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  driverLicenseNumber: string
  username: string
  createdAt?: string
  updatedAt?: string
}

export interface RegisterCustomerRequest {
  username: string
  password: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  driverLicenseNumber: string
}

export interface UpdateCustomerRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
}

