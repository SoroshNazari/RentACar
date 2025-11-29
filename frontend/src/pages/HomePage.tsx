import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import type { Vehicle, VehicleType } from '@/types'

const HomePage = () => {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState({
    location: '',
    pickupDate: '',
    dropoffDate: '',
    vehicleType: '' as VehicleType | '',
  })
  
  // Set default dropoff date to 3 days after pickup
  useEffect(() => {
    if (searchParams.pickupDate && !searchParams.dropoffDate) {
      const pickup = new Date(searchParams.pickupDate)
      const dropoff = new Date(pickup)
      dropoff.setDate(dropoff.getDate() + 3)
      setSearchParams(prev => ({
        ...prev,
        dropoffDate: dropoff.toISOString().split('T')[0]
      }))
    }
  }, [searchParams.pickupDate])

  useEffect(() => {
    loadFeaturedVehicles()
  }, [])

  // Set default dropoff date to 3 days after pickup
  useEffect(() => {
    if (searchParams.pickupDate && !searchParams.dropoffDate) {
      const pickup = new Date(searchParams.pickupDate)
      const dropoff = new Date(pickup)
      dropoff.setDate(dropoff.getDate() + 3)
      setSearchParams(prev => ({
        ...prev,
        dropoffDate: dropoff.toISOString().split('T')[0]
      }))
    }
  }, [searchParams.pickupDate])

  const loadFeaturedVehicles = async () => {
    try {
      const allVehicles: any[] = await api.getAllVehicles()
      // Normalize licensePlate if it comes as an object
      const normalized = allVehicles.map((v: any) => ({
        ...v,
        licensePlate: typeof v.licensePlate === 'object' && v.licensePlate?.value 
          ? v.licensePlate.value 
          : v.licensePlate || ''
      }))
      // Show first 3 available vehicles as featured
      setVehicles(normalized.filter((v) => v.status === 'VERFÜGBAR').slice(0, 3))
    } catch (error: any) {
      console.error('Failed to load vehicles:', error)
      // Silently fail - backend might not be running
      // In production, you might want to show a user-friendly message
      if (error.code === 'ECONNREFUSED') {
        console.warn('Backend server is not running. Please start it with: ./gradlew bootRun')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (!searchParams.location || !searchParams.pickupDate || !searchParams.dropoffDate) {
      alert('Bitte füllen Sie alle Suchfelder aus')
      return
    }
    if (new Date(searchParams.pickupDate) >= new Date(searchParams.dropoffDate)) {
      alert('Das Rückgabedatum muss nach dem Abholdatum liegen')
      return
    }
    // Navigate to search results or vehicle list
    const params = new URLSearchParams({
      location: searchParams.location,
      startDate: searchParams.pickupDate,
      endDate: searchParams.dropoffDate,
    })
    if (searchParams.vehicleType) {
      params.append('vehicleType', searchParams.vehicleType)
    }
    navigate(`/vehicles?${params.toString()}`)
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 to-dark-800/70 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920')",
            filter: 'blur(2px)',
          }}
        />
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Premium Car Rental Made Simple
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            Explore our fleet of top-tier vehicles for any occasion.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/vehicles')}
              className="btn-primary text-lg px-8"
            >
              Browse Vehicles
            </button>
            <button className="btn-secondary text-lg px-8">Learn More</button>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="container mx-auto px-4 -mt-12 relative z-30">
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="City, Airport, or Address"
                value={searchParams.location}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, location: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pick-up Date
              </label>
              <input
                type="date"
                value={searchParams.pickupDate}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, pickupDate: e.target.value })
                }
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
                value={searchParams.dropoffDate}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, dropoffDate: e.target.value })
                }
                min={searchParams.pickupDate || new Date().toISOString().split('T')[0]}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vehicle Type
              </label>
              <select
                value={searchParams.vehicleType}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    vehicleType: e.target.value as VehicleType | '',
                  })
                }
                className="input-field"
              >
                <option value="">Any Type</option>
                <option value="KLEINWAGEN">Economy</option>
                <option value="KOMPAKTKLASSE">Compact</option>
                <option value="MITTELKLASSE">Mid-size</option>
                <option value="OBERKLASSE">Premium</option>
                <option value="SUV">SUV</option>
                <option value="VAN">Van</option>
                <option value="SPORTWAGEN">Sports</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={handleSearch} className="btn-primary w-full">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Best Prices Guaranteed
            </h3>
            <p className="text-gray-400">
              We offer competitive rates on our entire fleet of premium vehicles.
            </p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              24/7 Customer Support
            </h3>
            <p className="text-gray-400">
              Our dedicated support team is here to help you around the clock.
            </p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Fully Insured Rentals
            </h3>
            <p className="text-gray-400">
              Drive with peace of mind knowing every rental is comprehensively insured.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white mb-4">Our Featured Vehicles</h2>
        <p className="text-gray-400 mb-8">
          Discover a selection of our most popular cars, perfect for any journey.
        </p>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No vehicles available at the moment.</p>
            <p className="text-gray-500 text-sm">
              Please check back later or contact support if the problem persists.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="card hover:border-primary-600 transition-colors">
                <div className="aspect-video bg-dark-700 rounded-lg mb-4 overflow-hidden">
                  {vehicle.imageUrl ? (
                    <img
                      src={vehicle.imageUrl}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback zu Emoji wenn Bild nicht lädt
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement!.innerHTML = '<span class="text-4xl flex items-center justify-center h-full">🚗</span>'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">🚗</span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <p className="text-gray-400 mb-4">{getVehicleTypeLabel(vehicle.type)}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    ${vehicle.dailyPrice}/day
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                  className="btn-primary w-full"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default HomePage

