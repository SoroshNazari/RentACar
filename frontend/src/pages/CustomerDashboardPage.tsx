import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import type { Booking, Customer } from '@/types'

interface CustomerWithExpenses extends Customer {
  totalExpenses: number
  bookingCount: number
  bookings: Booking[]
}

const CustomerDashboardPage = () => {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<CustomerWithExpenses[]>([])
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (!api.isAuthenticated()) {
        navigate('/login')
        return
      }
      const role = api.getUserRole()
      // Nur ADMIN kann das Dashboard sehen (zeigt alle Kunden mit Ausgaben)
      if (role !== 'ROLE_ADMIN') {
        navigate('/')
        return
      }
      loadData()
    } catch (error) {
      console.error('Error in CustomerDashboardPage useEffect:', error)
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  const loadData = async () => {
    try {
      // Nur ADMIN kann hier sein (wird in useEffect geprüft)
      // Lade alle Kunden und alle Buchungen
      const [customersData, bookingsData] = await Promise.all([
        api.getAllCustomers(),
        api.getAllBookings()
      ])
      
      console.log('Loaded customers:', customersData.length)
      console.log('Loaded bookings:', bookingsData.length)
      
      setAllBookings(bookingsData || [])
      
      // Gruppiere Buchungen nach Kunde und berechne Ausgaben
      const customersWithExpenses: CustomerWithExpenses[] = (customersData || []).map(customer => {
        const customerBookings = (bookingsData || []).filter(b => b.customerId === customer.id)
        const totalExpenses = customerBookings.reduce((sum, booking) => {
          return sum + (booking.totalPrice || 0)
        }, 0)
        
        return {
          ...customer,
          totalExpenses,
          bookingCount: customerBookings.length,
          bookings: customerBookings
        }
      })
      
      // Sortiere nach Ausgaben (höchste zuerst)
      customersWithExpenses.sort((a, b) => b.totalExpenses - a.totalExpenses)
      
      setCustomers(customersWithExpenses)
    } catch (error) {
      console.error('Failed to load data:', error)
      const e = error as { response?: { status?: number; data?: { error?: string } }; message?: string }
      let errorMessage = 'Fehler beim Laden der Daten'
      
      if (e.response?.status === 401 || e.response?.status === 403) {
        errorMessage = 'Zugriff verweigert. Bitte melden Sie sich als Administrator an.'
      } else if (e.response?.data?.error) {
        errorMessage = e.response.data.error
      } else if (e.message) {
        errorMessage = e.message
      }
      
      setError(errorMessage)
      setCustomers([])
      setAllBookings([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
        <p className="text-gray-400">Dashboard wird geladen...</p>
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

  const totalRevenue = allBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm text-gray-400 mb-2">Gesamtkunden</h3>
          <p className="text-3xl font-bold text-white">{customers.length}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-400 mb-2">Gesamtbuchungen</h3>
          <p className="text-3xl font-bold text-white">{allBookings.length}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-400 mb-2">Gesamtumsatz</h3>
          <p className="text-3xl font-bold text-primary-600">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">
          Alle Kunden mit Ausgaben
        </h2>
        
        {customers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Keine Kunden vorhanden</p>
          </div>
        ) : (
          <div className="space-y-6">
            {customers.map(customer => (
              <div key={customer.id} className="bg-dark-700 rounded-lg p-6 border border-dark-600">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {customer.firstName} {customer.lastName}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">E-Mail</p>
                        <p className="text-white">{customer.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Telefon</p>
                        <p className="text-white">{customer.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Anzahl Buchungen</p>
                        <p className="text-white font-semibold">{customer.bookingCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Gesamtausgaben</p>
                        <p className="text-white font-semibold text-primary-600">
                          {formatCurrency(customer.totalExpenses)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {customer.bookings.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-dark-600">
                    <h4 className="text-lg font-semibold text-white mb-3">Buchungen</h4>
                    <div className="space-y-3">
                      {customer.bookings.map(booking => (
                        <div key={booking.id} className="bg-dark-800 rounded p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="text-white font-semibold mb-2">
                                {booking.vehicle.brand} {booking.vehicle.model}
                              </h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-400">Abholung</p>
                                  <p className="text-white">
                                    {new Date(booking.pickupDate).toLocaleDateString('de-DE')}
                                  </p>
                                  <p className="text-gray-500 text-xs">{booking.pickupLocation}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Rückgabe</p>
                                  <p className="text-white">
                                    {new Date(booking.returnDate).toLocaleDateString('de-DE')}
                                  </p>
                                  <p className="text-gray-500 text-xs">{booking.returnLocation}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Status</p>
                                  <p className="text-white">{booking.status}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Preis</p>
                                  <p className="text-white font-semibold">
                                    {formatCurrency(booking.totalPrice || 0)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerDashboardPage
