import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useUser } from '@clerk/clerk-react'
import { CLERK_ENABLED } from './lib/clerkAvailable'
import { WaitlistProvider } from './context/WaitlistContext'
import { WaitlistModal } from './components/WaitlistModal.jsx'
import Nav from './components/Nav.jsx'
import BrushCursor from './components/BrushCursor.jsx'
import Hero from './components/Hero.jsx'
import Bento from './components/Bento.jsx'
import EngineeredCold from './components/EngineeredCold.jsx'
import XRay from './components/XRay.jsx'
import Pogo from './components/Pogo.jsx'
import Macro from './components/Macro.jsx'

gsap.registerPlugin(ScrollTrigger)

if (import.meta.env.DEV) window.__ST = ScrollTrigger

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

export default function App() {
  const [oauthJoined, setOauthJoined] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return undefined

    const lenis = new Lenis({ duration: 1.3 })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)

    return () => {
      window.removeEventListener('load', onLoad)
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  return (
    <WaitlistProvider>
      {CLERK_ENABLED && <OAuthJoinedDetector setJoined={setOauthJoined} />}
      {oauthJoined && (
        <div className="waitlist-toast" role="status">
          You're on the list — we'll be in touch.
        </div>
      )}
      <Nav />
      <BrushCursor />
      <main>
        <Hero />
        <Bento />
        <EngineeredCold />
        <XRay />
        <Pogo />
        <Macro />
        {/* sits after Macro's pin spacer, so the anchor lands where the
            finale is fully revealed */}
        <div id="preorder" aria-hidden="true" />
      </main>
      <WaitlistModal />
    </WaitlistProvider>
  )
}
