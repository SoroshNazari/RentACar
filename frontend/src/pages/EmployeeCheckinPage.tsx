import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import type { Booking } from '@/types/booking'

const todayISO = () => new Date().toISOString().slice(0, 10)

const EmployeeCheckinPage = () => {
  const [date, setDate] = useState(todayISO())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [inputs, setInputs] = useState<
    Record<
      number,
      { mileage: string; damagePresent: boolean; damageNotes: string; damageCost: string }
    >
  >({})
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
      const data = await api.getReturns(date)
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
      const enriched = await enrichWithMileage(data)
      setBookings(enriched)
      setLoading(false)
    } catch (e) {
      console.error('Failed to load returns:', e)
      setLoading(false)
    }
  }

  const handleCheckin = async (b: Booking) => {
    const current = inputs[b.id] || {
      mileage: '',
      damagePresent: false,
      damageNotes: '',
      damageCost: '',
    }
    const mileage = parseFloat(current.mileage)
    const currentMileage = Number(b.vehicle.mileage ?? 0)
    const damageCostNum = current.damageCost ? parseFloat(current.damageCost) : undefined
    if (!Number.isFinite(mileage) || mileage <= 0) {
      alert('Bitte gib einen gültigen Kilometerstand ein')
      return
    }
    if (mileage < currentMileage) {
      alert(`Kilometerstand muss mindestens ${currentMileage} sein`)
      return
    }
    try {
      await api.checkinBooking(b.id, {
        mileage,
        damagePresent: current.damagePresent,
        damageNotes: current.damageNotes,
        damageCost: damageCostNum,
        actualReturnTime: new Date().toISOString(),
      })
      await load()
    } catch (e) {
      console.error('Check-in fehlgeschlagen:', e)
      alert('Check-in fehlgeschlagen')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Fahrzeugrücknahme</h1>
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <label htmlFor="returnDate" className="text-gray-200 font-medium">
            Rückgabedatum
          </label>
          <input
            id="returnDate"
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
      ) : bookings.length === 0 ? (
        <div className="text-gray-400">Keine bestätigten Rückgaben für den ausgewählten Tag.</div>
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
                    Kunde #{b.customerId} • Standort {b.returnLocation}
                  </div>
                </div>
                <span className="badge">{b.status}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-300 mb-1 block">Aktueller Kilometerstand</label>
                  <input
                    type="number"
                    value={String(b.vehicle.mileage ?? '')}
                    readOnly
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-gray-300 mb-1 block">Rückgabe-Kilometerstand</label>
                  <input
                    type="number"
                    min={Number(b.vehicle.mileage ?? 0)}
                    value={inputs[b.id]?.mileage || ''}
                    onChange={e =>
                      setInputs({
                        ...inputs,
                        [b.id]: {
                          mileage: e.target.value,
                          damagePresent: inputs[b.id]?.damagePresent || false,
                          damageNotes: inputs[b.id]?.damageNotes || '',
                          damageCost: inputs[b.id]?.damageCost || '',
                        },
                      })
                    }
                    className="input-field"
                    placeholder={`z.B. ${Number(b.vehicle.mileage ?? 0)}`}
                  />
                </div>
                <div>
                  <label className="text-gray-300 mb-1 block">Schäden vorhanden?</label>
                  <input
                    type="checkbox"
                    checked={inputs[b.id]?.damagePresent || false}
                    onChange={e =>
                      setInputs({
                        ...inputs,
                        [b.id]: {
                          mileage: inputs[b.id]?.mileage || '',
                          damagePresent: e.target.checked,
                          damageNotes: inputs[b.id]?.damageNotes || '',
                          damageCost: inputs[b.id]?.damageCost || '',
                        },
                      })
                    }
                    className="w-4 h-4"
                  />
                </div>
                <div>
                  <label className="text-gray-300 mb-1 block">Schadenskosten (€)</label>
                  <input
                    type="number"
                    min={0}
                    value={inputs[b.id]?.damageCost || ''}
                    onChange={e =>
                      setInputs({
                        ...inputs,
                        [b.id]: {
                          mileage: inputs[b.id]?.mileage || '',
                          damagePresent: inputs[b.id]?.damagePresent || false,
                          damageNotes: inputs[b.id]?.damageNotes || '',
                          damageCost: e.target.value,
                        },
                      })
                    }
                    className="input-field"
                    placeholder="z.B. 150"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-gray-300 mb-1 block">Schadensbeschreibung</label>
                  <textarea
                    value={inputs[b.id]?.damageNotes || ''}
                    onChange={e =>
                      setInputs({
                        ...inputs,
                        [b.id]: {
                          mileage: inputs[b.id]?.mileage || '',
                          damagePresent: inputs[b.id]?.damagePresent || false,
                          damageNotes: e.target.value,
                          damageCost: inputs[b.id]?.damageCost || '',
                        },
                      })
                    }
                    className="input-field min-h-[80px]"
                    placeholder="Kratzer, Dellen, Innenraum…"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="btn-primary" onClick={() => handleCheckin(b)}>
                  Check-in durchführen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EmployeeCheckinPage

                  <textarea
                    value={inputs[b.id]?.damageNotes || ''}
                    onChange={e =>
                      setInputs({
                        ...inputs,
                        [b.id]: {
                          mileage: inputs[b.id]?.mileage || '',
                          damagePresent: inputs[b.id]?.damagePresent || false,
                          damageNotes: e.target.value,
                          damageCost: inputs[b.id]?.damageCost || '',
                        },
                      })
                    }
                    className="input-field min-h-[80px]"
                    placeholder="Kratzer, Dellen, Innenraum…"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="btn-primary" onClick={() => handleCheckin(b)}>
                  Check-in durchführen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EmployeeCheckinPage
