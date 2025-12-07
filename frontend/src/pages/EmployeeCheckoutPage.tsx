import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import type { Booking } from '@/types/booking'

const todayISO = () => new Date().toISOString().slice(0, 10)

const EmployeeCheckoutPage = () => {
  const [date, setDate] = useState(todayISO())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [requests, setRequests] = useState<Booking[]>([])
  const [inputs, setInputs] = useState<Record<number, { mileage: string; notes: string }>>({})
  const [loading, setLoading] = useState(true)

  const normalizePlate = (plate: unknown): string => {
    if (plate == null) return ''
    if (typeof plate === 'object') {
      const maybe = plate as { value?: unknown }
      return typeof maybe.value === 'string' ? maybe.value : ''
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const load = async () => {
    try {
      setLoading(true)
      const data = await api.getPickups(date)
      const enrichWithMileage = async (list: Booking[]) => {
        return Promise.all(
          list.map(async b => {
            const v = b.vehicle
            if (typeof v.mileage === 'number') return b
            try {
              const full = await api.getVehicleById(v.id)
              return { ...b, vehicle: { ...b.vehicle, mileage: full.mileage } }
            } catch {
              return b
            }
          })
        )
      }
      const enrichedPickups = await enrichWithMileage(data)
      setBookings(enrichedPickups)
      const reqs = await api.getPickupRequests(date)
      const enrichedRequests = await enrichWithMileage(reqs)
      setRequests(enrichedRequests)
      setLoading(false)
    } catch (e) {
      console.error('Failed to load pickups:', e)
      setLoading(false)
    }
  }

  const handleCheckout = async (b: Booking) => {
    const notes = inputs[b.id]?.notes || ''
    const currentMileage = Number(b.vehicle.mileage ?? 0)
    if (!Number.isFinite(currentMileage) || currentMileage <= 0) {
      alert('Kilometerstand nicht verfügbar')
      return
    }
    try {
      await api.checkoutBooking(b.id, currentMileage, notes)
      await load()
    } catch (e: unknown) {
      const err = e as {
        response?: { status?: number; data?: { message?: string; error?: string } }
        message?: string
      }
      console.error('Checkout failed:', err)
      const status = err.response?.status
      let message = 'Unknown error'

      if (status === 409) {
        message = 'Buchung wurde bereits ausgecheckt'
      } else if (status === 400) {
        message = 'Ungültige Eingabe - bitte überprüfe deine Daten'
      } else {
        message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Unbekannter Fehler'
      }

      alert(`Check-out fehlgeschlagen: ${message}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Fahrzeugausgabe</h1>
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <label htmlFor="pickupDate" className="text-gray-200 font-medium">
            Abholdatum
          </label>
          <input
            id="pickupDate"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="input-field"
            aria-required="false"
          />
        </div>
      </div>
      {loading ? (
        <div className="text-gray-400">Daten werden geladen…</div>
      ) : (
        <>
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Bestätigte Abholungen</h2>
            {bookings.length === 0 ? (
              <div className="text-gray-400">
                Keine bestätigten Abholungen für den ausgewählten Tag.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookings.map(b => (
                  <div key={b.id} className="card">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-white font-semibold">
                          {b.vehicle.brand} {b.vehicle.model} •{' '}
                          {normalizePlate(b.vehicle.licensePlate as unknown)}
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
                          value={String(b.vehicle.mileage ?? '')}
                          readOnly
                          className="input-field"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-gray-300 mb-1 block">Zustand / Notizen</label>
                        <textarea
                          value={inputs[b.id]?.notes || ''}
                          onChange={e =>
                            setInputs({
                              ...inputs,
                              [b.id]: {
                                mileage: inputs[b.id]?.mileage || '',
                                notes: e.target.value,
                              },
                            })
                          }
                          className="input-field min-h-[80px]"
                          placeholder="Kratzer, Sauberkeit, Hinweise…"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-3">
                      <button
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={b.status !== 'BESTÄTIGT' || b.checkoutTime != null}
                        onClick={() => handleCheckout(b)}
                      >
                        Check-out durchführen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">Offene Anfragen</h2>
            {requests.length === 0 ? (
              <div className="text-gray-400">Keine offenen Anfragen für den ausgewählten Tag.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requests.map(b => (
                  <div key={b.id} className="card">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-white font-semibold">
                          {b.vehicle.brand} {b.vehicle.model} •{' '}
                          {normalizePlate(b.vehicle.licensePlate as unknown)}
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
                          value={String(b.vehicle.mileage ?? '')}
                          readOnly
                          className="input-field"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-gray-300 mb-1 block">Zustand / Notizen</label>
                        <textarea
                          value={inputs[b.id]?.notes || ''}
                          onChange={e =>
                            setInputs({
                              ...inputs,
                              [b.id]: {
                                mileage: inputs[b.id]?.mileage || '',
                                notes: e.target.value,
                              },
                            })
                          }
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
                            alert('Bestätigung fehlgeschlagen')
                          }
                        }}
                      >
                        Anfrage bestätigen
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
