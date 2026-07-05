import { useState, useEffect, useRef } from 'react'
import { HeroBackground }       from './components/backgrounds/HeroBackground'
import { HeroRocks }            from './components/hero/HeroRocks'
import { TransitionBackground } from './components/backgrounds/TransitionBackground'
import { ProductsBackground }   from './components/backgrounds/ProductsBackground'
import './App.css'

const PAGES = [
  { id: 'hero',     label: 'Page 1 — Hero',     bg: HeroBackground,       animate: false },
  { id: 'feature',  label: 'Page 2 — Feature',  bg: TransitionBackground, animate: true  },
  { id: 'products', label: 'Page 3 — Products', bg: ProductsBackground,   animate: false },
]

const SCROLL_DEBOUNCE = 900

export default function App() {
  const [active, setActive] = useState(0)
  const [key,    setKey]    = useState(0)
  const activeRef  = useRef(0)
  const lastScroll = useRef(0)

  const go = (nextIdx) => {
    if (nextIdx < 0 || nextIdx >= PAGES.length) return
    if (nextIdx === activeRef.current) return
    activeRef.current = nextIdx
    setActive(nextIdx)
    setKey(k => k + 1)
  }

  useEffect(() => {
    const onWheel = (e) => {
      const now = Date.now()
      if (now - lastScroll.current < SCROLL_DEBOUNCE) return
      lastScroll.current = now
      if (e.deltaY > 0) go(activeRef.current + 1)
      else              go(activeRef.current - 1)
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  const { bg: Bg, animate } = PAGES[active]

  return (
    <div className="app">

      {/* Keyed stage — remounts on every page change to replay animations */}
      <div className="app__stage" key={key}>
        <Bg animate={animate} />
        <div className="app__label">{PAGES[active].label}</div>
      </div>

      {/*
       * HeroRocks lives OUTSIDE the keyed stage so the WebGL context
       * and the 28 MB GLB are never re-parsed on navigation.
       * CSS visibility toggles it on/off.
       *
       * Video placeholder: add a /videos/ folder under public/ and
       * drop your background-removed .webm here, then uncomment the
       * <video> element below.
       */}
      <HeroRocks visible={active === 0} />

      {/* <video
        className="hero-video"
        src="/videos/bottle-clip1.webm"
        autoPlay loop muted playsInline
        style={{ display: active === 0 ? 'block' : 'none' }}
      /> */}

      {/* Navigation dots */}
      <nav className="app__nav" aria-label="Page navigation">
        {PAGES.map((p, i) => (
          <button
            key={p.id}
            className={`app__dot${active === i ? ' app__dot--active' : ''}`}
            onClick={() => go(i)}
            aria-label={p.label}
          />
        ))}
      </nav>

      {active === 0 && (
        <div className="app__scroll-hint" aria-hidden="true">scroll</div>
      )}
    </div>
  )
}
