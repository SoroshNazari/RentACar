import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import ProgressIndicator from '@/components/layout/ProgressIndicator'
import type { Vehicle, Customer } from '@/types'

type BookingStep = 'dates' | 'details' | 'payment'

const BookingFlowPage = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<BookingStep>('dates')
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)

  // Step 1: Dates
  const [pickupDate, setPickupDate] = useState(searchParams.get('pickupDate') || '')
  const [pickupTime, setPickupTime] = useState('10:00')
  const [dropoffDate, setDropoffDate] = useState(searchParams.get('dropoffDate') || '')
  const [dropoffTime, setDropoffTime] = useState('10:00')

  // Step 2: Customer Details
  const [customerDetails, setCustomerDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    driverLicense: '',
    address: '',
    billingSameAsHome: true,
  })

  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card')
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
  })
  const [extras, setExtras] = useState({
    insurance: false,
    additionalDriver: false,
    childSeat: false,
  })

  useEffect(() => {
    if (vehicleId) {
      loadVehicle()
    }
    if (api.isAuthenticated()) {
      loadCustomer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId])

  const loadVehicle = async () => {
    if (!vehicleId) return
    try {
      const data = await api.getVehicleById(Number(vehicleId))
      setVehicle(data)
    } catch (error) {
      console.error('Failed to load vehicle:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCustomer = async () => {
    try {
      let data: Customer
      try {
        data = await api.getCustomerMe()
      } catch (err: unknown) {
        const username = localStorage.getItem('username') || ''
        if (!username) throw err
        data = await api.getCustomerByUsername(username)
      }
      setCustomer(data)
      setCustomerDetails({
        fullName: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        driverLicense: data.driverLicenseNumber,
        address: data.address,
        billingSameAsHome: true,
      })
    } catch (error) {
      console.error('Failed to load customer:', error)
    }
  }

  const calculateTotal = () => {
    if (!vehicle || !pickupDate || !dropoffDate) return 0
    const start = new Date(pickupDate)
    const end = new Date(dropoffDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const basePrice = days * vehicle.dailyPrice
    const extrasCost =
      days *
      ((extras.insurance ? 10 : 0) + (extras.additionalDriver ? 5 : 0) + (extras.childSeat ? 3 : 0))
    const subtotal = basePrice + extrasCost
    const taxes = subtotal * 0.13
    return subtotal + taxes
  }

  const handleContinueToDetails = () => {
    if (!pickupDate || !dropoffDate) {
      alert('Bitte wähle Abhol- und Rückgabedatum')
      return
    }
    setCurrentStep('details')
  }

  const handleContinueToPayment = () => {
    if (
      !customerDetails.fullName ||
      !customerDetails.email ||
      !customerDetails.phone ||
      !customerDetails.driverLicense
    ) {
      alert('Bitte fülle alle erforderlichen Felder aus')
      return
    }
    setCurrentStep('payment')
  }

  const handleConfirmBooking = async () => {
    if (!vehicle || !customer) {
      alert('Bitte melde dich an, um die Buchung abzuschließen')
      navigate('/login')
      return
    }

    try {
      await api.createBooking({
        customerId: customer.id,
        vehicleId: vehicle.id,
        pickupDate,
        returnDate: dropoffDate,
        pickupLocation: vehicle.location,
        returnLocation: vehicle.location,
        insurance: extras.insurance,
        additionalDriver: extras.additionalDriver,
        childSeat: extras.childSeat,
      })
      navigate('/dashboard?booking=success')
    } catch (error) {
      console.error('Failed to create booking:', error)
      alert('Buchung fehlgeschlagen. Bitte versuche es erneut.')
    }
  }

  const steps = [
    {
      number: 1,
      label: 'Datum wählen',
      completed: currentStep !== 'dates',
      active: currentStep === 'dates',
    },
    {
      number: 2,
      label: 'Kundendaten',
      completed: currentStep === 'payment',
      active: currentStep === 'details',
    },
    { number: 3, label: 'Zahlung', completed: false, active: currentStep === 'payment' },
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">Lädt...</p>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-400">Fahrzeug nicht gefunden</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressIndicator steps={steps} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 'dates' && (
            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-6">Wähle deine Mietdaten</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Abholinformationen</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="bookingPickupDate"
                        className="block text-sm font-medium text-gray-200 mb-2"
                      >
                        Datum
                      </label>
                      <input
                        id="bookingPickupDate"
                        type="date"
                        value={pickupDate}
                        onChange={e => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="input-field"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="bookingPickupTime"
                        className="block text-sm font-medium text-gray-200 mb-2"
                      >
                        Uhrzeit
                      </label>
                      <input
                        id="bookingPickupTime"
                        type="time"
                        value={pickupTime}
                        onChange={e => setPickupTime(e.target.value)}
                        className="input-field"
                        aria-required="true"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Rückgabeinformationen</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="bookingDropoffDate"
                        className="block text-sm font-medium text-gray-200 mb-2"
                      >
                        Datum
                      </label>
                      <input
                        id="bookingDropoffDate"
                        type="date"
                        value={dropoffDate}
                        onChange={e => setDropoffDate(e.target.value)}
                        min={pickupDate || new Date().toISOString().split('T')[0]}
                        className="input-field"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="bookingDropoffTime"
                        className="block text-sm font-medium text-gray-200 mb-2"
                      >
                        Time
                      </label>
                      <input
                        id="bookingDropoffTime"
                        type="time"
                        value={dropoffTime}
                        onChange={e => setDropoffTime(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => navigate(`/vehicle/${vehicleId}`)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    ← Zurück zur Fahrzeugauswahl
                  </button>
                  <button onClick={handleContinueToDetails} className="btn-primary">
                    Weiter zu Schritt 2 →
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'details' && (
            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-6">Gib deine Daten ein</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vollständiger Name
                  </label>
                  <input
                    type="text"
                    value={customerDetails.fullName}
                    onChange={e =>
                      setCustomerDetails({ ...customerDetails, fullName: e.target.value })
                    }
                    placeholder="Max Mustermann"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    value={customerDetails.email}
                    onChange={e =>
                      setCustomerDetails({ ...customerDetails, email: e.target.value })
                    }
                    placeholder="max@example.com"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telefonnummer
                  </label>
                  <input
                    type="tel"
                    value={customerDetails.phone}
                    onChange={e =>
                      setCustomerDetails({ ...customerDetails, phone: e.target.value })
                    }
                    placeholder="+49 123 456789"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Führerscheinnummer
                  </label>
                  <input
                    type="text"
                    value={customerDetails.driverLicense}
                    onChange={e =>
                      setCustomerDetails({ ...customerDetails, driverLicense: e.target.value })
                    }
                    placeholder="B123456789"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={customerDetails.address}
                    onChange={e =>
                      setCustomerDetails({ ...customerDetails, address: e.target.value })
                    }
                    placeholder="Musterstraße 1, 12345 Berlin"
                    className="input-field"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="billingSame"
                    checked={customerDetails.billingSameAsHome}
                    onChange={e =>
                      setCustomerDetails({
                        ...customerDetails,
                        billingSameAsHome: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="billingSame" className="text-gray-300">
                    Rechnungsadresse entspricht Lieferadresse
                  </label>
                </div>
                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep('dates')}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    ← Zurück
                  </button>
                  <button onClick={handleContinueToPayment} className="btn-primary">
                    Weiter zur Zahlung →
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'payment' && (
            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-2">Zahlungsdetails</h2>
              <p className="text-gray-400 mb-6">
                Gib deine Zahlungsinformationen sicher ein, um deine Buchung abzuschließen.
              </p>
              <div className="bg-dark-700 rounded-lg p-4 border border-dark-600 mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Extras</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Versicherung (+10€/Tag)</span>
                    <input
                      type="checkbox"
                      checked={extras.insurance}
                      onChange={e => setExtras({ ...extras, insurance: e.target.checked })}
                      className="w-4 h-4"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Zusätzlicher Fahrer (+5€/Tag)</span>
                    <input
                      type="checkbox"
                      checked={extras.additionalDriver}
                      onChange={e => setExtras({ ...extras, additionalDriver: e.target.checked })}
                      className="w-4 h-4"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Kindersitz (+3€/Tag)</span>
                    <input
                      type="checkbox"
                      checked={extras.childSeat}
                      onChange={e => setExtras({ ...extras, childSeat: e.target.checked })}
                      className="w-4 h-4"
                    />
                  </label>
                </div>
              </div>
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    paymentMethod === 'card'
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  }`}
                >
                  Kreditkarte
                </button>
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    paymentMethod === 'paypal'
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  }`}
                >
                  PayPal
                </button>
              </div>
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Kartennummer
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cardNumber}
                      onChange={e => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                      placeholder="0000 0000 0000 0000"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name auf der Karte
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cardholderName}
                      onChange={e =>
                        setCardDetails({ ...cardDetails, cardholderName: e.target.value })
                      }
                      placeholder="Max Mustermann"
                      className="input-field"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ablaufdatum
                      </label>
                      <input
                        type="text"
                        value={cardDetails.expiryDate}
                        onChange={e =>
                          setCardDetails({ ...cardDetails, expiryDate: e.target.value })
                        }
                        placeholder="MM/JJ"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">CVV</label>
                      <input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        placeholder="..."
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="billingSamePayment"
                      defaultChecked
                      className="w-4 h-4"
                    />
                    <label htmlFor="billingSamePayment" className="text-gray-300">
                      Rechnungsadresse entspricht Kontaktadresse
                    </label>
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <div className="flex items-center gap-2 text-green-400">
                      <span>🛡️</span>
                      <span className="text-sm">SSL-verschlüsselte Zahlung</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                      <span>🔒</span>
                      <span className="text-sm">Deine Daten sind geschützt</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h3 className="text-xl font-bold text-white mb-4">Deine Buchungsübersicht</h3>
            <div className="aspect-video bg-dark-700 rounded-lg mb-4 overflow-hidden">
              {vehicle.imageUrl ? (
                <img
                  src={
                    (vehicle.imageUrl.startsWith('http')
                      ? `/api/assets/image?url=${encodeURIComponent(normalizeImageUrl(vehicle.imageUrl))}`
                      : vehicle.imageUrl) || ''
                  }
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                  onError={e => {
                    const img = e.currentTarget
                    const raw = vehicle.imageUrl
                    if (img.src.startsWith('/api/assets/image') && raw) {
                      img.src = raw
                      img.onerror = () => {
                        img.style.display = 'none'
                        if (img.parentElement) {
                          img.parentElement.innerHTML =
                            '<span class="text-6xl flex items-center justify-center h-full">🚗</span>'
                        }
                      }
                    } else {
                      img.style.display = 'none'
                      if (img.parentElement) {
                        img.parentElement.innerHTML =
                          '<span class="text-6xl flex items-center justify-center h-full">🚗</span>'
                      }
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">🚗</span>
                </div>
              )}
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              {vehicle.brand} {vehicle.model}
            </h4>
            <p className="text-gray-400 mb-4">oder ähnlich | Premium Elektro</p>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-400">Abholung</p>
                <p className="text-white font-semibold">{vehicle.location}</p>
                {pickupDate && (
                  <p className="text-gray-400 text-sm">
                    {new Date(pickupDate).toLocaleDateString('de-DE')}, {pickupTime}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-400">Rückgabe</p>
                <p className="text-white font-semibold">{vehicle.location}</p>
                {dropoffDate && (
                  <p className="text-gray-400 text-sm">
                    {new Date(dropoffDate).toLocaleDateString('de-DE')}, {dropoffTime}
                  </p>
                )}
              </div>
            </div>
            <div className="border-t border-dark-600 pt-4 space-y-2">
              {pickupDate && dropoffDate && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mietkosten</span>
                    <span className="text-white">
                      {(() => {
                        const start = new Date(pickupDate)
                        const end = new Date(dropoffDate)
                        const days =
                          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
                        const base = (vehicle?.dailyPrice || 0) * days
                        return formatCurrency(base)
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Extras</span>
                    <span className="text-white">
                      {(() => {
                        const start = new Date(pickupDate)
                        const end = new Date(dropoffDate)
                        const days =
                          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
                        const extrasCost =
                          days *
                          ((extras.insurance ? 10 : 0) +
                            (extras.additionalDriver ? 5 : 0) +
                            (extras.childSeat ? 3 : 0))
                        return formatCurrency(extrasCost)
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Steuern & Gebühren</span>
                    <span className="text-white">{formatCurrency(calculateTotal() * 0.13)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-dark-600">
                    <span className="text-white font-bold">Gesamt</span>
                    <span className="text-white font-bold text-xl">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </>
              )}
            </div>
            {currentStep === 'payment' && (
              <button
                onClick={handleConfirmBooking}
                className="btn-primary w-full mt-6 text-lg py-4"
              >
                Bestätigen & Bezahlen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingFlowPage
const normalizeImageUrl = (raw: string | undefined) => {
  if (!raw) return ''
  try {
    const u = new URL(raw)
    if (u.host === 'images.unsplash.com' && !u.searchParams.has('ixlib')) {
      u.searchParams.set('ixlib', 'rb-4.0.3')
      u.searchParams.set('auto', 'format')
      u.searchParams.set('fit', 'crop')
      if (!u.searchParams.has('w')) u.searchParams.set('w', '800')
      if (!u.searchParams.has('q')) u.searchParams.set('q', '80')
      return u.toString()
    }
    return raw
  } catch {
    return raw
  }
}

                        const extrasCost =
                          days *
                          ((extras.insurance ? 10 : 0) +
                            (extras.additionalDriver ? 5 : 0) +
                            (extras.childSeat ? 3 : 0))
                        return formatCurrency(extrasCost)
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Steuern & Gebühren</span>
                    <span className="text-white">{formatCurrency(calculateTotal() * 0.13)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-dark-600">
                    <span className="text-white font-bold">Gesamt</span>
                    <span className="text-white font-bold text-xl">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </>
              )}
            </div>
            {currentStep === 'payment' && (
              <button
                onClick={handleConfirmBooking}
                className="btn-primary w-full mt-6 text-lg py-4"
              >
                Bestätigen & Bezahlen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingFlowPage
const normalizeImageUrl = (raw: string | undefined) => {
  if (!raw) return ''
  try {
    const u = new URL(raw)
    if (u.host === 'images.unsplash.com' && !u.searchParams.has('ixlib')) {
      u.searchParams.set('ixlib', 'rb-4.0.3')
      u.searchParams.set('auto', 'format')
      u.searchParams.set('fit', 'crop')
      if (!u.searchParams.has('w')) u.searchParams.set('w', '800')
      if (!u.searchParams.has('q')) u.searchParams.set('q', '80')
      return u.toString()
    }
    return raw
  } catch {
    return raw
  }
}
