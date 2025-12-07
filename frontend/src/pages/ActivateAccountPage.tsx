import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'

const ActivateAccountPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Kein Aktivierungstoken gefunden')
      return
    }

    const activateAccount = async () => {
      try {
        // Verwende axios für bessere Fehlerbehandlung
        const response = await axios.post('/api/customers/activate', null, {
          params: { token },
        })

        setStatus('success')
        setMessage(response.data.message || 'Account erfolgreich aktiviert!')
        setTimeout(() => {
          navigate('/login?activated=true')
        }, 3000)
      } catch (err: unknown) {
        console.error('Aktivierungsfehler:', err)
        setStatus('error')
        const e = err as { response?: { data?: { error?: string } }; message?: string }
        const errorMessage = e.response?.data?.error || e.message || 'Fehler bei der Aktivierung. Bitte versuchen Sie es erneut.'
        setMessage(errorMessage)
      }
    }

    activateAccount()
  }, [token, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <span className="text-2xl font-bold text-white">RentACar</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Account-Aktivierung</h1>
        </div>

        <div className="card text-center">
          {status === 'loading' && (
            <>
              <div className="mb-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
              </div>
              <p className="text-gray-200">Account wird aktiviert...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mb-4">
                <div className="inline-block w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">✓</span>
                </div>
              </div>
              <p className="text-green-400 text-lg mb-4">{message}</p>
              <p className="text-gray-400 text-sm">Sie werden in 3 Sekunden zur Anmeldeseite weitergeleitet...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-4">
                <div className="inline-block w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">✗</span>
                </div>
              </div>
              <p className="text-red-400 text-lg mb-4">{message}</p>
              <div className="space-y-2">
                <Link to="/login" className="btn-primary inline-block">
                  Zur Anmeldung
                </Link>
                <br />
                <Link to="/register" className="text-primary-500 hover:text-primary-400 underline text-sm">
                  Neu registrieren
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActivateAccountPage

