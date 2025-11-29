export enum VehicleType {
  KLEINWAGEN = 'KLEINWAGEN',
  KOMPAKTKLASSE = 'KOMPAKTKLASSE',
  MITTELKLASSE = 'MITTELKLASSE',
  OBERKLASSE = 'OBERKLASSE',
  SUV = 'SUV',
  VAN = 'VAN',
  SPORTWAGEN = 'SPORTWAGEN',
}

export enum VehicleStatus {
  VERFÜGBAR = 'VERFÜGBAR',
  VERMIETET = 'VERMIETET',
  WARTUNG = 'WARTUNG',
  AUSSER_BETRIEB = 'AUSSER_BETRIEB',
}

export interface Vehicle {
  id: number
  licensePlate: string
  brand: string
  model: string
  type: VehicleType
  mileage: number
  location: string
  status: VehicleStatus
  dailyPrice: number
  imageUrl?: string
  createdAt?: string
  updatedAt?: string
}

