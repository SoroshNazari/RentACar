import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
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
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const username = localStorage.getItem('username') || ''
      if (username) {
        const customerData = await api.getCustomerByUsername(username)
        setCustomer(customerData)
        const bookingsData = await api.getBookingHistory(customerData.id)
        setBookings(bookingsData)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      await api.cancelBooking(bookingId)
      loadData()
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      alert('Failed to cancel booking. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">My Dashboard</h1>

      {/* Customer Info */}
      {customer && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Name</p>
              <p className="text-white font-semibold">
                {customer.firstName} {customer.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Email</p>
              <p className="text-white font-semibold">{customer.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Phone</p>
              <p className="text-white font-semibold">{customer.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Address</p>
              <p className="text-white font-semibold">{customer.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bookings */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">My Bookings</h2>
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No bookings yet</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Browse Vehicles
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-dark-700 rounded-lg p-4 border border-dark-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {booking.vehicle.brand} {booking.vehicle.model}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Pickup</p>
                        <p className="text-white">
                          {new Date(booking.pickupDate).toLocaleDateString()} -{' '}
                          {booking.pickupLocation}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Return</p>
                        <p className="text-white">
                          {new Date(booking.returnDate).toLocaleDateString()} -{' '}
                          {booking.returnLocation}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Status</p>
                        <p className="text-white">{booking.status}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Total Price</p>
                        <p className="text-white font-semibold">${booking.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  {booking.status === 'BESTÄTIGT' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="btn-secondary ml-4"
                    >
                      Cancel
                    </button>
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

