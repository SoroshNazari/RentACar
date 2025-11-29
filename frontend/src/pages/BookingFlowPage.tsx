import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
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

  useEffect(() => {
    if (vehicleId) {
      loadVehicle()
    }
    if (api.isAuthenticated()) {
      loadCustomer()
    }
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
      const username = localStorage.getItem('username') || ''
      if (username) {
        const data = await api.getCustomerByUsername(username)
        setCustomer(data)
        setCustomerDetails({
          fullName: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          driverLicense: data.driverLicenseNumber,
          address: data.address,
          billingSameAsHome: true,
        })
      }
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
    const taxes = basePrice * 0.13
    return basePrice + taxes
  }

  const handleContinueToDetails = () => {
    if (!pickupDate || !dropoffDate) {
      alert('Please select pickup and drop-off dates')
      return
    }
    setCurrentStep('details')
  }

  const handleContinueToPayment = () => {
    if (!customerDetails.fullName || !customerDetails.email || !customerDetails.phone || !customerDetails.driverLicense) {
      alert('Please fill in all required fields')
      return
    }
    setCurrentStep('payment')
  }

  const handleConfirmBooking = async () => {
    if (!vehicle || !customer) {
      alert('Please log in to complete booking')
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
      })
      navigate('/dashboard?booking=success')
    } catch (error) {
      console.error('Failed to create booking:', error)
      alert('Failed to create booking. Please try again.')
    }
  }

  const steps = [
    { number: 1, label: 'Select Dates', completed: currentStep !== 'dates', active: currentStep === 'dates' },
    { number: 2, label: 'Customer Details', completed: currentStep === 'payment', active: currentStep === 'details' },
    { number: 3, label: 'Payment', completed: false, active: currentStep === 'payment' },
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-400">Vehicle not found</p>
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
              <h2 className="text-2xl font-bold text-white mb-6">Select Your Rental Dates</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Pick-up Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Drop-off Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                      <input
                        type="date"
                        value={dropoffDate}
                        onChange={(e) => setDropoffDate(e.target.value)}
                        min={pickupDate || new Date().toISOString().split('T')[0]}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                      <input
                        type="time"
                        value={dropoffTime}
                        onChange={(e) => setDropoffTime(e.target.value)}
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
                    ← Back to Vehicle Selection
                  </button>
                  <button onClick={handleContinueToDetails} className="btn-primary">
                    Continue to Step 2 →
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'details' && (
            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-6">Enter Your Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={customerDetails.fullName}
                    onChange={(e) =>
                      setCustomerDetails({ ...customerDetails, fullName: e.target.value })
                    }
                    placeholder="John Doe"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) =>
                      setCustomerDetails({ ...customerDetails, email: e.target.value })
                    }
                    placeholder="you@example.com"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerDetails.phone}
                    onChange={(e) =>
                      setCustomerDetails({ ...customerDetails, phone: e.target.value })
                    }
                    placeholder="(123) 456-7890"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Driver's License Number
                  </label>
                  <input
                    type="text"
                    value={customerDetails.driverLicense}
                    onChange={(e) =>
                      setCustomerDetails({ ...customerDetails, driverLicense: e.target.value })
                    }
                    placeholder="D123-4567-8901"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                  <input
                    type="text"
                    value={customerDetails.address}
                    onChange={(e) =>
                      setCustomerDetails({ ...customerDetails, address: e.target.value })
                    }
                    placeholder="123 Main St, Anytown, USA"
                    className="input-field"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="billingSame"
                    checked={customerDetails.billingSameAsHome}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        billingSameAsHome: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="billingSame" className="text-gray-300">
                    Billing address is the same as my home address
                  </label>
                </div>
                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep('dates')}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    ← Back to Vehicle Selection
                  </button>
                  <button onClick={handleContinueToPayment} className="btn-primary">
                    Continue to Payment →
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'payment' && (
            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-2">Payment Details</h2>
              <p className="text-gray-400 mb-6">
                Securely enter your payment information to complete your booking.
              </p>
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    paymentMethod === 'card'
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  }`}
                >
                  Credit Card
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
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cardNumber}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, cardNumber: e.target.value })
                      }
                      placeholder="0000 0000 0000 0000"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cardholderName}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, cardholderName: e.target.value })
                      }
                      placeholder="John Doe"
                      className="input-field"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Expiration Date
                      </label>
                      <input
                        type="text"
                        value={cardDetails.expiryDate}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, expiryDate: e.target.value })
                        }
                        placeholder="MM/YY"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">CVV</label>
                      <input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, cvv: e.target.value })
                        }
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
                      Billing address is the same as contact address
                    </label>
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <div className="flex items-center gap-2 text-green-400">
                      <span>🛡️</span>
                      <span className="text-sm">SSL Secured Payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                      <span>🔒</span>
                      <span className="text-sm">Your information is protected</span>
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
            <h3 className="text-xl font-bold text-white mb-4">Your Booking Summary</h3>
            <div className="aspect-video bg-dark-700 rounded-lg mb-4 overflow-hidden">
              {vehicle.imageUrl ? (
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-6xl flex items-center justify-center h-full">🚗</span>'
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
            <p className="text-gray-400 mb-4">or similar | Premium Electric</p>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-400">Pickup</p>
                <p className="text-white font-semibold">{vehicle.location}</p>
                {pickupDate && (
                  <p className="text-gray-400 text-sm">
                    {new Date(pickupDate).toLocaleDateString()}, {pickupTime}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-400">Drop-off</p>
                <p className="text-white font-semibold">{vehicle.location}</p>
                {dropoffDate && (
                  <p className="text-gray-400 text-sm">
                    {new Date(dropoffDate).toLocaleDateString()}, {dropoffTime}
                  </p>
                )}
              </div>
            </div>
            <div className="border-t border-dark-600 pt-4 space-y-2">
              {pickupDate && dropoffDate && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rental Cost</span>
                    <span className="text-white">
                      ${(calculateTotal() / 1.13).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taxes & Fees</span>
                    <span className="text-white">
                      ${(calculateTotal() * 0.13).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-dark-600">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-white font-bold text-xl">
                      ${calculateTotal().toFixed(2)}
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
                Confirm & Pay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingFlowPage

