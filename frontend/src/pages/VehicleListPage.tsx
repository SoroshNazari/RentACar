import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '@/services/api'
import type { Vehicle, VehicleType } from '@/types'

// Helper function defined outside the component to avoid recreation on render
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, startDate, endDate, vehicleType])

  const loadVehicles = async () => {
    setLoading(true)
    setError(null)

    try {
      let results: Vehicle[] = []
      if (location && startDate && endDate && vehicleType) {
        // Search with filters
        results = await api.searchAvailableVehicles(vehicleType, location, startDate, endDate)
      } else {
        // Show all available vehicles
        results = await api.getAllVehicles()
        results = results.filter(v => v.status === 'VERFÜGBAR')
      }

      // API normalizes licensePlate; keep a defensive fallback
      const normalizePlate = (val: unknown): string => {
        if (val == null) return ''
        if (typeof val === 'string') return val
        if (typeof val === 'object' && val !== null) {
          const maybe = val as { value?: unknown }
          if (typeof maybe.value === 'string') return maybe.value
        }
        return String(val)
      }
      results = results.map(v => ({
        ...v,
        licensePlate: normalizePlate((v as unknown as { licensePlate?: unknown }).licensePlate),
      }))

      setVehicles(results)
    } catch (err: unknown) {
      const e = err as {
        code?: string
        message?: string
        response?: { status?: number; data?: unknown }
      }
      console.error('Failed to load vehicles:', e)
      console.error('Error details:', e.response?.data || e.message)
      setError('Fahrzeuge konnten nicht geladen werden. Bitte versuchen Sie es später erneut.')
      if (e.code === 'ECONNREFUSED' || e.message?.includes('ECONNREFUSED')) {
        setError('Backend-Server läuft nicht. Bitte starten Sie ihn mit: ./gradlew bootRun')
      } else if (e.response?.status === 403) {
        setError('Zugriff verweigert. Bitte überprüfen Sie Ihre Authentifizierung.')
      } else if (e.response?.data) {
        setError(`Fehler: ${JSON.stringify(e.response.data)}`)
      }
    } finally {
      setLoading(false)
    }
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

  // Zentraler Handler für Klicks auf Fahrzeuge (prüft Login)
  const handleVehicleClick = (vehicleId: number) => {
    const token = localStorage.getItem('token') // Prüfen, ob User eingeloggt ist

    if (!token) {
      // Nicht eingeloggt -> Redirect zum Login mit Nachricht
      navigate('/login?message=login_required')
      return
    }

    // Eingeloggt -> Weiter zum Fahrzeug
    navigate(`/vehicle/${vehicleId}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Fahrzeuge werden geladen...</p>
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
        <h1 className="text-3xl font-bold text-white mb-2">Verfügbare Fahrzeuge</h1>
        {location && startDate && endDate && (
          <p className="text-gray-400">
            Zeige Fahrzeuge verfügbar vom {new Date(startDate).toLocaleDateString('de-DE')} bis{' '}
            {new Date(endDate).toLocaleDateString('de-DE')} in {location}
          </p>
        )}
      </div>

      {vehicles.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-lg mb-4">Keine Fahrzeuge verfügbar</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Zurück zur Startseite
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(vehicle => (
            <div
              key={vehicle.id}
              className="card hover:border-primary-600 transition-colors cursor-pointer"
              onClick={() => handleVehicleClick(vehicle.id)}
            >
              <div className="aspect-video bg-dark-700 rounded-lg mb-4 overflow-hidden">
                {(() => {
                  const rawHero = normalizeImageUrl(
                    (vehicle.imageGallery && vehicle.imageGallery[0]) || vehicle.imageUrl
                  )
                  const hero =
                    rawHero && rawHero.startsWith('http')
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
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      onError={e => {
                        const img = e.currentTarget
                        if (hero && hero.startsWith('/api/assets/image')) {
                          img.src = rawHero || ''
                          img.onerror = () => {
                            img.style.display = 'none'
                            if (img.parentElement) {
                              img.parentElement.innerHTML =
                                '<span class="text-6xl flex items-center justify-center h-full">🚗</span>'
                            }
                          }
                        } else {
                          img.style.display = 'none'
                          if (img.parentElement) {
                            img.parentElement.innerHTML =
                              '<span class="text-6xl flex items-center justify-center h-full">🚗</span>'
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
              <p className="text-gray-400 mb-2">{getVehicleTypeLabel(vehicle.type)}</p>
              <p className="text-sm text-gray-300 mb-4">Standort: {vehicle.location}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-primary-600">
                  {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
                    vehicle.dailyPrice
                  )}
                  /Tag
                </span>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation()
                  handleVehicleClick(vehicle.id)
                }}
                className="btn-primary w-full"
              >
                Details anzeigen
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default VehicleListPage
