import { useState, useEffect } from 'react'
import { api } from '@/services/api'
import type { Vehicle, VehicleType, VehicleStatus } from '@/types'
import { VehicleType as VehicleTypeEnum } from '@/types/vehicle'

const VehicleManagementPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  const [formData, setFormData] = useState<{
    licensePlate: string
    brand: string
    model: string
    type: VehicleType
    year: string
    mileage: string
    location: string
    dailyPrice: string
    imageUrl: string
    imageGallery: string
  }>({
    licensePlate: '',
    brand: '',
    model: '',
    type: VehicleTypeEnum.KLEINWAGEN,
    year: '',
    mileage: '',
    location: '',
    dailyPrice: '',
    imageUrl: '',
    imageGallery: '',
  })

  useEffect(() => {
    // Prüfe Authentifizierung und Rolle
    if (!api.isAuthenticated()) {
      setError('Bitte melden Sie sich an, um Fahrzeuge zu verwalten.')
      setLoading(false)
      return
    }
    
    const role = api.getUserRole()
    if (role !== 'ROLE_EMPLOYEE' && role !== 'ROLE_ADMIN') {
      setError('Zugriff verweigert. Nur Mitarbeiter und Administratoren können diese Seite aufrufen.')
      setLoading(false)
      return
    }
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getAllVehicles()
      setVehicles(data)
    } catch (err) {
      console.error('Failed to load vehicles:', err)
      setError('Fahrzeuge konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      licensePlate: '',
      brand: '',
      model: '',
      type: VehicleTypeEnum.KLEINWAGEN,
      year: '',
      mileage: '',
      location: '',
      dailyPrice: '',
      imageUrl: '',
      imageGallery: '',
    })
    setEditingVehicle(null)
    setShowAddForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const imageGalleryArray = formData.imageGallery
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0)

      if (editingVehicle) {
        // Update existing vehicle
        await api.updateVehicle(editingVehicle.id, {
          brand: formData.brand,
          model: formData.model,
          type: formData.type,
          year: formData.year ? parseInt(formData.year) : undefined,
          location: formData.location,
          dailyPrice: parseFloat(formData.dailyPrice),
          imageUrl: formData.imageUrl || undefined,
          imageGallery: imageGalleryArray.length > 0 ? imageGalleryArray : undefined,
        })
      } else {
        // Create new vehicle
        await api.createVehicle({
          licensePlate: formData.licensePlate,
          brand: formData.brand,
          model: formData.model,
          type: formData.type,
          year: formData.year ? parseInt(formData.year) : undefined,
          mileage: parseInt(formData.mileage),
          location: formData.location,
          dailyPrice: parseFloat(formData.dailyPrice),
          imageUrl: formData.imageUrl || undefined,
          imageGallery: imageGalleryArray.length > 0 ? imageGalleryArray : undefined,
        })
      }

      resetForm()
      await loadVehicles()
    } catch (err: unknown) {
      console.error('Fehler beim Speichern:', err)
      const e = err as { 
        response?: { 
          data?: { error?: string; message?: string }
          status?: number
        }
        message?: string
      }
      
      let errorMessage = 'Fehler beim Speichern des Fahrzeugs.'
      
      if (e.response?.status === 401 || e.response?.status === 403) {
        errorMessage = 'Zugriff verweigert. Bitte melden Sie sich als Mitarbeiter oder Administrator an.'
      } else if (e.response?.data?.error) {
        errorMessage = e.response.data.error
      } else if (e.response?.data?.message) {
        errorMessage = e.response.data.message
      } else if (e.message) {
        errorMessage = e.message
      }
      
      setError(errorMessage)
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      licensePlate: vehicle.licensePlate || '',
      brand: vehicle.brand,
      model: vehicle.model,
      type: vehicle.type,
      year: vehicle.year?.toString() || '',
      mileage: vehicle.mileage?.toString() || '',
      location: vehicle.location,
      dailyPrice: vehicle.dailyPrice.toString(),
      imageUrl: vehicle.imageUrl || '',
      imageGallery: vehicle.imageGallery?.join(', ') || '',
    })
    setShowAddForm(true)
  }

  const handleSetOutOfService = async (id: number) => {
    if (!confirm('Möchten Sie dieses Fahrzeug wirklich außer Betrieb setzen?')) {
      return
    }

    try {
      await api.setVehicleOutOfService(id)
      loadVehicles()
    } catch (err) {
      console.error('Failed to set vehicle out of service:', err)
      setError('Fehler beim Setzen des Fahrzeugs außer Betrieb.')
    }
  }

  const getVehicleTypeLabel = (type: VehicleType): string => {
    const labels: Record<VehicleType, string> = {
      KLEINWAGEN: 'Kleinwagen',
      KOMPAKTKLASSE: 'Kompaktklasse',
      MITTELKLASSE: 'Mittelklasse',
      OBERKLASSE: 'Oberklasse',
      SUV: 'SUV',
      VAN: 'Van',
      SPORTWAGEN: 'Sportwagen',
    }
    return labels[type] || type
  }

  const getStatusLabel = (status: VehicleStatus): string => {
    const labels: Record<VehicleStatus, string> = {
      VERFÜGBAR: 'Verfügbar',
      VERMIETET: 'Vermietet',
      WARTUNG: 'Wartung',
      AUSSER_BETRIEB: 'Außer Betrieb',
    }
    return labels[status] || status
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

  if (error && !vehicles.length) {
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Fahrzeugverwaltung</h1>
          <p className="text-gray-400">Verwalten Sie die Fahrzeugflotte</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowAddForm(true)
          }}
          className="btn-primary"
        >
          + Neues Fahrzeug
        </button>
      </div>

      {error && (
        <div className="mb-4 card bg-red-500/10 border-red-500">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {showAddForm && (
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              {editingVehicle ? 'Fahrzeug bearbeiten' : 'Neues Fahrzeug hinzufügen'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-white">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!editingVehicle && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Kennzeichen *
                  </label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="B-AB 1234"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Marke *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="BMW"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Modell *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="320d"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Fahrzeugtyp *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="KLEINWAGEN">Kleinwagen</option>
                  <option value="KOMPAKTKLASSE">Kompaktklasse</option>
                  <option value="MITTELKLASSE">Mittelklasse</option>
                  <option value="OBERKLASSE">Oberklasse</option>
                  <option value="SUV">SUV</option>
                  <option value="VAN">Van</option>
                  <option value="SPORTWAGEN">Sportwagen</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Baujahr</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              {!editingVehicle && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Kilometerstand *
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="50000"
                    min="0"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Standort *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Berlin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Tagespreis (€) *
                </label>
                <input
                  type="number"
                  name="dailyPrice"
                  value={formData.dailyPrice}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="60.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Hauptbild-URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Bildergalerie (URLs, durch Komma getrennt)
                </label>
                <textarea
                  name="imageGallery"
                  value={formData.imageGallery}
                  onChange={handleInputChange}
                  className="input-field"
                  rows={3}
                  placeholder="https://..., https://..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn-primary">
                {editingVehicle ? 'Aktualisieren' : 'Fahrzeug hinzufügen'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="card">
            <div className="aspect-video bg-dark-700 rounded-lg mb-4 overflow-hidden">
              {vehicle.imageUrl ? (
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.currentTarget.style.display = 'none'
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerHTML =
                        '<span class="text-6xl flex items-center justify-center h-full">🚗</span>'
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">🚗</span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white mb-2">
                {vehicle.brand} {vehicle.model}
              </h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-400">
                  <span className="font-medium">Typ:</span> {getVehicleTypeLabel(vehicle.type)}
                </p>
                <p className="text-gray-400">
                  <span className="font-medium">Kennzeichen:</span> {vehicle.licensePlate}
                </p>
                <p className="text-gray-400">
                  <span className="font-medium">Standort:</span> {vehicle.location}
                </p>
                <p className="text-gray-400">
                  <span className="font-medium">Kilometerstand:</span> {vehicle.mileage?.toLocaleString('de-DE') || 'N/A'}
                </p>
                <p className="text-gray-400">
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={
                      vehicle.status === 'VERFÜGBAR'
                        ? 'text-green-400'
                        : vehicle.status === 'VERMIETET'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                    }
                  >
                    {getStatusLabel(vehicle.status)}
                  </span>
                </p>
                <p className="text-2xl font-bold text-primary-600">
                  {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
                    vehicle.dailyPrice
                  )}
                  /Tag
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <button onClick={() => handleEdit(vehicle)} className="btn-secondary flex-1">
                  Bearbeiten
                </button>
                {vehicle.status !== 'AUSSER_BETRIEB' && (
                  <button
                    onClick={() => handleSetOutOfService(vehicle.id)}
                    className="btn-secondary flex-1"
                  >
                    Außer Betrieb
                  </button>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <select
                  value={vehicle.location}
                  onChange={async (e) => {
                    const newLocation = e.target.value
                    try {
                      await api.updateVehicleLocation(vehicle.id, newLocation)
                      await loadVehicles()
                    } catch (err) {
                      console.error('Fehler beim Ändern des Standorts:', err)
                      setError('Fehler beim Ändern des Standorts.')
                    }
                  }}
                  className="input-field flex-1 text-sm"
                >
                  <option value="Berlin">Berlin</option>
                  <option value="München">München</option>
                  <option value="Hamburg">Hamburg</option>
                  <option value="Köln">Köln</option>
                  <option value="Frankfurt">Frankfurt</option>
                  <option value="Stuttgart">Stuttgart</option>
                  <option value="Düsseldorf">Düsseldorf</option>
                  <option value="Dortmund">Dortmund</option>
                  <option value="Essen">Essen</option>
                  <option value="Leipzig">Leipzig</option>
                </select>
                <span className="text-xs text-gray-400">Standort</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {vehicles.length === 0 && !loading && (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-lg mb-4">Keine Fahrzeuge vorhanden</p>
          <button onClick={() => setShowAddForm(true)} className="btn-primary">
            Erstes Fahrzeug hinzufügen
          </button>
        </div>
      )}
    </div>
  )
}

export default VehicleManagementPage

