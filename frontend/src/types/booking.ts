export enum BookingStatus {
  ANFRAGE = 'ANFRAGE',
  BESTÄTIGT = 'BESTÄTIGT',
  ABGESCHLOSSEN = 'ABGESCHLOSSEN',
  STORNIERT = 'STORNIERT',
}

export interface Booking {
  id: number
  customerId: number
  vehicle: {
    id: number
    brand: string
    model: string
    licensePlate: string
    mileage?: number
    type: string
    dailyPrice: number
  }
  pickupDate: string
  returnDate: string
  pickupLocation: string
  returnLocation: string
  status: BookingStatus
  totalPrice: number
  cancellationDate?: string
  checkoutTime?: string
  checkoutMileage?: number
  checkoutNotes?: string
  checkinTime?: string
  checkinMileage?: number
  damagePresent?: boolean
  damageNotes?: string
  damageCost?: number
  extraMileageCost?: number
  lateFee?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateBookingRequest {
  customerId: number
  vehicleId: number
  pickupDate: string
  returnDate: string
  pickupLocation: string
  returnLocation: string
  insurance?: boolean
  additionalDriver?: boolean
  childSeat?: boolean
}
