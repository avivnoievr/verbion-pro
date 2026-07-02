import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { initScroll } from './lib/scrollSetup'
import { SiteHeader } from './components/layout/SiteHeader'
import { VideoSection } from './components/VideoSection'
import { WashSection } from './components/WashSection'
import { ProductCatalog } from './components/ProductCatalog'
import { ComingSoon } from './components/ComingSoon'
import { WaitlistProvider } from './context/WaitlistContext'
import { WaitlistModal } from './components/WaitlistModal'

// Inner component so useUser() runs inside ClerkProvider
function AppContent() {
  const { isSignedIn } = useUser()
  const [oauthJoined, setOauthJoined] = useState(false)

  useEffect(() => {
    const { destroy } = initScroll()
    return destroy
  }, [])

  // Detect successful Google OAuth sign-in from the waitlist flow
  useEffect(() => {
    if (isSignedIn && sessionStorage.getItem('verbion_waitlist') === '1') {
      sessionStorage.removeItem('verbion_waitlist')
      const show = setTimeout(() => setOauthJoined(true), 0)
      const hide = setTimeout(() => setOauthJoined(false), 6100)
      return () => { clearTimeout(show); clearTimeout(hide) }
    }
  }, [isSignedIn])

  return (
    <>
      {/* Global fixed curtain for VideoSection→WashSection transition */}
      <div
        id="vs-curtain"
        style={{ position: 'fixed', inset: 0, background: '#0a0a0c', zIndex: 9999, pointerEvents: 'none', opacity: 0, willChange: 'opacity' }}
      />

      {/* Google OAuth success toast */}
      {oauthJoined && (
        <div className="waitlist-toast" role="status">
          You're on the list — we'll be in touch.
        </div>
      )}

      <SiteHeader />
      <VideoSection />
      <WashSection />
      <ProductCatalog />
      <ComingSoon />

      <WaitlistModal />
    </>
  )
}

export default function App() {
  return (
    <WaitlistProvider>
      <AppContent />
    </WaitlistProvider>
  )
}
