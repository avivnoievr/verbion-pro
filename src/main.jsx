import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/800.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider, AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import { CLERK_ENABLED } from './lib/clerkAvailable'
import './index.css'
import App from './App.jsx'

// Static imports of Clerk are fine — the crash only happens when <ClerkProvider>
// is rendered without a publishableKey. We guard that here.
const isCallback = window.location.pathname === '/sso-callback'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {CLERK_ENABLED ? (
      <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
        {isCallback ? <AuthenticateWithRedirectCallback /> : <App />}
      </ClerkProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
)
