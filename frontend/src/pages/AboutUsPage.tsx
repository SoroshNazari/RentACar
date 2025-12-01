import { Link } from 'react-router-dom'

const AboutUsPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-8">About RentACar</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-gray-300 mb-4">
            Founded in 2024, RentACar is your trusted partner for premium car rentals across Germany. Our mission is to provide seamless, affordable access to a diverse fleet of vehicles for every journey.
          </p>
          <p className="text-gray-300 mb-6">
            From compact city cars to luxury SUVs, we offer well-maintained vehicles with 24/7 support and comprehensive insurance. Whether you are traveling for business or leisure, we have the perfect car for you.
          </p>
          <Link to="/vehicles" className="btn-primary">
            Browse Our Fleet
          </Link>
        </div>
        <div className="bg-dark-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Our Values</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center gap-2">
              <span className="text-primary-600">✅</span>
              <span>Customer-Centric Service</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary-600">✅</span>
              <span>Premium Vehicle Fleet</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary-600">✅</span>
              <span>Transparent Pricing</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary-600">✅</span>
              <span>24/7 Support</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AboutUsPage

