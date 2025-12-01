import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import type { Booking } from '@/types/booking'

const todayISO = () => new Date().toISOString().slice(0, 10)

const EmployeeCheckinPage = () => {
  const [date, setDate] = useState(todayISO())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [inputs, setInputs] = useState<Record<number, { mileage: string; damagePresent: boolean; damageNotes: string; damageCost: string }>>({})
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
      const data = await api.getReturns(date)
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
      const enriched = await enrichWithMileage(data)
      setBookings(enriched as any)
      setLoading(false)
    } catch (e) {
      console.error('Failed to load returns:', e)
      setLoading(false)
    }
  }

  const handleCheckin = async (b: Booking) => {
    const current = inputs[b.id] || { mileage: '', damagePresent: false, damageNotes: '', damageCost: '' }
    const mileage = parseFloat(current.mileage)
    const currentMileage = Number(((b as any).vehicle?.mileage ?? 0))
    const damageCostNum = current.damageCost ? parseFloat(current.damageCost) : undefined
    if (!Number.isFinite(mileage) || mileage <= 0) {
      alert('Please enter valid mileage')
      return
    }
    if (mileage < currentMileage) {
      alert(`Mileage must be at least ${currentMileage}`)
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
      console.error('Check-in failed:', e)
      alert('Check-in failed')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Employee Check-in</h1>
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <label className="text-gray-300">Return Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
        </div>
      </div>
      {loading ? (
        <div className="text-gray-400">Loading data…</div>
      ) : bookings.length === 0 ? (
        <div className="text-gray-400">No confirmed returns for the selected day.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((b) => (
            <div key={b.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-white font-semibold">
                    {b.vehicle.brand} {b.vehicle.model} • {normalizePlate((b as any).vehicle?.licensePlate)}
                  </div>
                  <div className="text-gray-400 text-sm">Customer #{b.customerId} • Location {b.returnLocation}</div>
                </div>
                <span className="badge">{b.status}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-300 mb-1 block">Current Mileage</label>
                  <input
                    type="number"
                    value={String(((b as any).vehicle?.mileage ?? ''))}
                    readOnly
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-gray-300 mb-1 block">Return Mileage</label>
                  <input
                    type="number"
                    min={Number(((b as any).vehicle?.mileage ?? 0))}
                    value={inputs[b.id]?.mileage || ''}
                    onChange={(e) => setInputs({
                      ...inputs,
                      [b.id]: {
                        mileage: e.target.value,
                        damagePresent: inputs[b.id]?.damagePresent || false,
                        damageNotes: inputs[b.id]?.damageNotes || '',
                        damageCost: inputs[b.id]?.damageCost || '',
                      },
                    })}
                    className="input-field"
                    placeholder={`e.g. ${Number(((b as any).vehicle?.mileage ?? 0))}`}
                  />
                </div>
                <div>
                  <label className="text-gray-300 mb-1 block">Damage present?</label>
                  <input
                    type="checkbox"
                    checked={inputs[b.id]?.damagePresent || false}
                    onChange={(e) => setInputs({
                      ...inputs,
                      [b.id]: {
                        mileage: inputs[b.id]?.mileage || '',
                        damagePresent: e.target.checked,
                        damageNotes: inputs[b.id]?.damageNotes || '',
                        damageCost: inputs[b.id]?.damageCost || '',
                      },
                    })}
                    className="w-4 h-4"
                  />
                </div>
                <div>
                  <label className="text-gray-300 mb-1 block">Damage Cost (€)</label>
                  <input
                    type="number"
                    min={0}
                    value={inputs[b.id]?.damageCost || ''}
                    onChange={(e) => setInputs({
                      ...inputs,
                      [b.id]: {
                        mileage: inputs[b.id]?.mileage || '',
                        damagePresent: inputs[b.id]?.damagePresent || false,
                        damageNotes: inputs[b.id]?.damageNotes || '',
                        damageCost: e.target.value,
                      },
                    })}
                    className="input-field"
                    placeholder="e.g. 150"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-gray-300 mb-1 block">Damage Description</label>
                  <textarea
                    value={inputs[b.id]?.damageNotes || ''}
                    onChange={(e) => setInputs({
                      ...inputs,
                      [b.id]: {
                        mileage: inputs[b.id]?.mileage || '',
                        damagePresent: inputs[b.id]?.damagePresent || false,
                        damageNotes: e.target.value,
                        damageCost: inputs[b.id]?.damageCost || '',
                      },
                    })}
                    className="input-field min-h-[80px]"
                    placeholder="Scratches, dents, interior…"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="btn-primary" onClick={() => handleCheckin(b)}>
                  Perform Check-in
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
