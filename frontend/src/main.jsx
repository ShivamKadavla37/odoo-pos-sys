import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { POSProvider } from './context/POSContext'
import { ToastContainer } from './components/ui/Toast'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <POSProvider>
      <App />
      <ToastContainer />
    </POSProvider>
  </StrictMode>,
)
