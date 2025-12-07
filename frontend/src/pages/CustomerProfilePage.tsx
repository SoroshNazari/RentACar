import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import type { Booking, Customer } from '@/types'

const CustomerProfilePage = () => {
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/login')
      return
    }
    const role = api.getUserRole()
    // Nur CUSTOMER kann diese Seite sehen
    if (role !== 'ROLE_CUSTOMER') {
      navigate('/')
      return
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  const loadData = async () => {
    try {
      let customerData: Customer | null = null
      const username = localStorage.getItem('username') || ''
      
      // Versuche zuerst getCustomerMe
      try {
        console.log('Trying getCustomerMe...')
        customerData = await api.getCustomerMe()
        console.log('getCustomerMe success:', customerData)
        console.log('Customer ID:', customerData?.id, 'Type:', typeof customerData?.id)
        
        // Validiere die Daten
        if (!customerData) {
          console.error('No customer data returned')
          throw new Error('Keine Kundendaten erhalten')
        }
        
        if (customerData.id === undefined || customerData.id === null) {
          console.error('Invalid customer data structure - missing ID:', customerData)
          // Versuche Fallback mit Username
          if (username) {
            console.log('Trying getCustomerByUsername as fallback due to missing ID...')
            try {
              customerData = await api.getCustomerByUsername(username)
              console.log('getCustomerByUsername success:', customerData)
            } catch (err2: unknown) {
              console.error('getCustomerByUsername also failed:', err2)
              throw new Error('Kundendaten konnten nicht geladen werden. Bitte kontaktieren Sie den Support.')
            }
          } else {
            throw new Error('Ungültige Datenstruktur: ID fehlt')
          }
        }
      } catch (err: unknown) {
        console.error('getCustomerMe failed:', err)
        const e = err as { response?: { status?: number; data?: { error?: string } }; message?: string }
        
        // Wenn 404 oder andere Fehler, versuche Fallback
        if (username && (e.response?.status === 404 || e.message?.includes('Ungültige') || e.message?.includes('fehlt'))) {
          console.log('Trying getCustomerByUsername as fallback...')
          try {
            customerData = await api.getCustomerByUsername(username)
            console.log('getCustomerByUsername success:', customerData)
            
            // Validiere auch hier
            if (!customerData || customerData.id === undefined || customerData.id === null) {
              console.error('Invalid customer data from getCustomerByUsername:', customerData)
              throw new Error('Kundendaten konnten nicht geladen werden. Bitte kontaktieren Sie den Support.')
            }
          } catch (err2: unknown) {
            console.error('getCustomerByUsername also failed:', err2)
            throw new Error('Kundendaten konnten nicht geladen werden. Bitte kontaktieren Sie den Support.')
          }
        } else {
          // Wenn kein Username vorhanden, werfe den ursprünglichen Fehler
          throw err
        }
      }
      
      if (!customerData) {
        throw new Error('Kundendaten konnten nicht geladen werden: Keine Daten erhalten')
      }
      
      setCustomer(customerData)
      
      // Lade Buchungen
      try {
        const bookingsData = await api.getBookingHistory(customerData.id)
        setBookings(bookingsData || [])
      } catch (bookingError) {
        console.error('Failed to load bookings:', bookingError)
        setBookings([])
        // Buchungen sind optional, setze keinen Fehler
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      const e = error as { response?: { status?: number; data?: { error?: string } }; message?: string; request?: any }
      
      let errorMessage = 'Kundendaten konnten nicht geladen werden'
      
      if (e.response?.status === 401 || e.response?.status === 403) {
        errorMessage = 'Zugriff verweigert. Bitte melden Sie sich an.'
      } else if (e.response?.status === 404) {
        errorMessage = 'Kundendaten nicht gefunden. Bitte stellen Sie sicher, dass Sie als Kunde registriert sind.'
      } else if (e.response?.status === 500) {
        errorMessage = 'Serverfehler. Bitte versuchen Sie es später erneut.'
      } else if (e.response?.data?.error) {
        errorMessage = `Fehler: ${e.response.data.error}`
      } else if (e.message) {
        errorMessage = e.message
      } else if (e.response?.status) {
        errorMessage = `Fehler beim Laden (Status: ${e.response.status})`
      } else if (!e.response) {
        errorMessage = 'Verbindungsfehler. Bitte überprüfen Sie, ob das Backend läuft.'
      }
      
      console.error('Final error message:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: number) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (!booking) return

    const pickup = new Date(booking.pickupDate)
    const pickupStart = new Date(
      pickup.getFullYear(),
      pickup.getMonth(),
      pickup.getDate(),
      0,
      0,
      0,
      0
    )
    const oneDayMs = 24 * 60 * 60 * 1000
    const deadline = pickupStart.getTime() - oneDayMs
    const now = Date.now()
    const allowed = now < deadline

    if (!allowed) {
      alert('Stornierung nur bis 24h vor Abholung möglich.')
      return
    }

    if (!confirm('Buchung wirklich stornieren?')) return

    try {
      await api.cancelBooking(bookingId)
      loadData()
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      alert('Stornierung fehlgeschlagen. Bitte versuche es erneut.')
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
        <p className="text-gray-400">Profil wird geladen...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="card bg-red-500/10 border-red-500">
          <p className="text-red-400">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-4">
            Seite neu laden
          </button>
        </div>
      </div>
    )
  }

  const totalExpenses = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)

  // Fallback: Wenn kein Customer geladen wurde, aber auch kein Fehler
  if (!customer && !loading && !error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="card bg-yellow-500/10 border-yellow-500">
          <p className="text-yellow-400">Keine Kundendaten gefunden. Bitte versuchen Sie es erneut.</p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-4">
            Seite neu laden
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Mein Profil</h1>

      {/* Customer Info */}
      {customer ? (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Persönliche Informationen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Name</p>
              <p className="text-white font-semibold">
                {customer.firstName} {customer.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">E-Mail</p>
              <p className="text-white font-semibold">{customer.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Telefon</p>
              <p className="text-white font-semibold">{customer.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Adresse</p>
              <p className="text-white font-semibold">{customer.address}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card mb-8">
          <p className="text-gray-400">Kundendaten werden geladen...</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm text-gray-400 mb-2">Anzahl Buchungen</h3>
          <p className="text-3xl font-bold text-white">{bookings.length}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-400 mb-2">Gesamtausgaben</h3>
          <p className="text-3xl font-bold text-primary-600">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      {/* Bookings */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Meine Buchungen</h2>
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Noch keine Buchungen</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Fahrzeuge durchsuchen
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-dark-700 rounded-lg p-4 border border-dark-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {booking.vehicle.brand} {booking.vehicle.model}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Abholung</p>
                        <p className="text-white">
                          {new Date(booking.pickupDate).toLocaleDateString('de-DE')} -{' '}
                          {booking.pickupLocation}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Rückgabe</p>
                        <p className="text-white">
                          {new Date(booking.returnDate).toLocaleDateString('de-DE')} -{' '}
                          {booking.returnLocation}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Status</p>
                        <p className="text-white">{booking.status}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Gesamtpreis</p>
                        <p className="text-white font-semibold">
                          {formatCurrency(booking.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {booking.status !== 'STORNIERT' && booking.status !== 'ABGESCHLOSSEN' && (
                    <div className="flex flex-col items-end">
                      {(() => {
                        const pickup = new Date(booking.pickupDate)
                        const pickupStart = new Date(
                          pickup.getFullYear(),
                          pickup.getMonth(),
                          pickup.getDate(),
                          0,
                          0,
                          0,
                          0
                        )
                        const oneDayMs = 24 * 60 * 60 * 1000
                        const deadline = pickupStart.getTime() - oneDayMs
                        const canCancel = Date.now() < deadline
                        return (
                          <>
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={!canCancel}
                              className="btn-secondary ml-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Stornieren
                            </button>
                            {!canCancel && (
                              <span className="mt-2 text-xs text-gray-400">
                                Stornierung nur bis 24h vor Abholung
                              </span>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerProfilePage

