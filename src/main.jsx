import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider, AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/dm-sans/300.css'
import '@fontsource/dm-sans/400.css'
import './styles/global.css'
import { CLERK_ENABLED, markClerkFailed } from './lib/clerkAvailable'
import App from './App.jsx'

// Static imports of Clerk are fine — the crash only happens when
// <ClerkProvider> is rendered without a publishableKey. Guarded here.
const isCallback = window.location.pathname === '/sso-callback'

// If Clerk blows up at runtime (bad key, unauthorized domain), the site
// must still render — fall back to the app with Clerk hard-disabled.
class ClerkBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    markClerkFailed()
    return { failed: true }
  }
  render() {
    return this.state.failed ? <App key="no-clerk" /> : this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {CLERK_ENABLED ? (
      <ClerkBoundary>
        <ClerkProvider
          publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
          signInUrl="/"
          signUpUrl="/"
          afterSignInUrl="/"
          afterSignUpUrl="/"
        >
          {isCallback
            ? <AuthenticateWithRedirectCallback afterSignInUrl="/" afterSignUpUrl="/" />
            : <App />
          }
        </ClerkProvider>
      </ClerkBoundary>
    ) : (
      <App />
    )}
  </React.StrictMode>,
)
