import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { initScroll } from './lib/scrollSetup'
import { CLERK_ENABLED } from './lib/clerkAvailable'
import { SiteHeader } from './components/layout/SiteHeader'
import { VideoSection } from './components/VideoSection'
import { WashSection } from './components/WashSection'
import { ProductCatalog } from './components/ProductCatalog'
import { ComingSoon } from './components/ComingSoon'
import { WaitlistProvider } from './context/WaitlistContext'
import { WaitlistModal } from './components/WaitlistModal'

// useUser() is only *called* inside this component, which is only *rendered*
// when CLERK_ENABLED is true and ClerkProvider is guaranteed to be in the tree.
function OAuthJoinedDetector({ setJoined }) {
  const { isSignedIn } = useUser()

  useEffect(() => {
    if (!isSignedIn || sessionStorage.getItem('verbion_waitlist') !== '1') return
    sessionStorage.removeItem('verbion_waitlist')
    const show = setTimeout(() => setJoined(true), 0)
    const hide = setTimeout(() => setJoined(false), 6100)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [isSignedIn, setJoined])

  return null
}

function AppContent() {
  const [oauthJoined, setOauthJoined] = useState(false)

  useEffect(() => {
    const { destroy } = initScroll()
    return destroy
  }, [])

  return (
    <>
      {/* Global fixed curtain for VideoSection→WashSection transition */}
      <div
        id="vs-curtain"
        style={{ position: 'fixed', inset: 0, background: '#0a0a0c', zIndex: 9999, pointerEvents: 'none', opacity: 0, willChange: 'opacity' }}
      />

      {/* Only rendered when ClerkProvider is in the tree */}
      {CLERK_ENABLED && <OAuthJoinedDetector setJoined={setOauthJoined} />}

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
