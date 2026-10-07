import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <AuthProvider>
		<CartProvider>
        <WishlistProvider>
          <App />
        </WishlistProvider>
		</CartProvider>
      </AuthProvider>
    </SettingsProvider>
  </StrictMode>,
)
