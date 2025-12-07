import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { api } from '@/services/api'

const LoginPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Prüft, ob eine Nachricht in der URL steht (z.B. vom Redirect)
    const msg = searchParams.get('message')
    if (msg === 'login_required') {
      setInfoMessage('Bitte melde dich an, um fortzufahren.')
    } else if (msg === 'registered') {
      setInfoMessage('Registrierung erfolgreich! Du kannst dich jetzt anmelden.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfoMessage('') // Info ausblenden beim Versuch
    setLoading(true)

    try {
      await api.login(username, password)

      const userRoles = api.getUserRoles()
      // Wenn man von einer Buchung kam, könnte man hier zurückleiten
      // Fürs Erste leiten wir Standardmäßig weiter:
      if (userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_EMPLOYEE')) {
        navigate('/employee')
      } else {
        navigate('/dashboard')
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Ungültige Anmeldedaten. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <span className="text-2xl font-bold text-white">RentACar</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Willkommen zurück</h1>
          <p className="text-gray-200">Melde dich in deinem Konto an</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Fehlermeldung (Rot) */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Info-Meldung (Gelb/Blau) */}
            {infoMessage && (
              <div className="bg-primary-500/10 border border-primary-500 text-primary-200 px-4 py-3 rounded-lg text-sm">
                {infoMessage}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
                Benutzername
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="input-field"
                placeholder="Dein Benutzername"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="Dein Passwort"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Anmeldung läuft...' : 'Anmelden'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-200">
              Noch kein Konto?{' '}
              <Link to="/register" className="text-primary-500 hover:text-primary-400 underline">
                Registrieren
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
