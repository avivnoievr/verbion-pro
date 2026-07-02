import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/800.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider, AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'

const clerkKey  = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const isCallback = window.location.pathname === '/sso-callback'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkKey}>
      {isCallback ? <AuthenticateWithRedirectCallback /> : <App />}
    </ClerkProvider>
  </StrictMode>,
)
