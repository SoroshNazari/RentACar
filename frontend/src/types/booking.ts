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
}

