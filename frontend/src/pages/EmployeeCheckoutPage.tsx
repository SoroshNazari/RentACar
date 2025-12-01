import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Booking } from '@/types/booking'

const todayISO = () => new Date().toISOString().slice(0, 10)

const EmployeeCheckoutPage = () => {
  const [date, setDate] = useState(todayISO())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [requests, setRequests] = useState<Booking[]>([])
  const [inputs, setInputs] = useState<Record<number, { mileage: string; notes: string }>>({})
  const [loading, setLoading] = useState(true)

  const normalizePlate = (plate: any): string => {
    if (plate == null) return ''
    if (typeof plate === 'object') {
      return typeof plate.value === 'string' ? plate.value : ''
    }
    return String(plate)
  }

  useEffect(() => {
    const role = api.getUserRole()
    if (role !== 'ROLE_EMPLOYEE' && role !== 'ROLE_ADMIN') {
      setLoading(false)
      return
    }
    load()
  }, [date])

  const load = async () => {
    try {
      setLoading(true)
      const data = await api.getPickups(date)
      const enrichWithMileage = async (list: Booking[]) => {
        return Promise.all(list.map(async (b) => {
          const v: any = (b as any).vehicle || {}
          if (typeof v.mileage === 'number') return b
          try {
            const full: any = await api.getVehicleById(v.id)
            return { ...b, vehicle: { ...(b as any).vehicle, mileage: full?.mileage } } as any
          } catch {
            return b
          }
        }))
      }
      const enrichedPickups = await enrichWithMileage(data)
      setBookings(enrichedPickups as any)
      const reqs = await api.getPickupRequests(date)
      const enrichedRequests = await enrichWithMileage(reqs)
      setRequests(enrichedRequests as any)
      setLoading(false)
    } catch (e) {
      console.error('Failed to load pickups:', e)
      setLoading(false)
    }
  }

  const handleCheckout = async (b: Booking) => {
    const notes = inputs[b.id]?.notes || ''
    const currentMileage = Number(((b as any).vehicle?.mileage ?? 0))
    if (!Number.isFinite(currentMileage) || currentMileage <= 0) {
      alert('Mileage not available')
      return
    }
    try {
      await api.checkoutBooking(b.id, currentMileage, notes)
      await load()
    } catch (e: any) {
      console.error('Checkout failed:', e)
      const status = e.response?.status
      let message = 'Unknown error'
      
      if (status === 409) {
        message = 'Booking has already been checked out'
      } else if (status === 400) {
        message = 'Invalid input - please check your data'
      } else {
        message = e.response?.data?.message || e.response?.data?.error || e.message || 'Unknown error'
      }
      
      alert(`Checkout failed: ${message}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Employee Check-out</h1>
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <label className="text-gray-300">Pickup Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
          />
        </div>
      </div>
      {loading ? (
        <div className="text-gray-400">Loading data…</div>
      ) : (
        <>
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Confirmed Pickups</h2>
            {bookings.length === 0 ? (
              <div className="text-gray-400">No confirmed pickups for the selected day.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookings.map((b) => (
                  <div key={b.id} className="card">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-white font-semibold">
                          {b.vehicle.brand} {b.vehicle.model} • {normalizePlate((b as any).vehicle?.licensePlate)}
                        </div>
                        <div className="text-gray-400 text-sm">
                          Kunde #{b.customerId} • Standort {b.pickupLocation}
                        </div>
                      </div>
                      <span className="badge">{b.status}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-gray-300 mb-1 block">Mileage</label>
                        <input
                          type="number"
                          value={String(((b as any).vehicle?.mileage ?? ''))}
                          readOnly
                          className="input-field"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-gray-300 mb-1 block">Condition / Notes</label>
                        <textarea
                          value={inputs[b.id]?.notes || ''}
                          onChange={(e) => setInputs({ ...inputs, [b.id]: { mileage: inputs[b.id]?.mileage || '', notes: e.target.value } })}
                          className="input-field min-h-[80px]"
                          placeholder="Scratches, cleanliness, notes…"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-3">
                      <button
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={b.status !== 'BESTÄTIGT' || (b as any).checkoutTime !== null}
                        onClick={() => handleCheckout(b)}
                      >
                        Perform Check-out
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">Open Requests</h2>
            {requests.length === 0 ? (
              <div className="text-gray-400">No open requests for the selected day.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requests.map((b) => (
                  <div key={b.id} className="card">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-white font-semibold">
                          {b.vehicle.brand} {b.vehicle.model} • {normalizePlate((b as any).vehicle?.licensePlate)}
                        </div>
                        <div className="text-gray-400 text-sm">
                          Kunde #{b.customerId} • Standort {b.pickupLocation}
                        </div>
                      </div>
                      <span className="badge">{b.status}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-gray-300 mb-1 block">Kilometerstand</label>
                        <input
                          type="number"
                          value={String(((b as any).vehicle?.mileage ?? ''))}
                          readOnly
                          className="input-field"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-gray-300 mb-1 block">Zustand / Notizen</label>
                        <textarea
                          value={inputs[b.id]?.notes || ''}
                          onChange={(e) => setInputs({ ...inputs, [b.id]: { mileage: inputs[b.id]?.mileage || '', notes: e.target.value } })}
                          className="input-field min-h-[80px]"
                          placeholder="Kratzer, Sauberkeit, Hinweise…"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-3">
                      <button
                        className="btn-secondary"
                        onClick={async () => {
                          try {
                            await api.confirmBooking(b.id)
                            await load()
                          } catch (e) {
                            console.error('Bestätigung fehlgeschlagen:', e)
                            alert('Confirmation failed')
                          }
                        }}
                      >
                        Confirm Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default EmployeeCheckoutPage
