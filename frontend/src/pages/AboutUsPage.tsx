import { Link } from 'react-router-dom'

const AboutUsPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-8">Über RentACar</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-gray-300 mb-4">
            Gegründet im Jahr 2024 ist RentACar dein vertrauensvoller Partner für
            Premium-Autovermietung in ganz Deutschland. Unsere Mission ist es, nahtlosen und
            erschwinglichen Zugang zu einer vielfältigen Flotte von Fahrzeugen für jede Reise zu
            bieten.
          </p>
          <p className="text-gray-300 mb-6">
            Von kompakten Stadtautos bis hin zu luxuriösen SUVs bieten wir gut gewartete Fahrzeuge
            mit 24/7-Support und umfassender Versicherung. Egal ob du geschäftlich oder privat
            unterwegs bist, wir haben das perfekte Auto für dich.
          </p>
          <Link to="/vehicles" className="btn-primary">
            Unsere Flotte durchsuchen
          </Link>
        </div>
        <div className="bg-dark-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Unsere Werte</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center gap-2">
              <span className="text-primary-600">✅</span>
              <span>Kundenorientierter Service</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary-600">✅</span>
              <span>Premium-Fahrzeugflotte</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary-600">✅</span>
              <span>Transparente Preise</span>
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

