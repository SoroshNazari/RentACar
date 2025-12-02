import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LoadingSpinner from './components/LoadingSpinner'

// Lazy load all pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const VehicleListPage = lazy(() => import('./pages/VehicleListPage'))
const VehicleDetailPage = lazy(() => import('./pages/VehicleDetailPage'))
const BookingFlowPage = lazy(() => import('./pages/BookingFlowPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const CustomerDashboardPage = lazy(() => import('./pages/CustomerDashboardPage'))
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'))
const EmployeeCheckoutPage = lazy(() => import('./pages/EmployeeCheckoutPage'))
const EmployeeCheckinPage = lazy(() => import('./pages/EmployeeCheckinPage'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="vehicles" element={<VehicleListPage />} />
          <Route path="vehicle/:id" element={<VehicleDetailPage />} />
          <Route path="booking/:vehicleId" element={<BookingFlowPage />} />
          <Route path="dashboard" element={<CustomerDashboardPage />} />
          <Route path="employee" element={<EmployeeCheckoutPage />} />
          <Route path="employee/checkin" element={<EmployeeCheckinPage />} />
          <Route path="about" element={<AboutUsPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App

    </Suspense>
  )
}

export default App
