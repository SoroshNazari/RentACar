import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '@/services/api'
import type { Vehicle, VehicleType } from '@/types'

const VehicleListPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const location = searchParams.get('location') || ''
  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''
  const vehicleType = searchParams.get('vehicleType') as VehicleType | null

  useEffect(() => {
    loadVehicles()
  }, [location, startDate, endDate, vehicleType])

  const loadVehicles = async () => {
    setLoading(true)
    setError(null)

    try {
      let results: Vehicle[] = []
      if (location && startDate && endDate && vehicleType) {
        // Search with filters
        results = await api.searchAvailableVehicles(
          vehicleType,
          location,
          startDate,
          endDate
        )
      } else {
        // Show all available vehicles
        results = await api.getAllVehicles()
        results = results.filter((v) => v.status === 'VERFÜGBAR')
      }
      
      // Normalize licensePlate if it comes as an object
      results = results.map((v: any) => ({
        ...v,
        licensePlate: typeof v.licensePlate === 'object' && v.licensePlate?.value 
          ? v.licensePlate.value 
          : v.licensePlate || ''
      }))
      
      console.log('Loaded vehicles:', results)
      setVehicles(results)
    } catch (err: any) {
      console.error('Failed to load vehicles:', err)
      console.error('Error details:', err.response?.data || err.message)
      setError('Failed to load vehicles. Please try again later.')
      if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED')) {
        setError('Backend server is not running. Please start it with: ./gradlew bootRun')
      } else if (err.response?.status === 403) {
        setError('Access denied. Please check your authentication.')
      } else if (err.response?.data) {
        setError(`Error: ${JSON.stringify(err.response.data)}`)
      }
    } finally {
      setLoading(false)
    }
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
          <p className="text-gray-400 text-lg">Loading vehicles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="card bg-red-500/10 border-red-500">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Available Vehicles</h1>
        {location && startDate && endDate && (
          <p className="text-gray-400">
            Showing vehicles available from {new Date(startDate).toLocaleDateString()} to{' '}
            {new Date(endDate).toLocaleDateString()} in {location}
          </p>
        )}
      </div>

      {vehicles.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-lg mb-4">No vehicles available</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="card hover:border-primary-600 transition-colors cursor-pointer"
              onClick={() => navigate(`/vehicle/${vehicle.id}`)}
            >
              <div className="aspect-video bg-dark-700 rounded-lg mb-4 overflow-hidden">
                {(() => {
                  const rawHero = normalizeImageUrl((vehicle.imageGallery && vehicle.imageGallery[0]) || vehicle.imageUrl)
                  const hero = rawHero && rawHero.startsWith('http')
                    ? `/api/assets/image?url=${encodeURIComponent(rawHero)}`
                    : rawHero
                  if (!hero) {
                    return (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">🚗</span>
                      </div>
                    )
                  }
                  return (
                    <img
                      src={hero || ''}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.currentTarget
                        if (hero && hero.startsWith('/api/assets/image')) {
                          img.src = rawHero || ''
                          img.onerror = () => {
                            img.style.display = 'none'
                            img.parentElement!.innerHTML = '<span class="text-6xl flex items-center justify-center h-full">🚗</span>'
                          }
                        } else {
                          img.style.display = 'none'
                          img.parentElement!.innerHTML = '<span class="text-6xl flex items-center justify-center h-full">🚗</span>'
                        }
                      }}
                    />
                  )
                })()}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-gray-400 mb-2">{getVehicleTypeLabel(vehicle.type)}</p>
              <p className="text-sm text-gray-500 mb-4">Location: {vehicle.location}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-primary-600">
                  {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(vehicle.dailyPrice)}/day
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/vehicle/${vehicle.id}`)
                }}
                className="btn-primary w-full"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default VehicleListPage
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
