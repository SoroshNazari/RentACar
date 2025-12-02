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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (pickupDate && dropoffDate) {
      calculatePrice()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupDate, dropoffDate, vehicle])

  useEffect(() => {
    setHeroError(false)
  }, [selectedImageIndex, vehicle])

  const loadVehicle = async () => {
    if (!id) {
      setLoading(false)
      setError('Ungültige Fahrzeug-ID')
      return
    }
    setError(null)
    try {
      const data = await api.getVehicleById(Number(id))
      setVehicle(data)
      setSelectedImageIndex(0)
    } catch (error: unknown) {
      const e = error as {
        code?: string
        message?: string
        response?: { status?: number; data?: unknown }
      }
      console.error('Failed to load vehicle:', e)
      console.error('Error details:', e.response?.data || e.message)
      if (e.code === 'ECONNREFUSED' || e.message?.includes('ECONNREFUSED')) {
        setError('Backend-Server läuft nicht. Bitte starte ihn mit: ./gradlew bootRun')
      } else if (e.response?.status === 404) {
        setError('Fahrzeug nicht gefunden')
      } else if (e.response?.status === 403) {
        setError('Zugriff verweigert. Bitte überprüfe deine Authentifizierung.')
      } else if (e.response?.data) {
        setError(`Fehler: ${JSON.stringify(e.response.data)}`)
      } else {
        setError('Fahrzeug konnte nicht geladen werden. Bitte versuche es später erneut.')
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

  const images: string[] =
    vehicle?.imageGallery && vehicle.imageGallery.length > 0
      ? vehicle.imageGallery
      : ([vehicle?.imageUrl].filter(Boolean) as string[])

  const handleBookNow = () => {
    if (!pickupDate || !dropoffDate) {
      alert('Bitte wähle Abhol- und Rückgabedatum')
      return
    }
    if (new Date(pickupDate) >= new Date(dropoffDate)) {
      alert('Rückgabedatum muss nach dem Abholdatum liegen')
      return
    }
    navigate(`/booking/${id}?pickupDate=${pickupDate}&dropoffDate=${dropoffDate}`)
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Fahrzeugdetails werden geladen...</p>
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
            Zurück zu Fahrzeugen
          </button>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="card text-center">
          <p className="text-gray-400 text-lg mb-4">Fahrzeug nicht gefunden</p>
          <button onClick={() => navigate('/vehicles')} className="btn-primary">
            Zurück zu Fahrzeugen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-gray-400">
        <span className="hover:text-white cursor-pointer">Startseite</span>
        <span className="mx-2">/</span>
        <span className="hover:text-white cursor-pointer">Suchergebnisse</span>
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
                const hero =
                  rawHero && rawHero.startsWith('http')
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
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={e => {
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
                      src={
                        (url.startsWith('http')
                          ? `/api/assets/image?url=${encodeURIComponent(normalizeImageUrlWithWidth(url, 200))}`
                          : url) || ''
                      }
                      alt={`${vehicle?.brand || ''} ${vehicle?.model || ''} - View ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={e => {
                        const img = e.currentTarget
                        if (url.startsWith('http') && img.src.startsWith('/api/assets/image')) {
                          img.src = url || ''
                          img.onerror = () => setFailedThumbs(prev => ({ ...prev, [idx]: true }))
                        } else {
                          setFailedThumbs(prev => ({ ...prev, [idx]: true }))
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
              <span className="text-gray-400">(122 Bewertungen)</span>
            </div>

            {/* Specifications */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Spezifikationen</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Marke</p>
                  <p className="text-white font-semibold">{vehicle.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Modell</p>
                  <p className="text-white font-semibold">{vehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Typ</p>
                  <p className="text-white font-semibold">{getVehicleTypeLabel(vehicle.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Standort</p>
                  <p className="text-white font-semibold">{vehicle.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Kilometerstand</p>
                  <p className="text-white font-semibold">{vehicle.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Kennzeichen</p>
                  <p className="text-white font-semibold">{vehicle.licensePlate}</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Ausstattung</h2>
              <div className="flex flex-wrap gap-3">
                {[
                  'GPS Navigation',
                  'Bluetooth',
                  'Klimaanlage',
                  'Kindersitz',
                  'USB-Anschluss',
                  'Rückfahrkamera',
                ].map(feature => (
                  <div
                    key={feature}
                    className="px-4 py-2 bg-dark-700 rounded-lg text-sm text-gray-300"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Beschreibung</h2>
              <p className="text-gray-400 leading-relaxed">
                Der {vehicle.brand} {vehicle.model} bietet eine perfekte Mischung aus Komfort,
                Zuverlässigkeit und moderner Technologie. Mit seinem geräumigen Innenraum,
                komfortablen Fahrverhalten und kraftstoffeffizientem Motor ist dieses Fahrzeug ideal
                für Stadtfahrten und Langstreckenreisen. Das Auto verfügt über erweiterte
                Konnektivitätsoptionen einschließlich Bluetooth und GPS-Navigation, was für ein
                komfortables und angenehmes Fahrerlebnis sorgt.
              </p>
            </div>
          </div>
        </div>

        {/* Booking Widget */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-white">
                  {formatCurrency(vehicle.dailyPrice)}
                </span>
                <span className="text-gray-400">/ Tag</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <span>★</span>
                <span>Kostenlose Stornierung</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="pickupDate"
                  className="block text-sm font-medium text-gray-200 mb-2"
                >
                  Abholdatum
                </label>
                <input
                  id="pickupDate"
                  type="date"
                  value={pickupDate}
                  onChange={e => setPickupDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                  aria-required="true"
                />
              </div>
              <div>
                <label
                  htmlFor="dropoffDate"
                  className="block text-sm font-medium text-gray-200 mb-2"
                >
                  Rückgabedatum
                </label>
                <input
                  id="dropoffDate"
                  type="date"
                  value={dropoffDate}
                  onChange={e => setDropoffDate(e.target.value)}
                  min={pickupDate || new Date().toISOString().split('T')[0]}
                  className="input-field"
                  aria-required="true"
                />
              </div>
            </div>

            {rentalDays > 0 && (
              <div className="bg-dark-700 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">
                    {formatCurrency(vehicle.dailyPrice)} x {rentalDays} Tage
                  </span>
                  <span className="text-white font-semibold">
                    {formatCurrency(vehicle.dailyPrice * rentalDays)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Steuern & Gebühren</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(totalPrice - vehicle.dailyPrice * rentalDays)}
                  </span>
                </div>
                <div className="border-t border-dark-600 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-white font-bold">Gesamt</span>
                    <span className="text-white font-bold text-xl">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button onClick={handleBookNow} className="btn-primary w-full text-lg py-4">
              Jetzt buchen
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
      const idx = path.findIndex(p => p === 'seed')
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

    } else if (u.host.endsWith('picsum.photos')) {
      const path = u.pathname.split('/')
      const idx = path.findIndex(p => p === 'seed')
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
