import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Nav from './components/Nav.jsx'
import BrushCursor from './components/BrushCursor.jsx'
import Hero from './components/Hero.jsx'
import Bento from './components/Bento.jsx'
import EngineeredCold from './components/EngineeredCold.jsx'
import XRay from './components/XRay.jsx'
import Macro from './components/Macro.jsx'
import CTA from './components/CTA.jsx'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return undefined

    const lenis = new Lenis({ duration: 1.4 })
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
    <>
      <Nav />
      <BrushCursor />
      <main>
        <Hero />
        <Bento />
        <EngineeredCold />
        <XRay />
        <Macro />
        <CTA />
      </main>
    </>
  )
}
