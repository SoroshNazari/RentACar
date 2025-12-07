import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '@/services/api'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    driverLicenseNumber: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activationInfo, setActivationInfo] = useState<{
    token: string
    link: string
  } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein')
      return
    }

    setLoading(true)

    try {
      const response = await api.registerCustomer({
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        driverLicenseNumber: formData.driverLicenseNumber,
      })
      
      // Wenn Aktivierungstoken in der Antwort ist (für Entwicklung)
      if ((response as any).activationToken) {
        setActivationInfo({
          token: (response as any).activationToken,
          link: (response as any).activationLink || `/activate?token=${(response as any).activationToken}`
        })
      } else {
        navigate('/login?registered=true')
      }
    } catch (err: unknown) {
      const e = err as { 
        response?: { 
          data?: { 
            message?: string
            error?: string
            details?: Record<string, string>
          }
          status?: number
        }
        message?: string
      }
      
      // Extrahiere Fehlermeldung aus verschiedenen möglichen Strukturen
      let errorMessage = 'Registrierung fehlgeschlagen. Bitte versuche es erneut.'
      
      if (e.response?.data) {
        // Backend-Fehlerstruktur: { error: "...", details: {...} }
        if (e.response.data.error) {
          errorMessage = e.response.data.error
          // Wenn es Validierungsfehler gibt, zeige Details an
          if (e.response.data.details) {
            const details = Object.entries(e.response.data.details)
              .map(([field, msg]) => `${field}: ${msg}`)
              .join(', ')
            if (details) {
              errorMessage += ` (${details})`
            }
          }
        } else if (e.response.data.message) {
          errorMessage = e.response.data.message
        }
      } else if (e.message) {
        errorMessage = e.message
      }
      
      // Spezielle Behandlung für Netzwerkfehler
      if (e.response?.status === 0 || !e.response) {
        errorMessage = 'Verbindungsfehler. Bitte überprüfen Sie, ob das Backend läuft.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <span className="text-2xl font-bold text-white">RentACar</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Konto erstellen</h1>
          <p className="text-gray-200">Registriere dich, um Fahrzeuge zu mieten</p>
        </div>

        <div className="card">
          {activationInfo ? (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
                <p className="font-semibold mb-2">Registrierung erfolgreich!</p>
                <p className="text-sm mb-4">
                  Da wir einen Dummy-E-Mail-Service verwenden, finden Sie hier Ihren Aktivierungstoken:
                </p>
                <div className="bg-dark-800 p-3 rounded mb-4">
                  <p className="text-xs text-gray-400 mb-1">Aktivierungstoken:</p>
                  <p className="text-sm font-mono break-all">{activationInfo.token}</p>
                </div>
                <div className="space-y-2">
                  <a
                    href={activationInfo.link}
                    className="btn-primary w-full inline-block text-center"
                  >
                    Account jetzt aktivieren
                  </a>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-primary-500 hover:text-primary-400 underline text-sm w-full"
                  >
                    Später aktivieren
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-2">
                  Vorname
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="input-field"
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-2">
                  Nachname
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="input-field"
                  aria-required="true"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
                Benutzername
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="input-field"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-2">
                Telefon
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="input-field"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-200 mb-2">
                Adresse
              </label>
              <input
                id="address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="input-field"
                aria-required="true"
              />
            </div>

            <div>
              <label
                htmlFor="driverLicenseNumber"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Führerscheinnummer
              </label>
              <input
                id="driverLicenseNumber"
                type="text"
                name="driverLicenseNumber"
                value={formData.driverLicenseNumber}
                onChange={handleChange}
                required
                className="input-field"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field"
                aria-required="true"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Passwort bestätigen
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input-field"
                aria-required="true"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Konto wird erstellt...' : 'Registrieren'}
            </button>
          </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-200">
              Bereits ein Konto?{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-400 underline">
                Anmelden
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
