import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '@/services/api'

const Layout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setIsAuthenticated(api.isAuthenticated())
    setUserRole(api.getUserRole())
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  const handleLogout = () => {
    api.logout()
    setIsAuthenticated(false)
    setUserRole(null)
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      <header className="bg-dark-800 border-b border-dark-700">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                <span className="text-white font-bold">R</span>
              </div>
              <span className="text-xl font-bold text-white">RentACar</span>
            </Link>
            <div className="flex items-center gap-6">
              {isAuthenticated ? (
                <>
                  {/* CUSTOMER: Profil */}
                  {userRole === 'ROLE_CUSTOMER' && (
                    <Link
                      to="/profile"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Profil
                    </Link>
                  )}
                  
                  {/* EMPLOYEE: Fahrzeugverwaltung, Check-in/out */}
                  {userRole === 'ROLE_EMPLOYEE' && (
                    <>
                      <Link
                        to="/employee/vehicles"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Fahrzeuge
                      </Link>
                      <Link
                        to="/employee"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Fahrzeugausgabe
                      </Link>
                      <Link
                        to="/employee/checkin"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Fahrzeugrücknahme
                      </Link>
                    </>
                  )}
                  
                  {/* ADMIN: Alle Funktionen (Fahrzeuge, Check-in/out, Dashboard) */}
                  {userRole === 'ROLE_ADMIN' && (
                    <>
                      <Link
                        to="/dashboard"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/employee/vehicles"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Fahrzeuge
                      </Link>
                      <Link
                        to="/employee"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Fahrzeugausgabe
                      </Link>
                      <Link
                        to="/employee/checkin"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Fahrzeugrücknahme
                      </Link>
                    </>
                  )}
                  
                  <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                    Über uns
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Abmelden
                  </button>
                </>
              ) : (
                <>
                  <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                    Über uns
                  </Link>
                  <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                    Anmelden
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Registrieren
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-dark-800 border-t border-dark-700 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="font-bold text-white">RentACar</span>
              </div>
              <p className="text-gray-400 text-sm">Premium Autovermietung für jede Reise.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">UNTERNEHMEN</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    Über uns
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Karriere
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Presse
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">SUPPORT</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Kontakt
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Hilfe-Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">RECHTLICHES</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    AGB
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Datenschutz
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-dark-700 text-center text-sm text-gray-400">
            © 2024 RentACar. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
