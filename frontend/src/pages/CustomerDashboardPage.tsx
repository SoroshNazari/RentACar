import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import type { Booking, Customer } from '@/types'

const CustomerDashboardPage = () => {
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/login')
      return
    }
    const role = api.getUserRole()
    if (role !== 'ROLE_CUSTOMER') {
      setLoading(false)
      return
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      let customerData: Customer
      try {
        customerData = await api.getCustomerMe()
      } catch (err: unknown) {
        const username = localStorage.getItem('username') || ''
        if (!username) throw err
        customerData = await api.getCustomerByUsername(username)
      }
      setCustomer(customerData)
      const bookingsData = await api.getBookingHistory(customerData.id)
      setBookings(bookingsData)
    } catch (error) {
      console.error('Failed to load data:', error)
      setCustomer(null)
      setBookings([])
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">Dashboard wird geladen...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Mein Profil</h1>

      {!customer && api.getUserRole() !== 'ROLE_CUSTOMER' && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">Mitarbeiterkonto</h2>
          <p className="text-gray-400">
            Dieses Profil ist nur für Kunden verfügbar. Bitte nutze die Mitarbeiterfunktionen über
            das Menü.
          </p>
        </div>
      )}

      {/* Customer Info */}
      {customer && (
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
      )}

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
                          {new Intl.NumberFormat('de-DE', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(booking.totalPrice)}
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

export default CustomerDashboardPage

