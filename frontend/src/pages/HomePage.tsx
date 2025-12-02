import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
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

  // Load featured vehicles on mount
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
        dropoffDate: dropoff.toISOString().split('T')[0],
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.pickupDate])

  const loadFeaturedVehicles = async () => {
    try {
      // OPTIMIZATION: Only load available vehicles and limit to 3 immediately
      // This reduces API response size and processing time
      const allVehicles = await api.getAllVehicles()

      // Early return if no vehicles
      if (!allVehicles || allVehicles.length === 0) {
        setVehicles([])
        setLoading(false)
        return
      }

      const normalizePlate = (val: unknown): string => {
        if (val == null) return ''
        if (typeof val === 'string') return val
        if (typeof val === 'object' && val !== null) {
          const maybe = val as { value?: unknown }
          if (typeof maybe.value === 'string') return maybe.value
        }
        return String(val)
      }

      // OPTIMIZATION: Filter and slice in one pass, limit processing
      const featured = allVehicles
        .filter(v => v.status === 'VERFÜGBAR')
        .slice(0, 3)
        .map(v => ({
          ...v,
          licensePlate: normalizePlate(v.licensePlate as unknown),
        }))

      setVehicles(featured)
    } catch (error: unknown) {
      const e = error as { code?: string }
      // Silently fail - backend might not be running
      // Don't log errors in production to avoid performance impact
      // Only log in development mode (check via process.env or mode)
      if (process.env.NODE_ENV === 'development' && e.code === 'ECONNREFUSED') {
        console.warn('Backend server is not running. Please start it with: ./gradlew bootRun')
      }
      setVehicles([]) // Set empty array on error
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
      KLEINWAGEN: 'Kleinwagen',
      KOMPAKTKLASSE: 'Komaktklasse',
      MITTELKLASSE: 'Mittelklasse',
      OBERKLASSE: 'Oberklasse',
      SUV: 'SUV',
      VAN: 'Van',
      SPORTWAGEN: 'Sportwagen',
    }
    return labels[type] || type
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 to-dark-800/70 z-10" />
        {(() => {
          const raw = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920'
          const proxied = `/api/assets/image?url=${encodeURIComponent(raw)}`
          return (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${proxied}')`,
                filter: 'blur(2px)',
              }}
            />
          )
        })()}
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Premium Autovermietung einfach gemacht
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            Entdecke unsere Flotte erstklassiger Fahrzeuge für jeden Anlass.
          </p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/vehicles')} className="btn-primary text-lg px-8">
              Fahrzeuge durchsuchen
            </button>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="container mx-auto px-4 -mt-12 relative z-30">
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Standort</label>
              <input
                type="text"
                placeholder="Stadt, Flughafen oder Adresse"
                value={searchParams.location}
                onChange={e => setSearchParams({ ...searchParams, location: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label
                htmlFor="homePickupDate"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Abholdatum
              </label>
              <input
                id="homePickupDate"
                type="date"
                value={searchParams.pickupDate}
                onChange={e => setSearchParams({ ...searchParams, pickupDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="input-field"
                aria-required="false"
              />
            </div>
            <div>
              <label
                htmlFor="homeDropoffDate"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Rückgabedatum
              </label>
              <input
                id="homeDropoffDate"
                type="date"
                value={searchParams.dropoffDate}
                onChange={e => setSearchParams({ ...searchParams, dropoffDate: e.target.value })}
                min={searchParams.pickupDate || new Date().toISOString().split('T')[0]}
                className="input-field"
                aria-required="false"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fahrzeugtyp</label>
              <select
                value={searchParams.vehicleType}
                onChange={e =>
                  setSearchParams({
                    ...searchParams,
                    vehicleType: e.target.value as VehicleType | '',
                  })
                }
                className="input-field"
              >
                <option value="">Beliebig</option>
                <option value="KLEINWAGEN">Kleinwagen</option>
                <option value="KOMPAKTKLASSE">Komaktklasse</option>
                <option value="MITTELKLASSE">Mittelklasse</option>
                <option value="OBERKLASSE">Oberklasse</option>
                <option value="SUV">SUV</option>
                <option value="VAN">Van</option>
                <option value="SPORTWAGEN">Sportwagen</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={handleSearch} className="btn-primary w-full">
                Suchen
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
            <h3 className="text-xl font-semibold text-white mb-2">Beste Preise garantiert</h3>
            <p className="text-gray-400">
              Wir bieten wettbewerbsfähige Preise für unsere gesamte Flotte von Premium-Fahrzeugen.
            </p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">24/7 Kundensupport</h3>
            <p className="text-gray-400">
              Unser engagiertes Support-Team ist rund um die Uhr für dich da.
            </p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Vollständig versicherte Mieten
            </h3>
            <p className="text-gray-400">
              Fahre mit ruhigem Gewissen, da jede Miete umfassend versichert ist.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white mb-4">Unsere Featured Fahrzeuge</h2>
        <p className="text-gray-400 mb-8">
          Entdecke eine Auswahl unserer beliebtesten Autos, perfekt für jede Reise.
        </p>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Fahrzeuge werden geladen...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Derzeit sind keine Fahrzeuge verfügbar.</p>
            <p className="text-gray-300 text-sm">
              Bitte schaue später noch einmal vorbei oder kontaktiere den Support, wenn das Problem
              weiterhin besteht.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="card hover:border-primary-600 transition-colors">
                <div className="aspect-video bg-dark-700 rounded-lg mb-4 overflow-hidden">
                  {(() => {
                    const rawHero =
                      (vehicle.imageGallery && vehicle.imageGallery[0]) || vehicle.imageUrl
                    const hero =
                      rawHero && rawHero.startsWith('http')
                        ? `/api/assets/image?url=${encodeURIComponent(rawHero)}`
                        : rawHero
                    if (!hero) {
                      return (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">🚗</span>
                        </div>
                      )
                    }
                    return (
                      <img
                        src={hero || ''}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                        onError={e => {
                          const img = e.currentTarget
                          if (hero && hero.startsWith('/api/assets/image')) {
                            img.src = rawHero || ''
                            img.onerror = () => {
                              img.style.display = 'none'
                              if (img.parentElement) {
                                img.parentElement.innerHTML =
                                  '<span class="text-4xl flex items-center justify-center h-full">🚗</span>'
                              }
                            }
                          } else {
                            img.style.display = 'none'
                            if (img.parentElement) {
                              img.parentElement.innerHTML =
                                '<span class="text-4xl flex items-center justify-center h-full">🚗</span>'
                            }
                          }
                        }}
                      />
                    )
                  })()}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <p className="text-gray-400 mb-4">{getVehicleTypeLabel(vehicle.type)}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
                      vehicle.dailyPrice
                    )}
                    /Tag
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                  className="btn-primary w-full"
                >
                  Jetzt buchen
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

            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default HomePage
