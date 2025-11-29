import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import VehicleListPage from './pages/VehicleListPage'
import VehicleDetailPage from './pages/VehicleDetailPage'
import BookingFlowPage from './pages/BookingFlowPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CustomerDashboardPage from './pages/CustomerDashboardPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="vehicles" element={<VehicleListPage />} />
        <Route path="vehicle/:id" element={<VehicleDetailPage />} />
        <Route path="booking/:vehicleId" element={<BookingFlowPage />} />
        <Route path="dashboard" element={<CustomerDashboardPage />} />
      </Route>
    </Routes>
  )
}

export default App

