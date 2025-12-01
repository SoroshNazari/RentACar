import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import type { Vehicle, VehicleType } from '@/types'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)

const VehicleDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pickupDate, setPickupDate] = useState('')
  const [dropoffDate, setDropoffDate] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)
  const [rentalDays, setRentalDays] = useState(0)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [heroError, setHeroError] = useState(false)
  const [failedThumbs, setFailedThumbs] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (id) {
      loadVehicle()
    }
  }, [id])

  useEffect(() => {
    if (pickupDate && dropoffDate) {
      calculatePrice()
    }
  }, [pickupDate, dropoffDate, vehicle])

  useEffect(() => {
    setHeroError(false)
  }, [selectedImageIndex, vehicle])

  const loadVehicle = async () => {
    if (!id) {
      setLoading(false)
      setError('Invalid vehicle ID')
      return
    }
    setError(null)
    try {
      console.log('Loading vehicle with ID:', id)
      const data: any = await api.getVehicleById(Number(id))
      console.log('Loaded vehicle data (raw):', data)
      
      // Normalize licensePlate if it comes as an object
      const normalizedData: Vehicle = {
        ...data,
        licensePlate: typeof data.licensePlate === 'object' && data.licensePlate?.value 
          ? data.licensePlate.value 
          : data.licensePlate || ''
      }
      
      console.log('Loaded vehicle data (normalized):', normalizedData)
      setVehicle(normalizedData)
      setSelectedImageIndex(0)
    } catch (error: any) {
      console.error('Failed to load vehicle:', error)
      console.error('Error details:', error.response?.data || error.message)
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        setError('Backend server is not running. Please start it with: ./gradlew bootRun')
      } else if (error.response?.status === 404) {
        setError('Vehicle not found')
      } else if (error.response?.status === 403) {
        setError('Access denied. Please check your authentication.')
      } else if (error.response?.data) {
        setError(`Error: ${JSON.stringify(error.response.data)}`)
      } else {
        setError('Failed to load vehicle. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const calculatePrice = () => {
    if (!vehicle || !pickupDate || !dropoffDate) return
    const start = new Date(pickupDate)
    const end = new Date(dropoffDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    setRentalDays(days)
    const basePrice = days * vehicle.dailyPrice
    const taxes = basePrice * 0.13 // 13% taxes
    setTotalPrice(basePrice + taxes)
  }

  const images: string[] = (vehicle?.imageGallery && vehicle.imageGallery.length > 0
    ? vehicle.imageGallery
    : [vehicle?.imageUrl].filter(Boolean) as string[])

  const handleBookNow = () => {
    if (!pickupDate || !dropoffDate) {
      alert('Please select pickup and drop-off dates')
      return
    }
    if (new Date(pickupDate) >= new Date(dropoffDate)) {
      alert('Drop-off date must be after pickup date')
      return
    }
    navigate(`/booking/${id}?pickupDate=${pickupDate}&dropoffDate=${dropoffDate}`)
  }

  const getVehicleTypeLabel = (type: VehicleType): string => {
    const labels: Record<VehicleType, string> = {
      KLEINWAGEN: 'Economy',
      KOMPAKTKLASSE: 'Compact',
      MITTELKLASSE: 'Mid-size',
      OBERKLASSE: 'Premium',
      SUV: 'SUV',
      VAN: 'Van',
      SPORTWAGEN: 'Sports',
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Loading vehicle details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="card bg-red-500/10 border-red-500">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => navigate('/vehicles')} className="btn-primary">
            Back to Vehicles
          </button>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="card text-center">
          <p className="text-gray-400 text-lg mb-4">Vehicle not found</p>
          <button onClick={() => navigate('/vehicles')} className="btn-primary">
            Back to Vehicles
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-gray-400">
        <span className="hover:text-white cursor-pointer">Home</span>
        <span className="mx-2">/</span>
        <span className="hover:text-white cursor-pointer">Search Results</span>
        <span className="mx-2">/</span>
        <span className="text-white">
          {vehicle.brand} {vehicle.model}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="aspect-video bg-dark-700 rounded-lg mb-4 overflow-hidden">
              {(() => {
                const rawHero = normalizeImageUrl(images[selectedImageIndex])
                const hero = rawHero && rawHero.startsWith('http')
                  ? `/api/assets/image?url=${encodeURIComponent(rawHero)}`
                  : rawHero
                if (!hero || heroError) {
                  return (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-8xl">🚗</span>
                    </div>
                  )
                }
                return (
                  <img
                    src={hero || ''}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.currentTarget
                      if (hero && hero.startsWith('/api/assets/image')) {
                        img.src = rawHero || ''
                        img.onerror = () => setHeroError(true)
                      } else {
                        setHeroError(true)
                      }
                    }}
                  />
                )
              })()}
            </div>
            <div className="flex gap-2">
              {images.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 bg-dark-700 rounded-lg overflow-hidden cursor-pointer border-2 ${selectedImageIndex === idx ? 'border-primary-600' : 'border-transparent'} hover:border-primary-600`}
                  aria-label={`View image ${idx + 1}`}
                >
                  {url && !failedThumbs[idx] ? (
                    <img
                      src={(url.startsWith('http') ? `/api/assets/image?url=${encodeURIComponent(normalizeImageUrlWithWidth(url, 200))}` : url) || ''}
                      alt={`${vehicle!.brand} ${vehicle!.model} - View ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const img = e.currentTarget
                        if (url.startsWith('http') && img.src.startsWith('/api/assets/image')) {
                          img.src = url || ''
                          img.onerror = () => setFailedThumbs((prev) => ({ ...prev, [idx]: true }))
                        } else {
                          setFailedThumbs((prev) => ({ ...prev, [idx]: true }))
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">🚗</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="card mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              {vehicle.brand} {vehicle.model}
            </h1>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-yellow-400">★</span>
              <span className="text-white">4.8</span>
              <span className="text-gray-400">(122 reviews)</span>
            </div>

            {/* Specifications */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Make</p>
                  <p className="text-white font-semibold">{vehicle.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Model</p>
                  <p className="text-white font-semibold">{vehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Type</p>
                  <p className="text-white font-semibold">{getVehicleTypeLabel(vehicle.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Location</p>
                  <p className="text-white font-semibold">{vehicle.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Mileage</p>
                  <p className="text-white font-semibold">{vehicle.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">License Plate</p>
                  <p className="text-white font-semibold">{vehicle.licensePlate}</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
              <div className="flex flex-wrap gap-3">
                {['GPS Navigation', 'Bluetooth', 'Air Conditioning', 'Child Seat', 'USB Port', 'Reversing Camera'].map(
                  (feature) => (
                    <div
                      key={feature}
                      className="px-4 py-2 bg-dark-700 rounded-lg text-sm text-gray-300"
                    >
                      {feature}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
              <p className="text-gray-400 leading-relaxed">
                The {vehicle.brand} {vehicle.model} offers a perfect blend of comfort, reliability,
                and modern technology. With its spacious interior, smooth ride, and fuel-efficient
                engine, this vehicle is ideal for both city driving and long-distance travel. The
                car features advanced connectivity options including Bluetooth and GPS navigation,
                ensuring a convenient and enjoyable driving experience.
              </p>
            </div>
          </div>
        </div>

        {/* Booking Widget */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-white">{formatCurrency(vehicle.dailyPrice)}</span>
                <span className="text-gray-400">/ day</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <span>★</span>
                <span>Free Cancellation</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pick-up Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Drop-off Date
                </label>
                <input
                  type="date"
                  value={dropoffDate}
                  onChange={(e) => setDropoffDate(e.target.value)}
                  min={pickupDate || new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>
            </div>

            {rentalDays > 0 && (
              <div className="bg-dark-700 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">{formatCurrency(vehicle.dailyPrice)} x {rentalDays} days</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(vehicle.dailyPrice * rentalDays)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Taxes & Fees</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(totalPrice - vehicle.dailyPrice * rentalDays)}
                  </span>
                </div>
                <div className="border-t border-dark-600 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-white font-bold text-xl">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>
            )}

            <button onClick={handleBookNow} className="btn-primary w-full text-lg py-4">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VehicleDetailPage
const normalizeImageUrlWithWidth = (raw: string | undefined, width: number) => {
  if (!raw) return ''
  try {
    const u = new URL(normalizeImageUrl(raw))
    if (u.host === 'images.unsplash.com') {
      u.searchParams.set('w', String(width))
      u.searchParams.set('q', '80')
    } else if (u.host.endsWith('picsum.photos')) {
      const path = u.pathname.split('/')
      const idx = path.findIndex((p) => p === 'seed')
      if (idx !== -1) {
        path[path.length - 2] = String(width)
        path[path.length - 1] = String(width)
        u.pathname = path.join('/')
      }
    }
    return u.toString()
  } catch {
    return raw
  }
}
const normalizeImageUrl = (raw: string | undefined) => {
  if (!raw) return ''
  try {
    const u = new URL(raw)
    if (u.host === 'images.unsplash.com' && !u.searchParams.has('ixlib')) {
      u.searchParams.set('ixlib', 'rb-4.0.3')
      u.searchParams.set('auto', 'format')
      u.searchParams.set('fit', 'crop')
      if (!u.searchParams.has('w')) u.searchParams.set('w', '800')
      if (!u.searchParams.has('q')) u.searchParams.set('q', '80')
      return u.toString()
    }
    return raw
  } catch {
    return raw
  }
}
