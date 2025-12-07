import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const navigate = useNavigate()
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [vehicleType, setVehicleType] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (location) params.append('location', location)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (vehicleType) params.append('vehicleType', vehicleType)

    navigate(`/vehicles?${params.toString()}`)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Miete dein Traumauto
            </h1>
            <p className="text-xl text-gray-200">
              Premium Fahrzeuge für unvergessliche Momente. Einfach, schnell und sicher.
            </p>
          </div>

          <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 shadow-2xl backdrop-blur-sm bg-opacity-95">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">

              {/* Abholort (3 Spalten) */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-300 mb-1">Abholort</label>
                <input
                  type="text"
                  placeholder="Stadt oder Flughafen"
                  className="input-field"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Fahrzeugtyp (3 Spalten) - Hier wird setVehicleType genutzt! */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-300 mb-1">Fahrzeugtyp</label>
                <select
                  className="input-field"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  <option value="">Alle Typen</option>
                  <option value="KLEINWAGEN">Kleinwagen</option>
                  <option value="KOMPAKTKLASSE">Kompaktklasse</option>
                  <option value="MITTELKLASSE">Mittelklasse</option>
                  <option value="OBERKLASSE">Oberklasse</option>
                  <option value="SUV">SUV</option>
                  <option value="VAN">Van</option>
                  <option value="SPORTWAGEN">Sportwagen</option>
                </select>
              </div>

              {/* Startdatum (2 Spalten) */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Von</label>
                <input
                  type="date"
                  className="input-field"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* Enddatum (2 Spalten) */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Bis</label>
                <input
                  type="date"
                  className="input-field"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* Button (2 Spalten) */}
              <div className="lg:col-span-2 flex items-end">
                <button type="submit" className="btn-primary w-full h-[46px]">
                  Suchen
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Warum RentACar?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center p-8">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold text-white mb-2">Premium Flotte</h3>
              <p className="text-gray-400">
                Von Sportwagen bis SUV - wir haben das passende Fahrzeug für jeden Anlass.
              </p>
            </div>
            <div className="card text-center p-8">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-2">Sofort verfügbar</h3>
              <p className="text-gray-400">
                Buche in wenigen Minuten und starte direkt durch. Keine versteckten Kosten.
              </p>
            </div>
            <div className="card text-center p-8">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Vollkasko inklusive</h3>
              <p className="text-gray-400">
                Fahre sorgenfrei mit unserem umfassenden Versicherungsschutz.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
