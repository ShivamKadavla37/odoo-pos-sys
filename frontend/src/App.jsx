import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { usePOS } from './context/POSContext'
import AuthPage from './pages/AuthPage'

// Layouts & Full Views
import BackendLayout from './components/layout/BackendLayout'
import POSFrontend from './pages/frontend/POSFrontend'
import KitchenDisplay from './pages/frontend/KitchenDisplay'
import CustomerDisplay from './pages/frontend/CustomerDisplay'
import MobileOrderingPage from './pages/frontend/MobileOrderingPage'

// Backend Pages
import DashboardPage from './pages/backend/DashboardPage'
import ProductsPage from './pages/backend/ProductsPage'
import PaymentPage from './pages/backend/PaymentMethodsPage'
import FloorPlanPage from './pages/backend/FloorPlanPage'
import POSTerminalPage from './pages/backend/POSTerminalPage'
import ReportsPage from './pages/backend/ReportsPage'
import SelfOrderingPage from './pages/backend/SelfOrderingPage'

const ProtectedRoute = ({ children, requireSession = false }) => {
  const { currentUser, currentSession } = usePOS()
  if (!currentUser) return <Navigate to="/" replace />
  if (requireSession && currentSession?.status !== 'open') {
    return <Navigate to="/backend" replace />
  }
  return children
}

export default function App() {
  const { currentUser } = usePOS()

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={!currentUser ? <AuthPage /> : <Navigate to="/backend" replace />} />
        <Route path="/signup" element={!currentUser ? <AuthPage defaultIsLogin={false} /> : <Navigate to="/backend" replace />} />

        {/* Backend Routes under /backend */}
        <Route path="/backend" element={<ProtectedRoute><BackendLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="payments" element={<PaymentPage />} />
          <Route path="floors" element={<FloorPlanPage />} />
          <Route path="terminal" element={<POSTerminalPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="self-ordering" element={<SelfOrderingPage />} />
        </Route>

        {/* POS Frontend Routes */}
        <Route path="/pos" element={<ProtectedRoute requireSession><POSFrontend /></ProtectedRoute>}>
          {/* We map the internal state over to simple rendering components, or let POSFrontend handle nested routing */}
        </Route>
        <Route path="/pos/floor" element={<ProtectedRoute requireSession><POSFrontend defaultTab="table" /></ProtectedRoute>} />
        <Route path="/pos/order/:tableId" element={<ProtectedRoute requireSession><POSFrontend defaultTab="register" /></ProtectedRoute>} />
        <Route path="/pos/payment/:orderId" element={<ProtectedRoute requireSession><POSFrontend defaultTab="payment" /></ProtectedRoute>} />

        {/* Full Screen Utility Routes */}
        <Route path="/kitchen" element={<ProtectedRoute><KitchenDisplay /></ProtectedRoute>} />
        <Route path="/customer" element={<ProtectedRoute><CustomerDisplay /></ProtectedRoute>} />

        {/* Public Mobile Ordering */}
        <Route path="/order/:token" element={<MobileOrderingPageWrapper />} />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function MobileOrderingPageWrapper() {
  const token = window.location.pathname.split('/').pop()
  return <MobileOrderingPage token={token} />
}
